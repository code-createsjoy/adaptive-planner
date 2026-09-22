package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSubtaskDto {
    private Long id;
    private Long projectId;
    private String milestoneName;
    private String title;
    private Integer estimatedMinutes;
    private Boolean completed;
    private LocalDate scheduledDate;
    private Long timeBlockId;
    private Integer orderIndex;
}
