package com.adaptive.planner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTimeBlockRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String detail;

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Energy level is required")
    private String energyLevel;

    private String priority;
    private String deadline;
    private Boolean isMovable;
    private String status;
    private java.time.LocalDate inboxDate;
    private String preferredTimeRange;
    private List<Integer> reminderMinutesBefore;
    private Boolean isBufferBlock;
    private List<TimeBlockDto.MicroStepDto> microSteps;
    private java.time.LocalDate date;
    private String sourceType;
    private Long sourceRoutineId;
    private String overrideType;
}
