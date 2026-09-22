package com.adaptive.planner.dto.insights;

public record PatternObservationDto(
        String maturity, // EARLY | CONFIRMED
        String tag,
        String observation,
        String evidenceDetail
) {}
