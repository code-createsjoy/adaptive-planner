package com.adaptive.planner.service;

import com.adaptive.planner.config.InsightsProperties;
import com.adaptive.planner.dto.insights.SaveExperimentRequest;
import com.adaptive.planner.dto.insights.WeeklyInsightsResponse;
import com.adaptive.planner.dto.insights.WeeklyInsightsResponse.*;
import com.adaptive.planner.entity.InsightExperimentEntity;
import com.adaptive.planner.exception.ConflictException;
import com.adaptive.planner.repository.InsightExperimentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InsightExperimentServiceTest {

    @Mock
    private InsightExperimentRepository experimentRepository;

    @Mock
    private WeeklyInsightsService weeklyInsightsService;

    @Mock
    private NotificationService notificationService;

    private InsightExperimentService experimentService;

    private final LocalDate sourceWeek = LocalDate.of(2026, 9, 21);
    private final String ruleKey = "DAYPART_FLOW";
    private final String fingerprint = "fp123456";

    @BeforeEach
    void setUp() {
        InsightsProperties properties = new InsightsProperties("Asia/Ho_Chi_Minh", "single-user");
        experimentService = new InsightExperimentService(
                experimentRepository,
                weeklyInsightsService,
                notificationService,
                properties
        );
    }

    @Test
    void saveExperimentSuccess() {
        SaveExperimentRequest request = new SaveExperimentRequest(sourceWeek, ruleKey, fingerprint);

        when(experimentRepository.findByCanonicalUserKeyAndSourceWeekAndRuleKeyAndEvidenceFingerprint(any(), any(), any(), any()))
                .thenReturn(Optional.empty());

        Recommendation rec = new Recommendation(ruleKey, "Ưu tiên buổi sáng", "Lý do", "Hành động", fingerprint, 5);
        WeeklyInsightsResponse weeklyResponse = new WeeklyInsightsResponse(
                sourceWeek, sourceWeek.plusDays(6), sourceWeek.plusDays(4), "Asia/Ho_Chi_Minh", "Week so far",
                new Coverage(4, 3, 10, 0, true, List.of(), List.of()),
                new Metrics(10, 8, 80, List.of(), new TransitionMetric(5, 4, 80), new AdaptationMetric(1, 0, 0)),
                List.of(),
                List.of(rec),
                null,
                new PreviousWeekComparison(false, "No prev", List.of())
        );
        when(weeklyInsightsService.getWeeklyInsights(sourceWeek)).thenReturn(weeklyResponse);

        InsightExperimentEntity savedEntity = InsightExperimentEntity.builder()
                .id(1L)
                .canonicalUserKey("single-user")
                .sourceWeek(sourceWeek)
                .ruleKey(ruleKey)
                .evidenceFingerprint(fingerprint)
                .title(rec.title())
                .status("SAVED")
                .reminderDate(sourceWeek.plusWeeks(1))
                .build();
        when(experimentRepository.save(any(InsightExperimentEntity.class))).thenReturn(savedEntity);

        InsightExperimentEntity result = experimentService.saveExperiment(request);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("SAVED");
        assertThat(result.getTitle()).isEqualTo("Ưu tiên buổi sáng");
        verify(notificationService, times(1)).createNotification(any());
    }

    @Test
    void saveExperimentThrowsConflictOnStaleFingerprint() {
        SaveExperimentRequest request = new SaveExperimentRequest(sourceWeek, ruleKey, "stale_fp");

        when(experimentRepository.findByCanonicalUserKeyAndSourceWeekAndRuleKeyAndEvidenceFingerprint(any(), any(), any(), any()))
                .thenReturn(Optional.empty());

        Recommendation rec = new Recommendation(ruleKey, "Ưu tiên buổi sáng", "Lý do", "Hành động", "fresh_fp", 5);
        WeeklyInsightsResponse weeklyResponse = new WeeklyInsightsResponse(
                sourceWeek, sourceWeek.plusDays(6), sourceWeek.plusDays(4), "Asia/Ho_Chi_Minh", "Week so far",
                new Coverage(4, 3, 10, 0, true, List.of(), List.of()),
                new Metrics(10, 8, 80, List.of(), new TransitionMetric(5, 4, 80), new AdaptationMetric(1, 0, 0)),
                List.of(),
                List.of(rec),
                null,
                new PreviousWeekComparison(false, "No prev", List.of())
        );
        when(weeklyInsightsService.getWeeklyInsights(sourceWeek)).thenReturn(weeklyResponse);

        assertThatThrownBy(() -> experimentService.saveExperiment(request))
                .isInstanceOf(ConflictException.class);

        verify(notificationService, never()).createNotification(any());
    }

    @Test
    void dismissExperimentSetsStatusToDismissed() {
        SaveExperimentRequest request = new SaveExperimentRequest(sourceWeek, ruleKey, fingerprint);

        InsightExperimentEntity existing = InsightExperimentEntity.builder()
                .id(1L)
                .canonicalUserKey("single-user")
                .sourceWeek(sourceWeek)
                .ruleKey(ruleKey)
                .evidenceFingerprint(fingerprint)
                .title("Ưu tiên buổi sáng")
                .status("SAVED")
                .reminderDate(sourceWeek.plusWeeks(1))
                .build();

        when(experimentRepository.findByCanonicalUserKeyAndSourceWeekAndRuleKeyAndEvidenceFingerprint(any(), any(), any(), any()))
                .thenReturn(Optional.of(existing));

        experimentService.dismissExperiment(request);

        verify(experimentRepository).save(argThat(entity -> "DISMISSED".equalsIgnoreCase(entity.getStatus())));
    }
}
