package com.adaptive.planner.dto.insights;

import java.time.LocalDate;

public record LastWeekReflectionDto(
        LocalDate weekStart,
        LocalDate weekEnd,
        int completedTasks,
        int scheduledTasks,
        int completionRate,
        int totalFocusMinutes,
        String dominantPattern,
        String whyReason,
        LastWeekSuggestionDto suggestion
) {}
