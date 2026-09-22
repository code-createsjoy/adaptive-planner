package com.adaptive.planner.service;

import com.adaptive.planner.dto.CognitiveLoadAssessmentDto;
import com.adaptive.planner.dto.QuickRebalanceProposalDto;
import com.adaptive.planner.dto.RebalanceOptionDto;
import com.adaptive.planner.dto.RebalanceOptionDto.OptionDiffDto;
import com.adaptive.planner.dto.TimeBlockDto;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.repository.TimeBlockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuickRebalanceService {

    private final TimeBlockRepository timeBlockRepository;
    private final CognitiveLoadEvaluationService evaluationService;

    private static final String DEFAULT_USER_ID = "default-user";

    @Transactional(readOnly = true)
    public QuickRebalanceProposalDto generateRebalanceOptions(String userId, LocalDate date) {
        String effectiveUser = (userId != null && !userId.isBlank()) ? userId : DEFAULT_USER_ID;
        CognitiveLoadAssessmentDto assessment = evaluationService.evaluateSchedule(effectiveUser, date);
        List<TimeBlockEntity> originalBlocks = timeBlockRepository.findByDateOrderByStartTimeAsc(date);

        List<RebalanceOptionDto> options = new ArrayList<>();

        if (originalBlocks.isEmpty()) {
            return QuickRebalanceProposalDto.builder()
                    .date(date.toString())
                    .loadScore(assessment.getScore())
                    .options(List.of())
                    .build();
        }

        // Option A: Add Breathing Room (Insert 15 min buffer after meeting or dense focus)
        options.add(createAddBufferOption(originalBlocks));

        // Option B: Move a Flexible Task (Defer non-urgent block to tomorrow)
        options.add(createMoveFlexibleTaskOption(originalBlocks, date));

        // Option C: Reduce Context Switching (Group similar categories together)
        options.add(createReduceContextSwitchOption(originalBlocks));

        return QuickRebalanceProposalDto.builder()
                .date(date.toString())
                .loadScore(assessment.getScore())
                .options(options)
                .build();
    }

    private RebalanceOptionDto createAddBufferOption(List<TimeBlockEntity> original) {
        List<TimeBlockDto> proposed = original.stream().map(this::toDto).collect(Collectors.toList());
        int movedCount = 0;

        // Find candidate block (after 1st meeting or after mid-day block) to add 15 min gap
        if (proposed.size() >= 2) {
            int targetIdx = Math.min(1, proposed.size() - 2);
            TimeBlockDto target = proposed.get(targetIdx);

            int startPushFrom = timeToMinutes(target.getEndTime());
            for (int i = targetIdx + 1; i < proposed.size(); i++) {
                TimeBlockDto b = proposed.get(i);
                int curStart = timeToMinutes(b.getStartTime());
                int curEnd = timeToMinutes(b.getEndTime());
                int dur = curEnd - curStart;

                int newStart = curStart + 15;
                int newEnd = newStart + dur;
                b.setStartTime(minutesToTime(newStart));
                b.setEndTime(minutesToTime(newEnd));
                movedCount++;
            }
        }

        return RebalanceOptionDto.builder()
                .id("option-add-buffer")
                .type("ADD_BUFFER")
                .title("☕ Insert Breathing Room (Buffer Recovery)")
                .description("Automatically insert 15-minute recovery buffers after high-focus blocks to relieve transition fatigue.")
                .estimatedLoadReduction(18)
                .diff(OptionDiffDto.builder()
                        .movedBlockCount(movedCount)
                        .bufferAddedMinutes(15)
                        .deferredBlockCount(0)
                        .build())
                .proposedBlocks(proposed)
                .build();
    }

    private RebalanceOptionDto createMoveFlexibleTaskOption(List<TimeBlockEntity> original, LocalDate date) {
        List<TimeBlockDto> proposed = new ArrayList<>();
        int deferredCount = 0;
        String movedTitle = "flexible task";

        // Look for the lowest priority / flexible / non-urgent block
        TimeBlockEntity candidate = null;
        for (int i = original.size() - 1; i >= 0; i--) {
            TimeBlockEntity b = original.get(i);
            String priority = b.getPriority() != null ? b.getPriority().toUpperCase() : "NORMAL";
            String cat = b.getCategory() != null ? b.getCategory().toLowerCase() : "work";
            if (!priority.contains("PROTECTED") && !cat.contains("meeting") && !cat.contains("urgent")) {
                candidate = b;
                break;
            }
        }

        if (candidate == null && !original.isEmpty()) {
            candidate = original.get(original.size() - 1);
        }

        for (TimeBlockEntity b : original) {
            if (candidate != null && b.getId() != null && b.getId().equals(candidate.getId())) {
                deferredCount++;
                movedTitle = b.getTitle();
                // Defer to tomorrow
            } else {
                proposed.add(toDto(b));
            }
        }

        return RebalanceOptionDto.builder()
                .id("option-move-flexible")
                .type("MOVE_FLEXIBLE_TASK")
                .title("→ Defer flexible task to tomorrow morning")
                .description(String.format("Move '%s' to tomorrow at 09:00 to reduce afternoon workload pressure.", movedTitle))
                .estimatedLoadReduction(24)
                .diff(OptionDiffDto.builder()
                        .movedBlockCount(0)
                        .bufferAddedMinutes(45)
                        .deferredBlockCount(deferredCount)
                        .build())
                .proposedBlocks(proposed)
                .build();
    }

    private RebalanceOptionDto createReduceContextSwitchOption(List<TimeBlockEntity> original) {
        // Group by category: work first, then social/meeting, then others
        List<TimeBlockEntity> sorted = new ArrayList<>(original);
        sorted.sort(Comparator.comparing((TimeBlockEntity b) -> {
            String cat = b.getCategory() != null ? b.getCategory().toLowerCase() : "work";
            if (cat.contains("work")) return 1;
            if (cat.contains("social") || cat.contains("meeting")) return 2;
            if (cat.contains("health")) return 3;
            return 4;
        }));

        List<TimeBlockDto> proposed = new ArrayList<>();
        int currentStart = original.isEmpty() ? 540 : timeToMinutes(original.get(0).getStartTime());
        int movedCount = 0;

        for (int i = 0; i < sorted.size(); i++) {
            TimeBlockEntity orig = sorted.get(i);
            int dur = timeToMinutes(orig.getEndTime()) - timeToMinutes(orig.getStartTime());
            dur = Math.max(30, dur);

            TimeBlockDto dto = toDto(orig);
            String newStartStr = minutesToTime(currentStart);
            String newEndStr = minutesToTime(currentStart + dur);

            if (!newStartStr.equals(dto.getStartTime())) {
                movedCount++;
            }
            dto.setStartTime(newStartStr);
            dto.setEndTime(newEndStr);
            proposed.add(dto);

            currentStart += dur + 10; // 10 min inter-task buffer
        }

        return RebalanceOptionDto.builder()
                .id("option-reduce-context-switch")
                .type("REDUCE_CONTEXT_SWITCH")
                .title("🔄 Batch similar tasks (Task Batching)")
                .description("Group related activities together to minimize mental context switching.")
                .estimatedLoadReduction(16)
                .diff(OptionDiffDto.builder()
                        .movedBlockCount(movedCount)
                        .bufferAddedMinutes(20)
                        .deferredBlockCount(0)
                        .build())
                .proposedBlocks(proposed)
                .build();
    }

    private TimeBlockDto toDto(TimeBlockEntity entity) {
        return TimeBlockDto.builder()
                .id(entity.getId() != null ? String.valueOf(entity.getId()) : null)
                .title(entity.getTitle())
                .detail(entity.getDetail())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .category(entity.getCategory())
                .energyLevel(entity.getEnergyLevel())
                .priority(entity.getPriority())
                .deadline(entity.getDeadline())
                .isMovable(entity.getIsMovable())
                .status(entity.getStatus())
                .date(entity.getDate())
                .isCompleted(Boolean.TRUE.equals(entity.getIsCompleted()))
                .build();
    }

    private int timeToMinutes(String timeStr) {
        if (timeStr == null || !timeStr.contains(":")) return 0;
        try {
            String[] parts = timeStr.trim().split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception e) {
            return 0;
        }
    }

    private String minutesToTime(int totalMinutes) {
        int normalized = Math.max(0, totalMinutes % (24 * 60));
        int h = normalized / 60;
        int m = normalized % 60;
        return String.format("%02d:%02d", h, m);
    }
}
