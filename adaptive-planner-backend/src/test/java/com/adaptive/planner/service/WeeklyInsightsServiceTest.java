package com.adaptive.planner.service;

import com.adaptive.planner.config.InsightsProperties;
import com.adaptive.planner.dto.insights.WeeklyInsightsResponse;
import com.adaptive.planner.entity.AdaptationActionEntity;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.repository.AdaptationActionRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.adaptive.planner.repository.InsightExperimentRepository;

@ExtendWith(MockitoExtension.class)
class WeeklyInsightsServiceTest {

    @Mock
    private TimeBlockRepository timeBlockRepository;

    @Mock
    private AdaptationActionRepository adaptationActionRepository;

    @Mock
    private InsightExperimentRepository insightExperimentRepository;

    private WeeklyInsightsService weeklyInsightsService;
    private InsightsWeekSemantics semantics;

    private final LocalDate weekMonday = LocalDate.of(2026, 9, 21); // Monday
    private final LocalDate weekSunday = LocalDate.of(2026, 9, 27);

    @BeforeEach
    void setUp() {
        Clock fixedClock = Clock.fixed(Instant.parse("2026-09-25T03:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));
        InsightsProperties properties = new InsightsProperties("Asia/Ho_Chi_Minh", "single-user");
        semantics = new InsightsWeekSemantics(fixedClock, properties);
        weeklyInsightsService = new WeeklyInsightsService(timeBlockRepository, adaptationActionRepository, insightExperimentRepository, properties, semantics);
    }

    @Test
    void testGetWeeklyInsightsSufficientData() {
        // Setup 3 days of timeblocks
        TimeBlockEntity b1 = TimeBlockEntity.builder()
                .id(1L).title("Deep Work").date(LocalDate.of(2026, 9, 21)).startTime("08:00").endTime("10:00").isCompleted(true).category("work").energyLevel("high").build();
        TimeBlockEntity b2 = TimeBlockEntity.builder()
                .id(2L).title("Planning").date(LocalDate.of(2026, 9, 21)).startTime("10:15").endTime("11:00").isCompleted(true).category("work").energyLevel("medium").build();
        TimeBlockEntity b3 = TimeBlockEntity.builder()
                .id(3L).title("Coding").date(LocalDate.of(2026, 9, 22)).startTime("09:00").endTime("11:30").isCompleted(true).category("work").energyLevel("high").build();
        TimeBlockEntity b4 = TimeBlockEntity.builder()
                .id(4L).title("Review").date(LocalDate.of(2026, 9, 23)).startTime("14:00").endTime("15:30").isCompleted(false).category("work").energyLevel("low").build();

        when(timeBlockRepository.findByDateBetweenOrderByStartTimeAsc(any(), any()))
                .thenReturn(List.of(b1, b2, b3, b4));

        AdaptationActionEntity a1 = AdaptationActionEntity.builder()
                .id(101L).date(LocalDate.of(2026, 9, 22)).reason("Schedule shift").scenarioTitle("Balanced Shift").status("APPLIED").build();
        when(adaptationActionRepository.findByDateBetweenOrderByCreatedAtDesc(any(), any()))
                .thenReturn(List.of(a1));

        WeeklyInsightsResponse response = weeklyInsightsService.getWeeklyInsights(weekMonday);

        assertThat(response).isNotNull();
        assertThat(response.weekStart()).isEqualTo(weekMonday);
        assertThat(response.coverage().coveredDays()).isEqualTo(3);
        assertThat(response.coverage().sufficient()).isTrue();
        assertThat(response.metrics().scheduledBlocks()).isEqualTo(4);
        assertThat(response.metrics().completedBlocks()).isEqualTo(3);
        assertThat(response.metrics().completionRatePercent()).isEqualTo(75);
        assertThat(response.metrics().adaptations().applied()).isEqualTo(1);
        assertThat(response.patterns()).isNotEmpty();
        assertThat(response.recommendations()).isNotEmpty();
    }

    @Test
    void testGetWeeklyInsightsInsufficientData() {
        // Only 1 day of timeblocks
        TimeBlockEntity b1 = TimeBlockEntity.builder()
                .id(1L).title("Deep Work").date(LocalDate.of(2026, 9, 21)).startTime("08:00").endTime("10:00").isCompleted(true).category("work").energyLevel("high").build();

        when(timeBlockRepository.findByDateBetweenOrderByStartTimeAsc(any(), any()))
                .thenReturn(List.of(b1));
        when(adaptationActionRepository.findByDateBetweenOrderByCreatedAtDesc(any(), any()))
                .thenReturn(List.of());

        WeeklyInsightsResponse response = weeklyInsightsService.getWeeklyInsights(weekMonday);

        assertThat(response).isNotNull();
        assertThat(response.coverage().coveredDays()).isEqualTo(1);
        assertThat(response.coverage().sufficient()).isFalse();
        assertThat(response.patterns()).isEmpty();
        assertThat(response.recommendations()).isEmpty();
    }

    @Test
    void testNonMondayThrowsIllegalArgumentException() {
        LocalDate tuesday = LocalDate.of(2026, 9, 22);
        assertThatThrownBy(() -> weeklyInsightsService.getWeeklyInsights(tuesday))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("weekStart must be a Monday");
    }
}
