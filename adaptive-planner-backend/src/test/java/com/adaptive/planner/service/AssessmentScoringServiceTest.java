package com.adaptive.planner.service;

import com.adaptive.planner.dto.onboarding.AssessmentSubmissionRequest.AnswerItem;
import com.adaptive.planner.entity.FunctionalProfileEntity;
import com.adaptive.planner.entity.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AssessmentScoringServiceTest {

    private AssessmentScoringService scoringService;
    private UserEntity user;

    @BeforeEach
    void setUp() {
        scoringService = new AssessmentScoringService();
        user = UserEntity.builder().id(1L).email("thai@example.com").build();
    }

    @Test
    void scoreAssessment_highSensoryAndInitiation_computesScoresCorrectly() {
        List<AnswerItem> answers = List.of(
                new AnswerItem("Q1", 3, 3), // Task Initiation: 3
                new AnswerItem("Q2", 2, 2), // Task Initiation: 2 (total 5/6 = 83%)
                new AnswerItem("Q3", 1, 1), // Attention: 1
                new AnswerItem("Q4", 1, 1), // Attention: 1 (total 2/6 = 33%)
                new AnswerItem("Q5", 2, 2), // Time Awareness: 2
                new AnswerItem("Q6", 2, 2), // Time Awareness: 2 (total 4/6 = 67%)
                new AnswerItem("Q7", 2, 2), // Context Switching: 2
                new AnswerItem("Q8", 3, 3), // Context Switching: 3 (total 5/6 = 83%)
                new AnswerItem("Q9", 3, 3), // Sensory: 3
                new AnswerItem("Q10", 3, 3), // Sensory: 3 (total 6/6 = 100%)
                new AnswerItem("Q11", 3, 3), // Need for Structure: 3/3 = 100%
                new AnswerItem("Q12", 3, 3)  // Communication: VISUAL_AND_CHECKLIST
        );

        FunctionalProfileEntity profile = scoringService.scoreAssessment(user, answers);

        assertThat(profile).isNotNull();
        assertThat(profile.getTaskInitiationScore()).isEqualTo(83);
        assertThat(profile.getAttentionRegulationScore()).isEqualTo(33);
        assertThat(profile.getSensorySensitivityScore()).isEqualTo(100);
        assertThat(profile.getNeedForStructureScore()).isEqualTo(100);
        assertThat(profile.getCommunicationPreference()).isEqualTo("VISUAL_AND_CHECKLIST");
        assertThat(profile.getRecommendedMode()).isEqualTo("CALM"); // Sensory >= 65 -> CALM

        List<String> patterns = scoringService.generateNoticedPatterns(profile);
        assertThat(patterns).isNotEmpty();
        assertThat(patterns).anyMatch(p -> p.contains("Magic Task Breakdown"));
        assertThat(patterns).anyMatch(p -> p.contains("Calm Mode"));
    }
}
