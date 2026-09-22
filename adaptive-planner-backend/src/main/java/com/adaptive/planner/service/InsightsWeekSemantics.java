package com.adaptive.planner.service;

import com.adaptive.planner.config.InsightsProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.Locale;

/** Shared, deterministic calendar and interval rules for weekly Insights. */
@Component
@RequiredArgsConstructor
public class InsightsWeekSemantics {

    public static final int MINIMUM_COVERED_DAYS = 3;
    public static final int MINIMUM_RULE_SAMPLE = 3;
    public static final int TRANSITION_GAP_MINUTES = 10;
    private static final DateTimeFormatter STRICT_TIME = DateTimeFormatter
            .ofPattern("HH:mm", Locale.ROOT)
            .withResolverStyle(ResolverStyle.STRICT);

    private final Clock clock;
    private final InsightsProperties properties;

    public WeekWindow resolve(LocalDate requestedWeekStart) {
        LocalDate today = LocalDate.now(clock.withZone(properties.zoneId()));
        LocalDate currentWeekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekStart = requestedWeekStart == null ? currentWeekStart : requestedWeekStart;
        if (weekStart.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new IllegalArgumentException("weekStart must be a Monday");
        }
        if (weekStart.isAfter(currentWeekStart)) {
            throw new IllegalArgumentException("Future insight weeks are not available");
        }

        LocalDate weekEnd = weekStart.plusDays(6);
        boolean currentWeek = weekStart.equals(currentWeekStart);
        return new WeekWindow(
                weekStart,
                weekEnd,
                currentWeek ? today : weekEnd,
                properties.timezone(),
                currentWeek ? "Week so far" : "Weekly reflection"
        );
    }

    public LocalTime parseStrictTime(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Time is required");
        }
        try {
            return LocalTime.parse(value, STRICT_TIME);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Invalid time; expected HH:mm: " + value, exception);
        }
    }

    public boolean isValidInterval(String startTime, String endTime) {
        try {
            return parseStrictTime(endTime).isAfter(parseStrictTime(startTime));
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    public Daypart daypart(LocalTime time) {
        if (time.isBefore(LocalTime.NOON)) return Daypart.MORNING;
        if (time.isBefore(LocalTime.of(18, 0))) return Daypart.AFTERNOON;
        return Daypart.EVENING;
    }

    public String confidence(int sampleSize) {
        if (sampleSize >= 10) return "HIGH";
        if (sampleSize >= 6) return "MEDIUM";
        return "LOW";
    }

    public enum Daypart { MORNING, AFTERNOON, EVENING }

    public record WeekWindow(
            LocalDate weekStart,
            LocalDate weekEnd,
            LocalDate dataThrough,
            String timezone,
            String periodLabel
    ) {}
}
