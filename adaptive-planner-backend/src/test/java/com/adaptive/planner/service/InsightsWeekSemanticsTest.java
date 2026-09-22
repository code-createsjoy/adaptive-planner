package com.adaptive.planner.service;

import com.adaptive.planner.config.InsightsProperties;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;

class InsightsWeekSemanticsTest {

    private static final ZoneId HO_CHI_MINH = ZoneId.of("Asia/Ho_Chi_Minh");

    @Test
    void resolvesCurrentWeekFromMondayThroughToday() {
        InsightsWeekSemantics semantics = semanticsAt("2026-09-21T02:00:00Z");

        InsightsWeekSemantics.WeekWindow window = semantics.resolve(null);

        assertEquals(LocalDate.of(2026, 9, 21), window.weekStart());
        assertEquals(LocalDate.of(2026, 9, 27), window.weekEnd());
        assertEquals(LocalDate.of(2026, 9, 21), window.dataThrough());
        assertEquals("Asia/Ho_Chi_Minh", window.timezone());
        assertEquals("Week so far", window.periodLabel());
    }

    @Test
    void keepsSundayInsideTheMondayToSundayCurrentWeek() {
        InsightsWeekSemantics semantics = semanticsAt("2026-09-27T10:00:00Z");

        InsightsWeekSemantics.WeekWindow window = semantics.resolve(LocalDate.of(2026, 9, 21));

        assertEquals(LocalDate.of(2026, 9, 27), window.weekEnd());
        assertEquals(LocalDate.of(2026, 9, 27), window.dataThrough());
    }

    @Test
    void historicalWeekCrossesMonthAndYearAndUsesSundayAsCutoff() {
        InsightsWeekSemantics semantics = semanticsAt("2026-01-12T02:00:00Z");

        InsightsWeekSemantics.WeekWindow window = semantics.resolve(LocalDate.of(2025, 12, 29));

        assertEquals(LocalDate.of(2026, 1, 4), window.weekEnd());
        assertEquals(LocalDate.of(2026, 1, 4), window.dataThrough());
        assertEquals("Weekly reflection", window.periodLabel());
    }

    @Test
    void leapDayIsIncludedInItsMondayToSundayWeek() {
        InsightsWeekSemantics semantics = semanticsAt("2024-03-04T02:00:00Z");

        InsightsWeekSemantics.WeekWindow window = semantics.resolve(LocalDate.of(2024, 2, 26));

        assertEquals(LocalDate.of(2024, 3, 3), window.weekEnd());
        assertFalse(LocalDate.of(2024, 2, 29).isBefore(window.weekStart()));
        assertFalse(LocalDate.of(2024, 2, 29).isAfter(window.weekEnd()));
    }

    @Test
    void rejectsNonMondayAndFutureMonday() {
        InsightsWeekSemantics semantics = semanticsAt("2026-09-23T02:00:00Z");

        IllegalArgumentException nonMonday = assertThrows(
                IllegalArgumentException.class,
                () -> semantics.resolve(LocalDate.of(2026, 9, 22))
        );
        IllegalArgumentException future = assertThrows(
                IllegalArgumentException.class,
                () -> semantics.resolve(LocalDate.of(2026, 9, 28))
        );

        assertTrue(nonMonday.getMessage().contains("Monday"));
        assertTrue(future.getMessage().contains("Future"));
    }

    @Test
    void usesConfiguredTimezoneWhenUtcDateDiffers() {
        InsightsWeekSemantics semantics = semanticsAt("2026-09-20T18:00:00Z");

        InsightsWeekSemantics.WeekWindow window = semantics.resolve(null);

        assertEquals(LocalDate.of(2026, 9, 21), window.weekStart());
        assertEquals(LocalDate.of(2026, 9, 21), window.dataThrough());
    }

    @Test
    void acceptsOnlyStrictTwentyFourHourTimesAndPositiveIntervals() {
        InsightsWeekSemantics semantics = semanticsAt("2026-09-21T02:00:00Z");

        assertEquals(LocalTime.of(0, 0), semantics.parseStrictTime("00:00"));
        assertEquals(LocalTime.of(23, 59), semantics.parseStrictTime("23:59"));
        assertTrue(semantics.isValidInterval("09:00", "09:01"));
        assertFalse(semantics.isValidInterval("09:00", "09:00"));
        assertFalse(semantics.isValidInterval("10:00", "09:00"));
        assertFalse(semantics.isValidInterval("9:00", "10:00"));
        assertFalse(semantics.isValidInterval("24:00", "24:01"));
        assertThrows(IllegalArgumentException.class, () -> semantics.parseStrictTime(null));
        assertThrows(IllegalArgumentException.class, () -> semantics.parseStrictTime(""));
        assertThrows(IllegalArgumentException.class, () -> semantics.parseStrictTime("12:60"));
    }

    private InsightsWeekSemantics semanticsAt(String instant) {
        Clock clock = Clock.fixed(Instant.parse(instant), HO_CHI_MINH);
        return new InsightsWeekSemantics(clock, new InsightsProperties("Asia/Ho_Chi_Minh", "single-user"));
    }
}
