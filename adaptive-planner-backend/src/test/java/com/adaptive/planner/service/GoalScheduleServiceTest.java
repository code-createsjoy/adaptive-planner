package com.adaptive.planner.service;

import com.adaptive.planner.dto.GoalDecompositionRequest;
import com.adaptive.planner.dto.GoalDecompositionResponse;
import com.adaptive.planner.dto.GoalRebalanceRequest;
import com.adaptive.planner.dto.GoalRebalanceResponse;
import com.adaptive.planner.entity.FeasibilityStatus;
import com.adaptive.planner.entity.ProjectGoalEntity;
import com.adaptive.planner.repository.ProjectGoalRepository;
import com.adaptive.planner.repository.ProjectSubtaskRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoalScheduleServiceTest {

    @Mock
    private TimeBlockRepository timeBlockRepository;

    @Mock
    private ProjectGoalRepository projectGoalRepository;

    @Mock
    private ProjectSubtaskRepository projectSubtaskRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private GoalScheduleService goalScheduleService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testDecomposeGoalGenerates3ScenariosWithBufferAndFeasibility() {
        when(timeBlockRepository.findByDateBetweenOrderByStartTimeAsc(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new ArrayList<>());

        GoalDecompositionRequest request = GoalDecompositionRequest.builder()
                .prompt("Tôi cần làm 1 website mini bán hàng trong vòng 2 tuần")
                .startDate(LocalDate.of(2026, 9, 21))
                .build();

        GoalDecompositionResponse response = goalScheduleService.decomposeGoal(request);

        assertNotNull(response);
        assertEquals("Website Bán Hàng Mini", response.getGoalTitle());
        assertEquals(LocalDate.of(2026, 10, 5), response.getOfficialDeadline());
        assertEquals(LocalDate.of(2026, 10, 3), response.getInternalTargetDate());
        assertEquals(2, response.getBufferDays());
        assertEquals(FeasibilityStatus.FEASIBLE, response.getFeasibilityStatus());
        assertEquals(5, response.getMilestones().size());
        assertEquals(3, response.getScenarios().size());

        // Check Scenario 1 (Recommended)
        var recScenario = response.getScenarios().get(0);
        assertEquals("recommended", recScenario.getId());
        assertEquals("RECOMMENDED", recScenario.getBadge());
        assertFalse(recScenario.getRoadmapDays().isEmpty());
    }

    @Test
    void testGenerateRebalanceOptionsOffers3RecoveryOptions() {
        ProjectGoalEntity goal = ProjectGoalEntity.builder()
                .id(1L)
                .title("Website Mini Bán Hàng")
                .build();
        when(projectGoalRepository.findById(1L)).thenReturn(Optional.of(goal));

        GoalRebalanceRequest request = GoalRebalanceRequest.builder()
                .projectId(1L)
                .overdueMinutes(80)
                .currentDate(LocalDate.of(2026, 9, 21))
                .build();

        GoalRebalanceResponse response = goalScheduleService.generateRebalanceOptions(request);

        assertNotNull(response);
        assertEquals(80, response.getOverdueMinutes());
        assertTrue(response.getCompanionMessage().contains("80 phút"));
        assertEquals(3, response.getOptions().size());

        // Option 1: Smart Rebalance
        var opt1 = response.getOptions().get(0);
        assertEquals("smart_rebalance", opt1.getId());
        assertEquals("RECOMMENDED", opt1.getBadge());
        assertTrue(opt1.getDeadlineSafe());

        // Option 2: Catch Up Tomorrow
        var opt2 = response.getOptions().get(1);
        assertEquals("catch_up_tomorrow", opt2.getId());

        // Option 3: Use Project Buffer
        var opt3 = response.getOptions().get(2);
        assertEquals("use_buffer", opt3.getId());
    }
}
