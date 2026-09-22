package com.adaptive.planner.dto;

import com.adaptive.planner.entity.FeasibilityStatus;
import com.adaptive.planner.entity.ProjectGoalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectGoalDto {
    private Long id;
    private String title;
    private String description;
    private LocalDate officialDeadline;
    private LocalDate internalTargetDate;
    private Integer bufferDays;
    private ProjectGoalStatus status;
    private FeasibilityStatus feasibilityStatus;
    private Long conversationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<ProjectSubtaskDto> subtasks = new ArrayList<>();

    // Derived fields
    private Integer totalEstimatedMinutes;
    private Integer completedEstimatedMinutes;
    private Integer progressPercentage;
    private String currentMilestone;
    private Integer remainingBufferDays;
}
