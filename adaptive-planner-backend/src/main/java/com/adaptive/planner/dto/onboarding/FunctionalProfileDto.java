package com.adaptive.planner.dto.onboarding;

import com.adaptive.planner.entity.FunctionalProfileEntity;

import java.util.List;

public record FunctionalProfileDto(
        int attentionRegulationScore,
        int taskInitiationScore,
        int timeAwarenessScore,
        int contextSwitchingScore,
        int sensorySensitivityScore,
        int needForStructureScore,
        String attentionSupportLevel, // LOW, MODERATE, HIGH
        String initiationSupportLevel,
        String timeAwarenessSupportLevel,
        String contextSwitchingSupportLevel,
        String sensorySupportLevel,
        String structureSupportLevel,
        String communicationPreference,
        String recommendedMode, // CALM, BALANCED, FOCUS
        boolean assessmentCompleted,
        List<String> noticedPatterns,
        String disclaimer
) {
    public static FunctionalProfileDto fromEntity(FunctionalProfileEntity entity, List<String> patterns) {
        return new FunctionalProfileDto(
                entity.getAttentionRegulationScore(),
                entity.getTaskInitiationScore(),
                entity.getTimeAwarenessScore(),
                entity.getContextSwitchingScore(),
                entity.getSensorySensitivityScore(),
                entity.getNeedForStructureScore(),
                toLevel(entity.getAttentionRegulationScore()),
                toLevel(entity.getTaskInitiationScore()),
                toLevel(entity.getTimeAwarenessScore()),
                toLevel(entity.getContextSwitchingScore()),
                toLevel(entity.getSensorySensitivityScore()),
                toLevel(entity.getNeedForStructureScore()),
                entity.getCommunicationPreference(),
                entity.getRecommendedMode(),
                entity.getAssessmentCompleted(),
                patterns,
                "Kết quả này mô tả các xu hướng và nhịp điệu sinh hoạt trong phản hồi của bạn, không phải chẩn đoán y tế. Bạn có thể sử dụng thông tin này để tối ưu hóa môi trường làm việc."
        );
    }

    private static String toLevel(int score) {
        if (score >= 70) return "HIGH";
        if (score >= 40) return "MODERATE";
        return "LOW";
    }
}
