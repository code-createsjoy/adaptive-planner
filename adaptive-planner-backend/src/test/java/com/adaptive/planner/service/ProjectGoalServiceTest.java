package com.adaptive.planner.service;

import com.adaptive.planner.dto.ApplyGoalScenarioRequest;
import com.adaptive.planner.dto.GoalMilestoneDto;
import com.adaptive.planner.dto.GoalScenarioOption;
import com.adaptive.planner.dto.ProjectGoalDto;
import com.adaptive.planner.dto.ProjectSubtaskDto;
import com.adaptive.planner.entity.FeasibilityStatus;
import com.adaptive.planner.entity.ProjectGoalEntity;
import com.adaptive.planner.entity.ProjectGoalStatus;
import com.adaptive.planner.entity.ProjectSubtaskEntity;
import com.adaptive.planner.entity.TimeBlockEntity;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectGoalServiceTest {

    @Mock
    private ProjectGoalRepository projectGoalRepository;

    @Mock
    private ProjectSubtaskRepository projectSubtaskRepository;

    @Mock
    private TimeBlockRepository timeBlockRepository;

    @Mock
    private WeeklyRoutineService weeklyRoutineService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private com.adaptive.planner.repository.AdaptationActionRepository adaptationActionRepository;

    @InjectMocks
    private ProjectGoalService projectGoalService;

    private ProjectGoalEntity testGoal;
    private List<ProjectSubtaskEntity> testSubtasks;

    @BeforeEach
    void setUp() {
        testGoal = ProjectGoalEntity.builder()
                .id(1L)
                .title("Mini Store Website")
                .officialDeadline(LocalDate.now().plusWeeks(2))
                .internalTargetDate(LocalDate.now().plusWeeks(2).minusDays(2))
                .bufferDays(2)
                .status(ProjectGoalStatus.IN_PROGRESS)
                .feasibilityStatus(FeasibilityStatus.FEASIBLE)
                .build();

        testSubtasks = new ArrayList<>();
        testSubtasks.add(ProjectSubtaskEntity.builder()
                .id(101L)
                .projectId(1L)
                .milestoneName("UI Design")
                .title("Build Hero Section")
                .estimatedMinutes(60)
                .completed(false)
                .scheduledDate(LocalDate.now())
                .orderIndex(0)
                .build());
        testSubtasks.add(ProjectSubtaskEntity.builder()
                .id(102L)
                .projectId(1L)
                .milestoneName("Frontend")
                .title("Cart & Checkout")
                .estimatedMinutes(120)
                .completed(false)
                .scheduledDate(LocalDate.now().plusDays(1))
                .orderIndex(1)
                .build());
    }

    @Test
    void testGetGoalByIdCalculatesDerivedProgressAccurately() {
        when(projectGoalRepository.findById(1L)).thenReturn(Optional.of(testGoal));
        when(projectSubtaskRepository.findByProjectIdOrderByOrderIndexAsc(1L)).thenReturn(testSubtasks);

        ProjectGoalDto result = projectGoalService.getGoalById(1L);

        assertNotNull(result);
        assertEquals(180, result.getTotalEstimatedMinutes());
        assertEquals(0, result.getCompletedEstimatedMinutes());
        assertEquals(0, result.getProgressPercentage());
        assertEquals("UI Design", result.getCurrentMilestone());
    }

    @Test
    void testToggleSubtaskCompletionUpdatesDerivedProgressAndGoalStatus() {
        when(projectSubtaskRepository.findById(101L)).thenReturn(Optional.of(testSubtasks.get(0)));
        when(projectSubtaskRepository.save(any(ProjectSubtaskEntity.class))).thenAnswer(i -> i.getArgument(0));
        when(projectSubtaskRepository.findByProjectIdOrderByOrderIndexAsc(1L)).thenReturn(testSubtasks);
        when(projectGoalRepository.findById(1L)).thenReturn(Optional.of(testGoal));

        ProjectSubtaskDto toggled = projectGoalService.toggleSubtask(101L, true);
        assertTrue(toggled.getCompleted());

        // Verify progress is derived: 60 / 180 = 33%
        testSubtasks.get(0).setCompleted(true);
        ProjectGoalDto updatedGoal = projectGoalService.getGoalById(1L);
        assertEquals(60, updatedGoal.getCompletedEstimatedMinutes());
        assertEquals(33, updatedGoal.getProgressPercentage());
    }

    @Test
    void testApplyGoalScenarioCreatesGoalSubtasksAndTimeBlocks() {
        when(projectGoalRepository.save(any(ProjectGoalEntity.class))).thenAnswer(i -> {
            ProjectGoalEntity g = i.getArgument(0);
            g.setId(10L);
            return g;
        });
        when(timeBlockRepository.save(any(TimeBlockEntity.class))).thenAnswer(i -> {
            TimeBlockEntity tb = i.getArgument(0);
            tb.setId(201L);
            return tb;
        });
        when(projectSubtaskRepository.findByProjectIdOrderByOrderIndexAsc(10L)).thenReturn(new ArrayList<>());

        GoalMilestoneDto milestone = GoalMilestoneDto.builder()
                .name("UI Design")
                .subtasks(List.of(
                        ProjectSubtaskDto.builder().title("Wireframe").estimatedMinutes(60).build()
                ))
                .build();

        GoalScenarioOption scenario = GoalScenarioOption.builder()
                .id("recommended")
                .roadmapDays(List.of(
                        GoalScenarioOption.DailyRoadmapDayDto.builder()
                                .date(LocalDate.now())
                                .blocks(List.of(
                                        GoalScenarioOption.RoadmapBlockDto.builder()
                                                .title("Mini Store UI")
                                                .startTime("14:00")
                                                .endTime("16:00")
                                                .subtaskTitles(List.of("Wireframe"))
                                                .build()
                                ))
                                .build()
                ))
                .build();

        ApplyGoalScenarioRequest request = ApplyGoalScenarioRequest.builder()
                .goalTitle("Mini Store Website")
                .officialDeadline(LocalDate.now().plusWeeks(2))
                .milestones(List.of(milestone))
                .selectedScenario(scenario)
                .build();

        ProjectGoalDto created = projectGoalService.applyGoalScenario(request);
        assertNotNull(created);
        assertEquals(10L, created.getId());
        verify(projectGoalRepository, times(1)).save(any(ProjectGoalEntity.class));
        verify(timeBlockRepository, times(1)).save(any(TimeBlockEntity.class));
        verify(projectSubtaskRepository, times(1)).saveAll(anyList());
    }

    @Test
    void testCompleteProjectClearsTimeBlockMicrostepsAndRecordsHistory() {
        when(projectGoalRepository.findById(1L)).thenReturn(Optional.of(testGoal));
        when(projectGoalRepository.save(any(ProjectGoalEntity.class))).thenAnswer(i -> i.getArgument(0));
        when(projectSubtaskRepository.findByProjectIdOrderByOrderIndexAsc(1L)).thenReturn(testSubtasks);

        TimeBlockEntity linkedBlock = TimeBlockEntity.builder()
                .id(101L)
                .title("Work Block")
                .microStepsJson("[{\"id\":\"1\",\"text\":\"Task\",\"done\":false}]")
                .projectGoalId(1L)
                .build();
        when(timeBlockRepository.findByProjectGoalId(1L)).thenReturn(List.of(linkedBlock));

        ProjectGoalDto result = projectGoalService.completeProject(1L);

        assertNotNull(result);
        assertEquals(ProjectGoalStatus.COMPLETED, testGoal.getStatus());
        assertTrue(testSubtasks.stream().allMatch(ProjectSubtaskEntity::getCompleted));
        assertNull(linkedBlock.getMicroStepsJson());
        assertTrue(linkedBlock.getIsCompleted());
        assertEquals("COMPLETED", linkedBlock.getStatus());

        verify(notificationService, times(1)).createNotification(any());
        verify(adaptationActionRepository, times(1)).save(any());
    }
}
