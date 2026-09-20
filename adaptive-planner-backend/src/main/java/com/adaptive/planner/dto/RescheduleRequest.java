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
public class RescheduleRequest {

    @NotBlank(message = "Urgent event description or title is required")
    private String urgentEvent;

    private String targetTime; // e.g. "17:00"
    private Integer durationMinutes; // e.g. 60
    private List<TimeBlockDto> currentBlocks;
}
