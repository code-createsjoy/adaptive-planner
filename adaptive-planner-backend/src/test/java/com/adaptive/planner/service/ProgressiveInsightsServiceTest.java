package com.adaptive.planner.service;

import com.adaptive.planner.config.InsightsProperties;
import com.adaptive.planner.dto.insights.ProgressiveInsightsDto;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.repository.TimeBlockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressiveInsightsServiceTest {

    @Mock
    private TimeBlockRepository timeBlockRepository;

    private InsightsProperties properties;
    private InsightsWeekSemantics semantics;
    private Clock fixedClock;
    private ProgressiveInsightsService service;

    @BeforeEach
    void setUp() {
        // Tuesday, 2026-09-22
        Instant fixedInstant = Instant.parse("2026-09-22T10:00:00Z");
        fixedClock = Clock.fixed(fixedInstant, ZoneId.of("Asia/Ho_Chi_Minh"));
        properties = new InsightsProperties("Asia/Ho_Chi_Minh", "single-user");
        semantics = new InsightsWeekSemantics(fixedClock, properties);
        service = new ProgressiveInsightsService(timeBlockRepository, properties, semantics, fixedClock);
    }

    @Test
    void getProgressiveInsights_onTuesday_returnsEarlyMaturityWithMetrics() {
        LocalDate monday = LocalDate.of(2026, 9, 21);
        LocalDate tuesday = LocalDate.of(2026, 9, 22);

        TimeBlockEntity block1 = TimeBlockEntity.builder()
                .id(1L)
                .date(monday)
                .startTime("09:00")
                .endTime("11:00")
                .isCompleted(true)
                .build();

        TimeBlockEntity block2 = TimeBlockEntity.builder()
                .id(2L)
                .date(tuesday)
                .startTime("14:00")
                .endTime("15:30")
                .isCompleted(false)
                .build();

        when(timeBlockRepository.findByDateBetweenOrderByStartTimeAsc(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(block1, block2));

        ProgressiveInsightsDto result = service.getProgressiveInsights(monday);

        assertThat(result).isNotNull();
        assertThat(result.currentWeek()).isNotNull();
        assertThat(result.currentWeek().dayIndex()).isEqualTo(2);
        assertThat(result.currentWeek().scheduledTasks()).isEqualTo(2);
        assertThat(result.currentWeek().completedTasks()).isEqualTo(1);
        assertThat(result.currentWeek().pattern().maturity()).isEqualTo("EARLY");
        assertThat(result.currentWeek().pattern().tag()).contains("🌱 Xu hướng ban đầu");
        assertThat(result.currentWeek().daypartRhythm().morningFocusMinutes()).isEqualTo(120);
        assertThat(result.currentWeek().daypartRhythm().afternoonFocusMinutes()).isEqualTo(90);
        assertThat(result.lastWeek()).isNotNull();
    }

    @Test
    void getProgressiveInsights_nonMondayDate_throwsIllegalArgumentException() {
        LocalDate tuesday = LocalDate.of(2026, 9, 22);
        assertThatThrownBy(() -> service.getProgressiveInsights(tuesday))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Monday");
    }
}
