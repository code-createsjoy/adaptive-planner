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
public class RescheduleResponseDto {

    private String analysis;
    private ScenarioDto recommendedScenario;
    private List<ScenarioDto> alternativeScenarios;
    private ExplanationDetailsDto explanation;
    private List<ScenarioDto> scenarios; // For backward compatibility
}
