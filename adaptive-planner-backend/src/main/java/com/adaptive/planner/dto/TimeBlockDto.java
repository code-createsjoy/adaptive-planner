package com.adaptive.planner.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeBlockDto {

    private String id;
    private String title;
    private String detail;
    private String startTime;
    private String endTime;
    private String category;
    private String energyLevel;
    private String priority;
    private String deadline;
    @JsonProperty("isMovable")
    @Builder.Default
    private Boolean isMovable = true;
    @Builder.Default
    private String status = "ACTIVE"; // "ACTIVE", "DISRUPTED", "DEFERRED", "SCHEDULED"
    private java.time.LocalDate inboxDate;
    private String preferredTimeRange;
    private List<Integer> reminderMinutesBefore;
    @JsonProperty("isCompleted")
    private boolean isCompleted;
    @JsonProperty("isBufferBlock")
    private boolean isBufferBlock;
    private List<MicroStepDto> microSteps;
    private java.time.LocalDate date;
    private String sourceType;
    private Long sourceRoutineId;
    private String overrideType;
    private Integer durationMinutes;
    private List<String> missingFields;
    private Double confidence;
    private String intentType; // "SCHEDULE_EVENT" | "CONVERSATION" | "EMOTIONAL_SUPPORT"
    private String replyMessage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MicroStepDto {
        private String id;
        private String text;
        private boolean done;
    }
}
