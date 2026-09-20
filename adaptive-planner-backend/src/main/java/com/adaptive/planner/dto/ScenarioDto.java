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
public class ScenarioDto {

    private String id;
    private String title;
    private String description;
    private String energyImpact;
    private String highlightText;
    private String tag; // "Optimized", "Low-Demand", "Alternative"
    private List<TimeBlockDto> blocks;
}
