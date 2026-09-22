package com.adaptive.planner.service;

import com.adaptive.planner.dto.CyclePredictionDto;
import com.adaptive.planner.entity.DailyCheckinEntity;
import com.adaptive.planner.entity.PeriodFlow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CyclePredictionServiceTest {

    private CyclePredictionService cyclePredictionService;

    @BeforeEach
    void setUp() {
        cyclePredictionService = new CyclePredictionService();
    }

    @Test
    void predictUpcomingCycles_withNoLogs_returnsDefault28DaysAndEmptyPredictions() {
        CyclePredictionDto result = cyclePredictionService.predictUpcomingCycles(List.of(), LocalDate.of(2026, 9, 21));

        assertThat(result.getAverageCycleLengthDays()).isEqualTo(28);
        assertThat(result.getAveragePeriodDurationDays()).isEqualTo(5);
        assertThat(result.getTotalCyclesLogged()).isEqualTo(0);
        assertThat(result.getLastPeriodStartDate()).isNull();
        assertThat(result.getPredictedWindows()).isEmpty();
    }

    @Test
    void predictUpcomingCycles_withSingleCycle_projectsFromLastStartWithDefault28Days() {
        List<DailyCheckinEntity> logs = List.of(
                DailyCheckinEntity.builder().checkinDate(LocalDate.of(2026, 9, 1)).isPeriodDay(true).flowIntensity(PeriodFlow.HEAVY).build(),
                DailyCheckinEntity.builder().checkinDate(LocalDate.of(2026, 9, 2)).isPeriodDay(true).flowIntensity(PeriodFlow.MEDIUM).build(),
                DailyCheckinEntity.builder().checkinDate(LocalDate.of(2026, 9, 3)).isPeriodDay(true).flowIntensity(PeriodFlow.LIGHT).build(),
                DailyCheckinEntity.builder().checkinDate(LocalDate.of(2026, 9, 4)).isPeriodDay(true).flowIntensity(PeriodFlow.SPOTTING).build()
        );

        CyclePredictionDto result = cyclePredictionService.predictUpcomingCycles(logs, LocalDate.of(2026, 9, 21));

        assertThat(result.getTotalCyclesLogged()).isEqualTo(1);
        assertThat(result.getLastPeriodStartDate()).isEqualTo(LocalDate.of(2026, 9, 1));
        assertThat(result.getAveragePeriodDurationDays()).isEqualTo(4);
        assertThat(result.getAverageCycleLengthDays()).isEqualTo(28);
        assertThat(result.getPredictedWindows()).hasSize(3);

        // Cycle 1: 2026-09-01 + 28 = 2026-09-29 to 2026-10-02 (4 days)
        assertThat(result.getPredictedWindows().get(0).getStartDate()).isEqualTo(LocalDate.of(2026, 9, 29));
        assertThat(result.getPredictedWindows().get(0).getEndDate()).isEqualTo(LocalDate.of(2026, 10, 2));
    }

    @Test
    void predictUpcomingCycles_withMultipleCycles_calculatesCustomAverageCycleLength() {
        List<DailyCheckinEntity> logs = new ArrayList<>();
        // Cycle 1: July 1 to July 5 (duration 5)
        for (int d = 1; d <= 5; d++) {
            logs.add(DailyCheckinEntity.builder().checkinDate(LocalDate.of(2026, 7, d)).isPeriodDay(true).build());
        }
        // Cycle 2: July 31 to August 4 (interval = 30 days, duration 5)
        for (int d = 31; d <= 31; d++) {
            logs.add(DailyCheckinEntity.builder().checkinDate(LocalDate.of(2026, 7, d)).isPeriodDay(true).build());
        }
        for (int d = 1; d <= 4; d++) {
            logs.add(DailyCheckinEntity.builder().checkinDate(LocalDate.of(2026, 8, d)).isPeriodDay(true).build());
        }
        // Cycle 3: August 30 to September 3 (interval = 30 days, duration 5)
        for (int d = 30; d <= 31; d++) {
            logs.add(DailyCheckinEntity.builder().checkinDate(LocalDate.of(2026, 8, d)).isPeriodDay(true).build());
        }
        for (int d = 1; d <= 3; d++) {
            logs.add(DailyCheckinEntity.builder().checkinDate(LocalDate.of(2026, 9, d)).isPeriodDay(true).build());
        }

        CyclePredictionDto result = cyclePredictionService.predictUpcomingCycles(logs, LocalDate.of(2026, 9, 21));

        assertThat(result.getTotalCyclesLogged()).isEqualTo(3);
        assertThat(result.getAverageCycleLengthDays()).isEqualTo(30);
        assertThat(result.getLastPeriodStartDate()).isEqualTo(LocalDate.of(2026, 8, 30));
        assertThat(result.getPredictedWindows()).hasSize(3);

        // Next cycle predicted: August 30 + 30 days = September 29
        assertThat(result.getPredictedWindows().get(0).getStartDate()).isEqualTo(LocalDate.of(2026, 9, 29));
    }
}
