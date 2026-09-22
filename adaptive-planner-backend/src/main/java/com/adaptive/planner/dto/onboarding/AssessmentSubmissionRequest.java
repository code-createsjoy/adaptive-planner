package com.adaptive.planner.dto.onboarding;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AssessmentSubmissionRequest(
        @NotEmpty(message = "Answers list cannot be empty")
        List<AnswerItem> answers
) {
    public record AnswerItem(
            String questionId,
            int selectedOptionIndex,
            int scoreWeight // 0 to 3
    ) {}
}
