package com.adaptive.planner.dto.insights;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record SaveExperimentRequest(
        @NotNull LocalDate sourceWeek,
        @NotBlank String ruleKey,
        @NotBlank String evidenceFingerprint
) {}
