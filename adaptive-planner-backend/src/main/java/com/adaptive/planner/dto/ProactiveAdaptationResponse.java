package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProactiveAdaptationResponse {
    private boolean hasRecommendation;
    private String reason;
    private String suggestedAction;
    private List<Long> heavyBlockIds;
    private List<String> proposedChangesSummary;
}
