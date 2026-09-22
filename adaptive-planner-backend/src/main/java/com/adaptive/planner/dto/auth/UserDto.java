package com.adaptive.planner.dto.auth;

import com.adaptive.planner.entity.UserEntity;

public record UserDto(
        Long id,
        String name,
        String email,
        String platformRole,
        String journeyStage,
        Boolean onboardingCompleted
) {
    public static UserDto fromEntity(UserEntity user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPlatformRole(),
                user.getJourneyStage(),
                user.getOnboardingCompleted()
        );
    }
}
