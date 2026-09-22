package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyGoalScenarioRequest {
    private String goalTitle;
    private String description;
    private LocalDate officialDeadline;
    private LocalDate internalTargetDate;
    private Integer bufferDays;
    private Long conversationId;
    private GoalScenarioOption selectedScenario;
    private List<GoalMilestoneDto> milestones;
}
