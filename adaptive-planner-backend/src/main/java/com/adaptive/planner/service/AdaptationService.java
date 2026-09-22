package com.adaptive.planner.service;

import com.adaptive.planner.dto.AdaptationActionDto;
import com.adaptive.planner.dto.AdaptationActionResultDto;
import com.adaptive.planner.dto.ApplyAdaptationRequest;
import com.adaptive.planner.dto.TimeBlockDto;
import com.adaptive.planner.entity.AdaptationActionEntity;
import com.adaptive.planner.exception.ResourceNotFoundException;
import com.adaptive.planner.repository.AdaptationActionRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdaptationService {

    private final AdaptationActionRepository actionRepository;
    private final TimeBlockService timeBlockService;
    private final TimeBlockRepository timeBlockRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AdaptationActionResultDto applyAdaptation(ApplyAdaptationRequest request) {
        LocalDate targetDate = request.getDate() != null ? request.getDate() : LocalDate.now();

        // 1. Snapshot BEFORE state
        List<TimeBlockDto> beforeBlocks = timeBlockService.getBlocksForDate(targetDate);
        String beforeJson = "[]";
        try {
            beforeJson = objectMapper.writeValueAsString(beforeBlocks);
        } catch (Exception e) {
            log.error("Failed to serialize before snapshot", e);
        }

        // 2. Save new blocks
        List<TimeBlockDto> appliedBlocks = new ArrayList<>();
        if (request.getNewBlocks() != null && !request.getNewBlocks().isEmpty()) {
            appliedBlocks = timeBlockService.batchApplyScenario(request.getNewBlocks());
        }

        // 3. Snapshot AFTER state
        String afterJson = "[]";
        try {
            afterJson = objectMapper.writeValueAsString(appliedBlocks);
        } catch (Exception e) {
            log.error("Failed to serialize after snapshot", e);
        }

        // 4. Save Adaptation Action Record
        AdaptationActionEntity action = AdaptationActionEntity.builder()
                .conversationId(request.getConversationId())
                .date(targetDate)
                .reason(request.getReason() != null ? request.getReason() : "Schedule adaptation applied")
                .selectedScenarioId(request.getSelectedScenarioId())
                .scenarioTitle(request.getScenarioTitle())
                .explanationJson(request.getExplanationJson())
                .beforeSnapshotJson(beforeJson)
                .afterSnapshotJson(afterJson)
                .status("APPLIED")
                .build();

        AdaptationActionEntity savedAction = actionRepository.save(action);

        return AdaptationActionResultDto.builder()
                .actionId(savedAction.getId())
                .message("Đã áp dụng điều chỉnh lịch trình thành công.")
                .status("APPLIED")
                .blocks(appliedBlocks)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdaptationActionDto> getAdaptations(LocalDate date) {
        List<AdaptationActionEntity> list = (date != null)
                ? actionRepository.findByDateOrderByCreatedAtDesc(date)
                : actionRepository.findAllByOrderByCreatedAtDesc();

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdaptationActionDto getAdaptationById(Long actionId) {
        AdaptationActionEntity entity = actionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Adaptation action not found with id: " + actionId));
        return mapToDto(entity);
    }

    @Transactional
    public AdaptationActionResultDto undoAdaptation(Long actionId) {
        AdaptationActionEntity action = actionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Adaptation action not found with id: " + actionId));

        if ("ROLLED_BACK".equalsIgnoreCase(action.getStatus()) || "UNDONE".equalsIgnoreCase(action.getStatus())) {
            return AdaptationActionResultDto.builder()
                    .actionId(action.getId())
                    .message("Hành động này đã được hoàn tác trước đó.")
                    .status("ROLLED_BACK")
                    .blocks(timeBlockService.getBlocksForDate(action.getDate()))
                    .build();
        }

        List<TimeBlockDto> restoredBlocks = new ArrayList<>();
        try {
            List<TimeBlockDto> beforeState = objectMapper.readValue(
                    action.getBeforeSnapshotJson(),
                    new TypeReference<>() {}
            );

            // Clear AI_RESCHEDULED blocks for the date and restore original blocks
            timeBlockRepository.deleteByDate(action.getDate());

            // Re-apply original custom/routine overrides
            List<TimeBlockDto> toRestore = beforeState.stream()
                    .filter(b -> b.getId() == null || !b.getId().startsWith("routine-"))
                    .toList();

            if (!toRestore.isEmpty()) {
                restoredBlocks = timeBlockService.batchApplyScenario(toRestore);
            }

            action.setStatus("ROLLED_BACK");
            actionRepository.save(action);

        } catch (Exception e) {
            log.error("Failed to deserialize and restore snapshot for action: {}", actionId, e);
            throw new RuntimeException("Rollback failed: " + e.getMessage());
        }

        return AdaptationActionResultDto.builder()
                .actionId(action.getId())
                .message("Đã hoàn tác toàn bộ điều chỉnh về trạng thái ban đầu.")
                .status("ROLLED_BACK")
                .blocks(timeBlockService.getBlocksForDate(action.getDate()))
                .build();
    }

    private AdaptationActionDto mapToDto(AdaptationActionEntity entity) {
        return AdaptationActionDto.builder()
                .id(entity.getId())
                .conversationId(entity.getConversationId())
                .date(entity.getDate())
                .reason(entity.getReason())
                .selectedScenarioId(entity.getSelectedScenarioId())
                .scenarioTitle(entity.getScenarioTitle())
                .explanationJson(entity.getExplanationJson())
                .beforeSnapshotJson(entity.getBeforeSnapshotJson())
                .afterSnapshotJson(entity.getAfterSnapshotJson())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
