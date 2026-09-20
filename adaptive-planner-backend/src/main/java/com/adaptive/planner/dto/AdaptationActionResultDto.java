package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptationActionResultDto {
    private Long actionId;
    private String message;
    private String status;
    private List<TimeBlockDto> blocks;
}
