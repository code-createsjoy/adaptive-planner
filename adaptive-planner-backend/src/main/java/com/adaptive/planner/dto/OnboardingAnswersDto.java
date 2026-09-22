package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingAnswersDto {
    // "VISUAL", "TEXT", "MIXED"
    private String infoStyle;
    // "LOW", "MEDIUM", "HIGH"
    private String distractionSensitivity;
    // "GENTLE", "STANDARD", "PERSISTENT"
    private String reminderPreference;
    // "FLEXIBLE", "BALANCED", "STRUCTURED"
    private String schedulePreference;
}
