package com.adaptive.planner.service;

import com.adaptive.planner.dto.CognitiveLoadAssessmentDto;
import com.adaptive.planner.dto.QuickRebalanceProposalDto;
import com.adaptive.planner.entity.DailyCheckinEntity;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.entity.UserAccessibilityProfileEntity;
import com.adaptive.planner.repository.DailyCheckinRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import com.adaptive.planner.repository.UserAccessibilityProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CognitiveLoadEvaluationServiceTest {

    @Mock
    private TimeBlockRepository timeBlockRepository;

    @Mock
    private UserAccessibilityProfileRepository profileRepository;

    @Mock
    private DailyCheckinRepository dailyCheckinRepository;

    @InjectMocks
    private CognitiveLoadEvaluationService evaluationService;

    private QuickRebalanceService rebalanceService;

    private final LocalDate testDate = LocalDate.of(2026, 9, 22);

    @BeforeEach
    void setUp() {
        rebalanceService = new QuickRebalanceService(timeBlockRepository, evaluationService);
    }

    @Test
    void testEmptySchedule_ReturnsLightLoad() {
        when(timeBlockRepository.findByDateOrderByStartTimeAsc(testDate)).thenReturn(List.of());
        when(profileRepository.findByUserId("default-user")).thenReturn(Optional.empty());
        when(dailyCheckinRepository.findByUserIdAndCheckinDate("default-user", testDate)).thenReturn(Optional.empty());

        CognitiveLoadAssessmentDto result = evaluationService.evaluateSchedule("default-user", testDate);

        assertNotNull(result);
        assertEquals("LIGHT", result.getLevel());
        assertEquals(10, result.getScore());
        assertFalse(result.isDemanding());
        assertEquals(0, result.getMetrics().getTotalTasks());
    }

    @Test
    void testDemandingSchedule_ReturnsHeavyLoad() {
        List<TimeBlockEntity> heavyBlocks = List.of(
                TimeBlockEntity.builder().id(1L).title("Deep Architecture Work").startTime("09:00").endTime("11:00").category("work").energyLevel("high").build(),
                TimeBlockEntity.builder().id(2L).title("Emergency Team Meeting").startTime("11:00").endTime("12:00").category("social").energyLevel("medium").build(),
                TimeBlockEntity.builder().id(3L).title("Client Call").startTime("12:00").endTime("13:00").category("social").energyLevel("medium").build(),
                TimeBlockEntity.builder().id(4L).title("Design System Sprint").startTime("13:00").endTime("14:30").category("design").energyLevel("high").build(),
                TimeBlockEntity.builder().id(5L).title("Sprint Review").startTime("14:30").endTime("16:00").category("social").energyLevel("medium").build(),
                TimeBlockEntity.builder().id(6L).title("Production Release").startTime("16:00").endTime("17:30").category("work").priority("HIGH").deadline("2026-09-22T18:00").build()
        );

        when(timeBlockRepository.findByDateOrderByStartTimeAsc(testDate)).thenReturn(heavyBlocks);
        when(profileRepository.findByUserId("default-user")).thenReturn(Optional.of(
                UserAccessibilityProfileEntity.builder().sensorySensitivity("high").build()
        ));
        when(dailyCheckinRepository.findByUserIdAndCheckinDate("default-user", testDate)).thenReturn(Optional.of(
                DailyCheckinEntity.builder().energyLevel(2).moodLabel("exhausted").build()
        ));

        CognitiveLoadAssessmentDto result = evaluationService.evaluateSchedule("default-user", testDate);

        assertNotNull(result);
        assertEquals("HEAVY", result.getLevel());
        assertTrue(result.getScore() >= 75);
        assertTrue(result.isDemanding());
        assertTrue(result.getMetrics().getBackToBackCount() >= 3);
        assertTrue(result.getMetrics().getMeetingCount() >= 3);
        assertFalse(result.getBulletPoints().isEmpty());
    }

    @Test
    void testQuickRebalanceOptions_GeneratesThreeDistinctProposals() {
        List<TimeBlockEntity> sampleBlocks = List.of(
                TimeBlockEntity.builder().id(1L).title("Coding").startTime("09:00").endTime("10:30").category("work").build(),
                TimeBlockEntity.builder().id(2L).title("Meeting").startTime("10:30").endTime("11:30").category("social").build(),
                TimeBlockEntity.builder().id(3L).title("Research").startTime("11:30").endTime("13:00").category("work").priority("FLEXIBLE").build()
        );

        when(timeBlockRepository.findByDateOrderByStartTimeAsc(testDate)).thenReturn(sampleBlocks);
        when(profileRepository.findByUserId("default-user")).thenReturn(Optional.empty());
        when(dailyCheckinRepository.findByUserIdAndCheckinDate("default-user", testDate)).thenReturn(Optional.empty());

        QuickRebalanceProposalDto proposal = rebalanceService.generateRebalanceOptions("default-user", testDate);

        assertNotNull(proposal);
        assertEquals(3, proposal.getOptions().size());
        assertEquals("ADD_BUFFER", proposal.getOptions().get(0).getType());
        assertEquals("MOVE_FLEXIBLE_TASK", proposal.getOptions().get(1).getType());
        assertEquals("REDUCE_CONTEXT_SWITCH", proposal.getOptions().get(2).getType());
    }
}
