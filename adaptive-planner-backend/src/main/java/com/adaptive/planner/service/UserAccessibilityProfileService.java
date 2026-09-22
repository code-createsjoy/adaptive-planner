package com.adaptive.planner.service;

import com.adaptive.planner.dto.OnboardingAnswersDto;
import com.adaptive.planner.dto.UserAccessibilityProfileDto;
import com.adaptive.planner.entity.UserAccessibilityProfileEntity;
import com.adaptive.planner.repository.UserAccessibilityProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAccessibilityProfileService {

    private final UserAccessibilityProfileRepository repository;

    @Transactional
    public UserAccessibilityProfileDto getOrCreateProfile(String userId) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "default-user";
        return repository.findByUserId(effectiveUserId)
                .map(UserAccessibilityProfileDto::fromEntity)
                .orElseGet(() -> {
                    UserAccessibilityProfileEntity defaultEntity = UserAccessibilityProfileEntity.builder()
                            .userId(effectiveUserId)
                            .visualDensity("medium")
                            .sensorySensitivity("high")
                            .focusSupport("now-next")
                            .scheduleStructure("flexible")
                            .notificationStyle("gentle")
                            .communicationStyle("empathetic")
                            .onboardingCompleted(false)
                            .build();
                    UserAccessibilityProfileEntity saved = repository.save(defaultEntity);
                    log.info("Created default accessibility profile for user {}", effectiveUserId);
                    return UserAccessibilityProfileDto.fromEntity(saved);
                });
    }

    @Transactional
    public UserAccessibilityProfileDto updateProfile(String userId, UserAccessibilityProfileDto dto) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "default-user";
        Optional<UserAccessibilityProfileEntity> existingOpt = repository.findByUserId(effectiveUserId);

        UserAccessibilityProfileEntity entity;
        if (existingOpt.isPresent()) {
            entity = existingOpt.get();
        } else {
            entity = UserAccessibilityProfileEntity.builder().userId(effectiveUserId).build();
        }

        if (dto.getVisualDensity() != null) entity.setVisualDensity(dto.getVisualDensity());
        if (dto.getSensorySensitivity() != null) entity.setSensorySensitivity(dto.getSensorySensitivity());
        if (dto.getFocusSupport() != null) entity.setFocusSupport(dto.getFocusSupport());
        if (dto.getScheduleStructure() != null) entity.setScheduleStructure(dto.getScheduleStructure());
        if (dto.getNotificationStyle() != null) entity.setNotificationStyle(dto.getNotificationStyle());
        if (dto.getCommunicationStyle() != null) entity.setCommunicationStyle(dto.getCommunicationStyle());
        if (dto.getOnboardingCompleted() != null) entity.setOnboardingCompleted(dto.getOnboardingCompleted());

        UserAccessibilityProfileEntity saved = repository.save(entity);
        log.info("Updated accessibility profile for user {}: sensory={}, focus={}",
                effectiveUserId, saved.getSensorySensitivity(), saved.getFocusSupport());
        return UserAccessibilityProfileDto.fromEntity(saved);
    }

    @Transactional
    public UserAccessibilityProfileDto completeOnboarding(String userId, OnboardingAnswersDto answers) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "default-user";
        UserAccessibilityProfileEntity entity = repository.findByUserId(effectiveUserId)
                .orElseGet(() -> UserAccessibilityProfileEntity.builder().userId(effectiveUserId).build());

        // 1. Info style mapping
        if ("VISUAL".equalsIgnoreCase(answers.getInfoStyle())) {
            entity.setVisualDensity("high");
        } else if ("TEXT".equalsIgnoreCase(answers.getInfoStyle())) {
            entity.setVisualDensity("low");
        } else {
            entity.setVisualDensity("medium");
        }

        // 2. Distraction sensitivity mapping
        if ("HIGH".equalsIgnoreCase(answers.getDistractionSensitivity())) {
            entity.setSensorySensitivity("high");
            entity.setFocusSupport("single-task");
            entity.setCommunicationStyle("empathetic");
        } else if ("MEDIUM".equalsIgnoreCase(answers.getDistractionSensitivity())) {
            entity.setSensorySensitivity("medium");
            entity.setFocusSupport("now-next");
            entity.setCommunicationStyle("concise");
        } else {
            entity.setSensorySensitivity("standard");
            entity.setFocusSupport("full-timeline");
            entity.setCommunicationStyle("direct");
        }

        // 3. Reminder preference mapping
        if ("GENTLE".equalsIgnoreCase(answers.getReminderPreference())) {
            entity.setNotificationStyle("gentle");
        } else if ("PERSISTENT".equalsIgnoreCase(answers.getReminderPreference())) {
            entity.setNotificationStyle("persistent");
        } else {
            entity.setNotificationStyle("standard");
        }

        // 4. Schedule preference mapping
        if ("FLEXIBLE".equalsIgnoreCase(answers.getSchedulePreference())) {
            entity.setScheduleStructure("flexible");
        } else if ("STRUCTURED".equalsIgnoreCase(answers.getSchedulePreference())) {
            entity.setScheduleStructure("structured");
        } else {
            entity.setScheduleStructure("balanced");
        }

        entity.setOnboardingCompleted(true);

        UserAccessibilityProfileEntity saved = repository.save(entity);
        log.info("Completed onboarding for user {}. Generated profile: sensory={}, focus={}, schedule={}",
                effectiveUserId, saved.getSensorySensitivity(), saved.getFocusSupport(), saved.getScheduleStructure());
        return UserAccessibilityProfileDto.fromEntity(saved);
    }
}
