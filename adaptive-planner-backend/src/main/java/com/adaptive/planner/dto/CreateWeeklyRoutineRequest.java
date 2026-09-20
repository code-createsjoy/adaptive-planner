package com.adaptive.planner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWeeklyRoutineRequest {

    @NotEmpty(message = "At least one day of week is required")
    private List<DayOfWeek> daysOfWeek; // e.g. [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY]

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
    private List<Integer> reminderMinutesBefore;
}
