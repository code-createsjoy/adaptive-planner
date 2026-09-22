package com.adaptive.planner.service;

import com.adaptive.planner.dto.onboarding.AssessmentSubmissionRequest;
import com.adaptive.planner.dto.onboarding.FunctionalProfileDto;
import com.adaptive.planner.dto.onboarding.NeurodivergenceSelfIdRequest;
import com.adaptive.planner.entity.AssessmentAnswerEntity;
import com.adaptive.planner.entity.FunctionalProfileEntity;
import com.adaptive.planner.entity.NeurodivergenceProfileEntity;
import com.adaptive.planner.entity.UserEntity;
import com.adaptive.planner.repository.AssessmentAnswerRepository;
import com.adaptive.planner.repository.FunctionalProfileRepository;
import com.adaptive.planner.repository.NeurodivergenceProfileRepository;
import com.adaptive.planner.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingService {

    private final UserRepository userRepository;
    private final NeurodivergenceProfileRepository neurodivergenceProfileRepository;
    private final FunctionalProfileRepository functionalProfileRepository;
    private final AssessmentAnswerRepository assessmentAnswerRepository;
    private final AssessmentScoringService scoringService;
    private final ObjectMapper objectMapper;

    @Transactional
    public void saveJourneyStage(Long userId, String journeyStage) {
        UserEntity user = getUserOrThrow(userId);
        user.setJourneyStage(journeyStage);
        userRepository.save(user);
    }

    @Transactional
    public void saveNeurodivergenceSelfId(Long userId, NeurodivergenceSelfIdRequest request) {
        UserEntity user = getUserOrThrow(userId);

        String conditionsJson = "[]";
        if (request.selectedConditions() != null) {
            try {
                conditionsJson = objectMapper.writeValueAsString(request.selectedConditions());
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize selected conditions", e);
            }
        }

        NeurodivergenceProfileEntity profile = neurodivergenceProfileRepository.findByUserId(userId)
                .orElse(NeurodivergenceProfileEntity.builder().user(user).isPrivate(true).build());

        profile.setIdentificationStatus(request.identificationStatus());
        profile.setSelectedConditionsJson(conditionsJson);

        neurodivergenceProfileRepository.save(profile);
    }

    @Transactional
    public FunctionalProfileDto submitAssessment(Long userId, AssessmentSubmissionRequest request) {
        UserEntity user = getUserOrThrow(userId);

        // Delete previous answers if retaking
        assessmentAnswerRepository.deleteByUser(user);

        List<AssessmentAnswerEntity> answers = request.answers().stream()
                .map(a -> AssessmentAnswerEntity.builder()
                        .user(user)
                        .questionId(a.questionId())
                        .selectedOptionIndex(a.selectedOptionIndex())
                        .scoreWeight(a.scoreWeight())
                        .build())
                .toList();

        assessmentAnswerRepository.saveAll(answers);

        // Calculate and upsert functional profile
        FunctionalProfileEntity calculated = scoringService.scoreAssessment(user, request.answers());

        FunctionalProfileEntity profile = functionalProfileRepository.findByUserId(userId)
                .orElse(FunctionalProfileEntity.builder().user(user).build());

        profile.setTaskInitiationScore(calculated.getTaskInitiationScore());
        profile.setAttentionRegulationScore(calculated.getAttentionRegulationScore());
        profile.setTimeAwarenessScore(calculated.getTimeAwarenessScore());
        profile.setContextSwitchingScore(calculated.getContextSwitchingScore());
        profile.setSensorySensitivityScore(calculated.getSensorySensitivityScore());
        profile.setNeedForStructureScore(calculated.getNeedForStructureScore());
        profile.setCommunicationPreference(calculated.getCommunicationPreference());
        profile.setRecommendedMode(calculated.getRecommendedMode());
        profile.setAssessmentCompleted(true);

        profile = functionalProfileRepository.save(profile);

        List<String> patterns = scoringService.generateNoticedPatterns(profile);
        return FunctionalProfileDto.fromEntity(profile, patterns);
    }

    @Transactional
    public void completeOnboarding(Long userId) {
        UserEntity user = getUserOrThrow(userId);
        user.setOnboardingCompleted(true);
        userRepository.save(user);

        // Ensure functional profile exists even if assessment was skipped
        if (functionalProfileRepository.findByUserId(userId).isEmpty()) {
            FunctionalProfileEntity defaultProfile = FunctionalProfileEntity.builder()
                    .user(user)
                    .attentionRegulationScore(50)
                    .taskInitiationScore(50)
                    .timeAwarenessScore(50)
                    .contextSwitchingScore(50)
                    .sensorySensitivityScore(50)
                    .needForStructureScore(50)
                    .communicationPreference("WRITTEN_STEP_BY_STEP")
                    .recommendedMode("BALANCED")
                    .assessmentCompleted(false)
                    .build();
            functionalProfileRepository.save(defaultProfile);
        }
    }

    @Transactional(readOnly = true)
    public FunctionalProfileDto getFunctionalProfile(Long userId) {
        UserEntity user = getUserOrThrow(userId);

        FunctionalProfileEntity profile = functionalProfileRepository.findByUserId(userId)
                .orElseGet(() -> FunctionalProfileEntity.builder()
                        .user(user)
                        .attentionRegulationScore(50)
                        .taskInitiationScore(50)
                        .timeAwarenessScore(50)
                        .contextSwitchingScore(50)
                        .sensorySensitivityScore(50)
                        .needForStructureScore(50)
                        .communicationPreference("WRITTEN_STEP_BY_STEP")
                        .recommendedMode("BALANCED")
                        .assessmentCompleted(false)
                        .build());

        List<String> patterns = scoringService.generateNoticedPatterns(profile);
        return FunctionalProfileDto.fromEntity(profile, patterns);
    }

    private UserEntity getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
    }
}
