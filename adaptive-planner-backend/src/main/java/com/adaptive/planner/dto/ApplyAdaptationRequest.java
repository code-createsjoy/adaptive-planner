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
public class ApplyAdaptationRequest {
    private Long conversationId;
    private LocalDate date;
    private String reason;
    private String selectedScenarioId;
    private String scenarioTitle;
    private String explanationJson;
    private List<TimeBlockDto> newBlocks;
}
