package com.adaptive.planner.dto;

import com.adaptive.planner.entity.UserAccessibilityProfileEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccessibilityProfileDto {
    private Long id;
    private String userId;
    private String visualDensity;
    private String sensorySensitivity;
    private String focusSupport;
    private String scheduleStructure;
    private String notificationStyle;
    private String communicationStyle;
    private Boolean onboardingCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserAccessibilityProfileDto fromEntity(UserAccessibilityProfileEntity entity) {
        if (entity == null) return null;
        return UserAccessibilityProfileDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .visualDensity(entity.getVisualDensity())
                .sensorySensitivity(entity.getSensorySensitivity())
                .focusSupport(entity.getFocusSupport())
                .scheduleStructure(entity.getScheduleStructure())
                .notificationStyle(entity.getNotificationStyle())
                .communicationStyle(entity.getCommunicationStyle())
                .onboardingCompleted(entity.getOnboardingCompleted())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
