package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CognitiveLoadAssessmentDto {
    private String date;
    private int score; // 0 to 100
    private String level; // LIGHT, MODERATE, HEAVY
    private String summary;
    private List<String> bulletPoints;
    private CognitiveMetricsDto metrics;
    @com.fasterxml.jackson.annotation.JsonProperty("isDemanding")
    private boolean isDemanding;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CognitiveMetricsDto {
        private int totalTasks;
        private int meetingCount;
        private int backToBackCount;
        private int contextSwitchCount;
        private double highFocusHours;
        private int totalBufferMinutes;
        private int deadlineCount;
    }
}
