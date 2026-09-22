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
public class GoalRebalanceRequest {
    private Long projectId;
    private Integer overdueMinutes; // e.g. 80 (remaining minutes from incomplete tasks today)
    private LocalDate currentDate; // e.g. 2026-09-21
}
