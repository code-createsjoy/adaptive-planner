package com.adaptive.planner.service;

import com.adaptive.planner.dto.OnboardingAnswersDto;
import com.adaptive.planner.dto.UserAccessibilityProfileDto;
import com.adaptive.planner.entity.UserAccessibilityProfileEntity;
import com.adaptive.planner.repository.UserAccessibilityProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserAccessibilityProfileServiceTest {

    @Mock
    private UserAccessibilityProfileRepository repository;

    private UserAccessibilityProfileService service;

    @BeforeEach
    void setUp() {
        service = new UserAccessibilityProfileService(repository);
    }

    @Test
    void getOrCreateProfile_whenNotExists_createsDefault() {
        when(repository.findByUserId("default-user")).thenReturn(Optional.empty());

        UserAccessibilityProfileEntity savedEntity = UserAccessibilityProfileEntity.builder()
                .id(1L)
                .userId("default-user")
                .visualDensity("medium")
                .sensorySensitivity("high")
                .focusSupport("now-next")
                .onboardingCompleted(false)
                .build();

        when(repository.save(any(UserAccessibilityProfileEntity.class))).thenReturn(savedEntity);

        UserAccessibilityProfileDto result = service.getOrCreateProfile("default-user");

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSensorySensitivity()).isEqualTo("high");
        assertThat(result.getOnboardingCompleted()).isFalse();
    }

    @Test
    void completeOnboarding_mapsAnswersToSensoryMindProfile() {
        when(repository.findByUserId("default-user")).thenReturn(Optional.empty());

        OnboardingAnswersDto answers = OnboardingAnswersDto.builder()
                .infoStyle("VISUAL")
                .distractionSensitivity("HIGH")
                .reminderPreference("GENTLE")
                .schedulePreference("FLEXIBLE")
                .build();

        UserAccessibilityProfileEntity saved = UserAccessibilityProfileEntity.builder()
                .id(1L)
                .userId("default-user")
                .visualDensity("high")
                .sensorySensitivity("high")
                .focusSupport("single-task")
                .notificationStyle("gentle")
                .scheduleStructure("flexible")
                .onboardingCompleted(true)
                .build();

        when(repository.save(any(UserAccessibilityProfileEntity.class))).thenReturn(saved);

        UserAccessibilityProfileDto result = service.completeOnboarding("default-user", answers);

        assertThat(result.getVisualDensity()).isEqualTo("high");
        assertThat(result.getSensorySensitivity()).isEqualTo("high");
        assertThat(result.getFocusSupport()).isEqualTo("single-task");
        assertThat(result.getNotificationStyle()).isEqualTo("gentle");
        assertThat(result.getOnboardingCompleted()).isTrue();
    }
}
