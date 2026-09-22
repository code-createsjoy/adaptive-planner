package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalMilestoneDto {
    private String name; // e.g. "Research", "Wireframe", "UI Design", "Frontend", "Testing & Deploy"
    private Integer totalMinutes;
    @Builder.Default
    private List<ProjectSubtaskDto> subtasks = new ArrayList<>();
}
