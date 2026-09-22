package com.adaptive.planner.service;

import com.adaptive.planner.config.InsightsProperties;
import com.adaptive.planner.dto.CreateNotificationRequest;
import com.adaptive.planner.dto.insights.SaveExperimentRequest;
import com.adaptive.planner.dto.insights.WeeklyInsightsResponse;
import com.adaptive.planner.dto.insights.WeeklyInsightsResponse.Recommendation;
import com.adaptive.planner.entity.InsightExperimentEntity;
import com.adaptive.planner.exception.ConflictException;
import com.adaptive.planner.repository.InsightExperimentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InsightExperimentService {

    private final InsightExperimentRepository experimentRepository;
    private final WeeklyInsightsService weeklyInsightsService;
    private final NotificationService notificationService;
    private final InsightsProperties properties;

    @Transactional
    public InsightExperimentEntity saveExperiment(SaveExperimentRequest request) {
        String userKey = properties.canonicalUserKey();
        LocalDate sourceWeek = request.sourceWeek();
        String ruleKey = request.ruleKey();
        String fingerprint = request.evidenceFingerprint();

        // Check if already saved (idempotent)
        Optional<InsightExperimentEntity> existing = experimentRepository
                .findByCanonicalUserKeyAndSourceWeekAndRuleKeyAndEvidenceFingerprint(userKey, sourceWeek, ruleKey, fingerprint);
        if (existing.isPresent()) {
            InsightExperimentEntity entity = existing.get();
            if ("DISMISSED".equalsIgnoreCase(entity.getStatus())) {
                entity.setStatus("SAVED");
                return experimentRepository.save(entity);
            }
            return entity;
        }

        // Validate that recommendation exists and fingerprint matches current evidence
        WeeklyInsightsResponse weeklyResponse = weeklyInsightsService.getWeeklyInsights(sourceWeek);
        Recommendation matchedRec = weeklyResponse.recommendations().stream()
                .filter(r -> r.ruleKey().equalsIgnoreCase(ruleKey) && r.evidenceFingerprint().equalsIgnoreCase(fingerprint))
                .findFirst()
                .orElseThrow(() -> new ConflictException("Khuyến nghị thử nghiệm đã hết hạn hoặc bằng chứng đã thay đổi"));

        LocalDate nextMonday = sourceWeek.plusWeeks(1);
        LocalDateTime reminderInstant = LocalDateTime.of(nextMonday, LocalTime.of(9, 0));

        InsightExperimentEntity entity = InsightExperimentEntity.builder()
                .canonicalUserKey(userKey)
                .sourceWeek(sourceWeek)
                .ruleKey(ruleKey)
                .evidenceFingerprint(fingerprint)
                .title(matchedRec.title())
                .rationale(matchedRec.rationale())
                .measurableAction(matchedRec.measurableAction())
                .reminderDate(nextMonday)
                .status("SAVED")
                .build();

        entity = experimentRepository.save(entity);

        // Schedule notification for next Monday 09:00 exactly once
        String eventKey = "INSIGHT_EXPERIMENT_REMINDER:" + userKey + ":" + sourceWeek + ":" + ruleKey;
        CreateNotificationRequest notifRequest = CreateNotificationRequest.builder()
                .userId(userKey)
                .type("INSIGHT_REMINDER")
                .priority("NORMAL")
                .title("Thử nghiệm tuần mới: " + matchedRec.title())
                .message(matchedRec.measurableAction())
                .actionType("OPEN_INSIGHTS")
                .actionData("{\"sourceWeek\":\"" + sourceWeek + "\"}")
                .eventKey(eventKey)
                .scheduledFor(reminderInstant)
                .build();

        notificationService.createNotification(notifRequest);
        log.info("Saved experiment [id={}, ruleKey={}] and scheduled reminder for {}", entity.getId(), ruleKey, reminderInstant);

        return entity;
    }

    @Transactional
    public void dismissExperiment(SaveExperimentRequest request) {
        String userKey = properties.canonicalUserKey();
        Optional<InsightExperimentEntity> existing = experimentRepository
                .findByCanonicalUserKeyAndSourceWeekAndRuleKeyAndEvidenceFingerprint(
                        userKey, request.sourceWeek(), request.ruleKey(), request.evidenceFingerprint()
                );

        if (existing.isPresent()) {
            InsightExperimentEntity entity = existing.get();
            entity.setStatus("DISMISSED");
            experimentRepository.save(entity);
        } else {
            InsightExperimentEntity entity = InsightExperimentEntity.builder()
                    .canonicalUserKey(userKey)
                    .sourceWeek(request.sourceWeek())
                    .ruleKey(request.ruleKey())
                    .evidenceFingerprint(request.evidenceFingerprint())
                    .title("Dismissed experiment")
                    .reminderDate(request.sourceWeek().plusWeeks(1))
                    .status("DISMISSED")
                    .build();
            experimentRepository.save(entity);
        }
    }
}
