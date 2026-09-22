package com.adaptive.planner.dto.insights;

public record DaypartRhythmDto(
        int morningFocusMinutes,
        int afternoonFocusMinutes,
        int eveningFocusMinutes,
        String dominantPeriod
) {}
