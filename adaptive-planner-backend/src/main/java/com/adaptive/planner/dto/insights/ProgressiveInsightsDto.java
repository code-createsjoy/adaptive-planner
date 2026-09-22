package com.adaptive.planner.dto.insights;

public record ProgressiveInsightsDto(
        CurrentWeekProgressDto currentWeek,
        LastWeekReflectionDto lastWeek
) {}
