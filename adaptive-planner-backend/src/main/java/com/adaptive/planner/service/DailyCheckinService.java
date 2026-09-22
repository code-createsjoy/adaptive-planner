package com.adaptive.planner.service;

import com.adaptive.planner.dto.CyclePredictionDto;
import com.adaptive.planner.dto.DailyCheckinDto;
import com.adaptive.planner.dto.ProactiveAdaptationRequest;
import com.adaptive.planner.dto.ProactiveAdaptationResponse;
import com.adaptive.planner.entity.DailyCheckinEntity;
import com.adaptive.planner.entity.PeriodFlow;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.repository.DailyCheckinRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyCheckinService {

    private final DailyCheckinRepository dailyCheckinRepository;
    private final CyclePredictionService cyclePredictionService;
    private final TimeBlockRepository timeBlockRepository;

    @Transactional
    public DailyCheckinDto upsertCheckin(String userId, DailyCheckinDto dto) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "default-user";
        LocalDate checkinDate = dto.getCheckinDate() != null ? dto.getCheckinDate() : LocalDate.now();

        Optional<DailyCheckinEntity> existingOpt = dailyCheckinRepository.findByUserIdAndCheckinDate(effectiveUserId, checkinDate);

        DailyCheckinEntity entity;
        if (existingOpt.isPresent()) {
            entity = existingOpt.get();
            entity.setMoodEmoji(dto.getMoodEmoji());
            entity.setMoodLabel(dto.getMoodLabel());
            entity.setEnergyLevel(dto.getEnergyLevel());
            entity.setNote(dto.getNote());
            entity.setIsPeriodDay(Boolean.TRUE.equals(dto.getIsPeriodDay()));
            entity.setFlowIntensity(dto.getFlowIntensity() != null ? dto.getFlowIntensity() : PeriodFlow.NONE);
        } else {
            entity = DailyCheckinEntity.builder()
                    .userId(effectiveUserId)
                    .checkinDate(checkinDate)
                    .moodEmoji(dto.getMoodEmoji())
                    .moodLabel(dto.getMoodLabel())
                    .energyLevel(dto.getEnergyLevel())
                    .note(dto.getNote())
                    .isPeriodDay(Boolean.TRUE.equals(dto.getIsPeriodDay()))
                    .flowIntensity(dto.getFlowIntensity() != null ? dto.getFlowIntensity() : PeriodFlow.NONE)
                    .build();
        }

        DailyCheckinEntity saved = dailyCheckinRepository.save(entity);
        log.info("Saved daily checkin for user {} on {}: mood={}, energy={}, isPeriod={}",
                effectiveUserId, checkinDate, saved.getMoodEmoji(), saved.getEnergyLevel(), saved.getIsPeriodDay());
        return DailyCheckinDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Optional<DailyCheckinDto> getCheckinByDate(String userId, LocalDate date) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "default-user";
        return dailyCheckinRepository.findByUserIdAndCheckinDate(effectiveUserId, date)
                .map(DailyCheckinDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<DailyCheckinDto> getCheckinsInRange(String userId, LocalDate startDate, LocalDate endDate) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "default-user";
        return dailyCheckinRepository.findByUserIdAndCheckinDateBetweenOrderByCheckinDateAsc(effectiveUserId, startDate, endDate)
                .stream()
                .map(DailyCheckinDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public CyclePredictionDto getCyclePredictions(String userId) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "default-user";
        List<DailyCheckinEntity> periodLogs = dailyCheckinRepository.findByUserIdAndIsPeriodDayTrueOrderByCheckinDateAsc(effectiveUserId);
        return cyclePredictionService.predictUpcomingCycles(periodLogs, LocalDate.now());
    }

    @Transactional
    public void deleteCheckinByDate(String userId, LocalDate date) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "default-user";
        dailyCheckinRepository.deleteByUserIdAndCheckinDate(effectiveUserId, date);
        log.info("Deleted daily checkin for user {} on {}", effectiveUserId, date);
    }

    @Transactional
    public void deleteCheckinById(String userId, Long id) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "default-user";
        dailyCheckinRepository.findById(id).ifPresent(entity -> {
            if (effectiveUserId.equals(entity.getUserId())) {
                dailyCheckinRepository.delete(entity);
                log.info("Deleted daily checkin id {} for user {}", id, effectiveUserId);
            }
        });
    }

    @Transactional(readOnly = true)
    public ProactiveAdaptationResponse evaluateProactiveAdaptation(String userId, ProactiveAdaptationRequest request) {
        if (request == null || request.getCheckinDate() == null) {
            return ProactiveAdaptationResponse.builder()
                    .hasRecommendation(false)
                    .reason("Không có dữ liệu ngày kiểm tra.")
                    .heavyBlockIds(Collections.emptyList())
                    .proposedChangesSummary(Collections.emptyList())
                    .build();
        }

        boolean isLowEnergy = request.getEnergyLevel() != null && request.getEnergyLevel() <= 2;
        boolean isPeriod = Boolean.TRUE.equals(request.getIsPeriodDay());

        if (!isLowEnergy && !isPeriod) {
            return ProactiveAdaptationResponse.builder()
                    .hasRecommendation(false)
                    .reason("Mức năng lượng ổn định.")
                    .heavyBlockIds(Collections.emptyList())
                    .proposedChangesSummary(Collections.emptyList())
                    .build();
        }

        List<TimeBlockEntity> dayBlocks = timeBlockRepository.findByDateOrderByStartTimeAsc(request.getCheckinDate());
        if (dayBlocks == null || dayBlocks.isEmpty()) {
            return ProactiveAdaptationResponse.builder()
                    .hasRecommendation(false)
                    .reason("Ngày hôm nay chưa có lịch trình nào cần điều chỉnh.")
                    .heavyBlockIds(Collections.emptyList())
                    .proposedChangesSummary(Collections.emptyList())
                    .build();
        }

        List<TimeBlockEntity> heavyBlocks = dayBlocks.stream()
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .filter(b -> !Boolean.TRUE.equals(b.getIsCompleted()))
                .filter(b -> "work".equalsIgnoreCase(b.getCategory())
                        || "urgent".equalsIgnoreCase(b.getCategory())
                        || "high".equalsIgnoreCase(b.getEnergyLevel()))
                .toList();

        if (heavyBlocks.isEmpty()) {
            return ProactiveAdaptationResponse.builder()
                    .hasRecommendation(false)
                    .reason("Lịch trình hôm nay đã nhẹ nhàng và phù compliance với thể trạng hiện tại.")
                    .heavyBlockIds(Collections.emptyList())
                    .proposedChangesSummary(Collections.emptyList())
                    .build();
        }

        List<Long> heavyBlockIds = heavyBlocks.stream().map(TimeBlockEntity::getId).toList();
        List<String> summaries = new ArrayList<>();

        for (TimeBlockEntity block : heavyBlocks) {
            summaries.add("Chuyển task \"" + block.getTitle() + "\" (" + block.getStartTime() + " - " + block.getEndTime() + ") sang Tomorrow Inbox để giảm tải");
        }

        String reason;
        if (isLowEnergy && isPeriod) {
            reason = "Bạn đang trong ngày chu kỳ và có mức năng lượng thấp (≤ 2/5). AI đề xuất dời " + heavyBlocks.size() + " tác vụ tập trung cao sang ngày khác và thêm khoảng nghỉ.";
        } else if (isPeriod) {
            reason = "Hôm nay là ngày chu kỳ kinh nguyệt (🩸). AI đề xuất dời " + heavyBlocks.size() + " task tiêu hao nhiều năng lượng để ưu tiên sức khỏe và nghỉ ngơi.";
        } else {
            reason = "Mức năng lượng hôm nay ở mức thấp (≤ 2/5). AI đề xuất giảm tải " + heavyBlocks.size() + " task nặng để tránh kiệt sức.";
        }

        return ProactiveAdaptationResponse.builder()
                .hasRecommendation(true)
                .reason(reason)
                .suggestedAction("DEFER_HEAVY_TASKS")
                .heavyBlockIds(heavyBlockIds)
                .proposedChangesSummary(summaries)
                .build();
    }
}
