package com.adaptive.planner.dto.insights;

import java.time.LocalDate;

public record CurrentWeekProgressDto(
        LocalDate weekStart,
        LocalDate weekEnd,
        int dayIndex,
        int totalDaysInWeek,
        int completedTasks,
        int scheduledTasks,
        int completionRate,
        int totalFocusMinutes,
        int focusSessionsCount,
        DaypartRhythmDto daypartRhythm,
        PatternObservationDto pattern
) {}
