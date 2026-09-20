package com.adaptive.planner.dto;

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
public class WeeklyRoutineDto {

    private Long id;
    private DayOfWeek dayOfWeek;
    private String title;
    private String detail;
    private String startTime;
    private String endTime;
    private String category;
    private String energyLevel;
    private String priority;
    private List<Integer> reminderMinutesBefore;
    private boolean enabled;
}
