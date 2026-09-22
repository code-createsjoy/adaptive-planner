package com.adaptive.planner.dto.onboarding;

import jakarta.validation.constraints.NotBlank;

public record JourneyStageRequest(
        @NotBlank(message = "Journey stage is required")
        String journeyStage // STUDYING, EXPLORING_CAREERS, JOB_SEARCHING, INTERVIEW_PREPARATION, STARTING_NEW_JOB, CURRENTLY_WORKING, OTHER, PREFER_NOT_TO_SAY
) {}
