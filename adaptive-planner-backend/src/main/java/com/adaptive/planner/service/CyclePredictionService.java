package com.adaptive.planner.service;

import com.adaptive.planner.dto.CyclePredictionDto;
import com.adaptive.planner.dto.PredictedCycleWindowDto;
import com.adaptive.planner.entity.DailyCheckinEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class CyclePredictionService {

    public static final int DEFAULT_CYCLE_LENGTH_DAYS = 28;
    public static final int DEFAULT_PERIOD_DURATION_DAYS = 5;

    public CyclePredictionDto predictUpcomingCycles(List<DailyCheckinEntity> periodEntries, LocalDate referenceDate) {
        if (referenceDate == null) {
            referenceDate = LocalDate.now();
        }

        if (periodEntries == null || periodEntries.isEmpty()) {
            return CyclePredictionDto.builder()
                    .averageCycleLengthDays(DEFAULT_CYCLE_LENGTH_DAYS)
                    .averagePeriodDurationDays(DEFAULT_PERIOD_DURATION_DAYS)
                    .totalCyclesLogged(0)
                    .lastPeriodStartDate(null)
                    .predictedWindows(Collections.emptyList())
                    .build();
        }

        // 1. Group consecutive period days into cycle events
        List<PeriodEvent> periodEvents = groupIntoPeriodEvents(periodEntries);
        if (periodEvents.isEmpty()) {
            return CyclePredictionDto.builder()
                    .averageCycleLengthDays(DEFAULT_CYCLE_LENGTH_DAYS)
                    .averagePeriodDurationDays(DEFAULT_PERIOD_DURATION_DAYS)
                    .totalCyclesLogged(0)
                    .lastPeriodStartDate(null)
                    .predictedWindows(Collections.emptyList())
                    .build();
        }

        PeriodEvent latestEvent = periodEvents.get(periodEvents.size() - 1);
        LocalDate lastPeriodStartDate = latestEvent.startDate;

        // 2. Compute average cycle length (intervals between consecutive start dates)
        List<Long> cycleLengths = new ArrayList<>();
        for (int i = 0; i < periodEvents.size() - 1; i++) {
            long daysBetween = ChronoUnit.DAYS.between(periodEvents.get(i).startDate, periodEvents.get(i + 1).startDate);
            // Filter realistic cycle ranges (between 18 and 50 days)
            if (daysBetween >= 18 && daysBetween <= 50) {
                cycleLengths.add(daysBetween);
            }
        }

        int avgCycleLength = DEFAULT_CYCLE_LENGTH_DAYS;
        if (!cycleLengths.isEmpty()) {
            double avg = cycleLengths.stream().mapToLong(Long::longValue).average().orElse(DEFAULT_CYCLE_LENGTH_DAYS);
            avgCycleLength = (int) Math.round(avg);
        }

        // 3. Compute average period duration
        double avgDuration = periodEvents.stream()
                .mapToLong(e -> e.durationDays)
                .average()
                .orElse(DEFAULT_PERIOD_DURATION_DAYS);
        int avgDurationDays = Math.max(3, Math.min(8, (int) Math.round(avgDuration)));

        // 4. Project future cycle windows for the next 3 cycles
        List<PredictedCycleWindowDto> predictions = new ArrayList<>();
        double baseConfidence = periodEvents.size() >= 3 ? 0.92 : (periodEvents.size() == 2 ? 0.80 : 0.65);

        LocalDate nextStart = lastPeriodStartDate;
        for (int cycle = 1; cycle <= 3; cycle++) {
            nextStart = nextStart.plusDays(avgCycleLength);
            LocalDate nextEnd = nextStart.plusDays(avgDurationDays - 1);

            double confidence = Math.max(0.40, baseConfidence - (cycle - 1) * 0.10);

            predictions.add(PredictedCycleWindowDto.builder()
                    .startDate(nextStart)
                    .endDate(nextEnd)
                    .confidenceScore(Math.round(confidence * 100.0) / 100.0)
                    .label("Dự kiến chu kỳ")
                    .build());
        }

        return CyclePredictionDto.builder()
                .averageCycleLengthDays(avgCycleLength)
                .averagePeriodDurationDays(avgDurationDays)
                .totalCyclesLogged(periodEvents.size())
                .lastPeriodStartDate(lastPeriodStartDate)
                .predictedWindows(predictions)
                .build();
    }

    private List<PeriodEvent> groupIntoPeriodEvents(List<DailyCheckinEntity> periodEntries) {
        List<PeriodEvent> events = new ArrayList<>();
        if (periodEntries.isEmpty()) return events;

        List<LocalDate> sortedDates = periodEntries.stream()
                .map(DailyCheckinEntity::getCheckinDate)
                .distinct()
                .sorted()
                .toList();

        LocalDate currentStart = sortedDates.get(0);
        LocalDate currentEnd = sortedDates.get(0);

        for (int i = 1; i < sortedDates.size(); i++) {
            LocalDate date = sortedDates.get(i);
            long diff = ChronoUnit.DAYS.between(currentEnd, date);
            // If consecutive or within 1 day gap (spotting/pause)
            if (diff <= 2) {
                currentEnd = date;
            } else {
                long duration = ChronoUnit.DAYS.between(currentStart, currentEnd) + 1;
                events.add(new PeriodEvent(currentStart, currentEnd, duration));
                currentStart = date;
                currentEnd = date;
            }
        }

        long duration = ChronoUnit.DAYS.between(currentStart, currentEnd) + 1;
        events.add(new PeriodEvent(currentStart, currentEnd, duration));

        return events;
    }

    private static class PeriodEvent {
        final LocalDate startDate;
        final LocalDate endDate;
        final long durationDays;

        PeriodEvent(LocalDate startDate, LocalDate endDate, long durationDays) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.durationDays = durationDays;
        }
    }
}
