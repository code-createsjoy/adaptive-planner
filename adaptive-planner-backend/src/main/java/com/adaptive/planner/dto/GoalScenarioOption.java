package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalScenarioOption {
    private String id; // "recommended", "faster", "flexible"
    private String title;
    private String badge; // "RECOMMENDED", "FASTER", "LOW_PRESSURE"
    private String description;
    private LocalDate internalTargetDate;
    private Integer bufferDays;
    private Integer daysCount;
    private Integer totalPlannedMinutes;
    private String strategySummary; // "Tận dụng 8 block Work hiện có + 2 Deep Work sessions"

    @Builder.Default
    private List<DailyRoadmapDayDto> roadmapDays = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRoadmapDayDto {
        private LocalDate date;
        private String dayOfWeek; // "Thứ 2", "Thứ 3", etc.
        private String formattedDate; // "21/09"
        private Boolean isBufferDay;
        @Builder.Default
        private List<RoadmapBlockDto> blocks = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoadmapBlockDto {
        private String startTime;
        private String endTime;
        private String milestoneName;
        private String title;
        private Integer durationMinutes;
        private String blockType; // "EXISTING_WORK_FIT", "DEDICATED_DEEP_WORK", "FLEXIBLE_SLOT", "BUFFER"
        private String note;
        @Builder.Default
        private List<String> subtaskTitles = new ArrayList<>();
    }
}
