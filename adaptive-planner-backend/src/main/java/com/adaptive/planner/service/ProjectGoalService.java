package com.adaptive.planner.service;

import com.adaptive.planner.dto.*;
import com.adaptive.planner.entity.*;
import com.adaptive.planner.exception.ResourceNotFoundException;
import com.adaptive.planner.repository.ProjectGoalRepository;
import com.adaptive.planner.repository.ProjectSubtaskRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectGoalService {

    private final ProjectGoalRepository projectGoalRepository;
    private final ProjectSubtaskRepository projectSubtaskRepository;
    private final TimeBlockRepository timeBlockRepository;
    private final WeeklyRoutineService weeklyRoutineService;
    private final NotificationService notificationService;
    private final com.adaptive.planner.repository.AdaptationActionRepository adaptationActionRepository;

    @Transactional(readOnly = true)
    public List<ProjectGoalDto> getAllGoals() {
        return projectGoalRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::enrichGoalDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectGoalDto getGoalById(Long id) {
        ProjectGoalEntity entity = projectGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dự án với ID: " + id));
        return enrichGoalDto(entity);
    }

    @Transactional(readOnly = true)
    public List<ProjectSubtaskDto> getTodaySubtasks(LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        return projectSubtaskRepository.findByScheduledDateOrderByOrderIndexAsc(queryDate)
                .stream()
                .map(this::toSubtaskDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectSubtaskDto toggleSubtask(Long subtaskId, Boolean completed) {
        ProjectSubtaskEntity subtask = projectSubtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy subtask với ID: " + subtaskId));

        subtask.setCompleted(completed != null ? completed : !Boolean.TRUE.equals(subtask.getCompleted()));
        subtask = projectSubtaskRepository.save(subtask);

        // Check if all subtasks in project are completed
        List<ProjectSubtaskEntity> allSubtasks = projectSubtaskRepository.findByProjectIdOrderByOrderIndexAsc(subtask.getProjectId());
        boolean allDone = allSubtasks.stream().allMatch(s -> Boolean.TRUE.equals(s.getCompleted()));

        ProjectGoalEntity goal = projectGoalRepository.findById(subtask.getProjectId()).orElse(null);
        if (goal != null) {
            if (allDone && !allSubtasks.isEmpty()) {
                goal.setStatus(ProjectGoalStatus.COMPLETED);
                // Emit PROJECT_COMPLETED notification
                try {
                    notificationService.createNotification(CreateNotificationRequest.builder()
                            .type("PROJECT_COMPLETED")
                            .priority("NORMAL")
                            .title("Congratulations! You completed the project")
                            .message("All subtasks in project \"" + goal.getTitle() + "\" have been successfully completed.")
                            .relatedEntityType("PROJECT")
                            .relatedEntityId(goal.getId())
                            .actionType("VIEW_PROJECT")
                            .actionData("{\"projectId\":" + goal.getId() + "}")
                            .eventKey("project_completed:" + goal.getId())
                            .build());
                } catch (Exception ex) {
                    log.warn("Could not emit project completion notification: {}", ex.getMessage());
                }
            } else if (goal.getStatus() == ProjectGoalStatus.COMPLETED) {
                goal.setStatus(ProjectGoalStatus.IN_PROGRESS);
            }
            projectGoalRepository.save(goal);
        }

        return toSubtaskDto(subtask);
    }

    @Transactional
    public ProjectGoalDto completeProject(Long projectId) {
        ProjectGoalEntity goal = projectGoalRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // 1. Mark goal as completed
        goal.setStatus(ProjectGoalStatus.COMPLETED);
        goal = projectGoalRepository.save(goal);

        // 2. Mark all subtasks as completed
        List<ProjectSubtaskEntity> subtasks = projectSubtaskRepository.findByProjectIdOrderByOrderIndexAsc(projectId);
        for (ProjectSubtaskEntity st : subtasks) {
            st.setCompleted(true);
        }
        projectSubtaskRepository.saveAll(subtasks);

        // 3. Clear microsteps and checklist from associated timeblocks so timetable is clean and uncluttered
        List<TimeBlockEntity> projectBlocks = timeBlockRepository.findByProjectGoalId(projectId);
        for (TimeBlockEntity block : projectBlocks) {
            block.setMicroStepsJson(null);
            block.setIsCompleted(true);
            block.setStatus("COMPLETED");
        }
        timeBlockRepository.saveAll(projectBlocks);

        // 4. Emit PROJECT_COMPLETED notification
        try {
            notificationService.createNotification(CreateNotificationRequest.builder()
                    .type("PROJECT_COMPLETED")
                    .priority("NORMAL")
                    .title("Congratulations! Project completed")
                    .message("Project \"" + goal.getTitle() + "\" has been completed and archived. Timetable has been cleaned up.")
                    .relatedEntityType("PROJECT")
                    .relatedEntityId(goal.getId())
                    .actionType("VIEW_PROJECT")
                    .actionData("{\"projectId\":" + goal.getId() + "}")
                    .eventKey("project_completed_confirm:" + goal.getId() + ":" + System.currentTimeMillis())
                    .build());
        } catch (Exception ex) {
            log.warn("Could not emit project completion notification: {}", ex.getMessage());
        }

        // 5. Record in Activity History (AdaptationActionEntity)
        try {
            AdaptationActionEntity action = AdaptationActionEntity.builder()
                    .reason("Completed and archived project history: " + goal.getTitle())
                    .scenarioTitle("Confirm project completion")
                    .selectedScenarioId("completed")
                    .date(LocalDate.now())
                    .beforeSnapshotJson("[]")
                    .afterSnapshotJson("[]")
                    .status("APPLIED")
                    .build();
            adaptationActionRepository.save(action);
        } catch (Exception ex) {
            log.warn("Could not record project completion in history: {}", ex.getMessage());
        }

        return enrichGoalDto(goal);
    }

    @Transactional
    public ProjectGoalDto applyGoalScenario(ApplyGoalScenarioRequest request) {
        log.info("Applying goal scenario: {}", request.getGoalTitle());

        // 1. Create ProjectGoalEntity
        ProjectGoalEntity goal = ProjectGoalEntity.builder()
                .title(request.getGoalTitle() != null ? request.getGoalTitle() : "New Project")
                .description(request.getDescription())
                .officialDeadline(request.getOfficialDeadline() != null ? request.getOfficialDeadline() : LocalDate.now().plusWeeks(2))
                .internalTargetDate(request.getInternalTargetDate() != null ? request.getInternalTargetDate() : LocalDate.now().plusWeeks(2).minusDays(2))
                .bufferDays(request.getBufferDays() != null ? request.getBufferDays() : 2)
                .status(ProjectGoalStatus.IN_PROGRESS)
                .feasibilityStatus(FeasibilityStatus.FEASIBLE)
                .conversationId(request.getConversationId())
                .build();

        goal = projectGoalRepository.save(goal);
        final Long projectId = goal.getId();

        // 2. Persist Subtasks from milestones
        int orderCounter = 0;
        List<ProjectSubtaskEntity> savedSubtasks = new ArrayList<>();

        if (request.getMilestones() != null && !request.getMilestones().isEmpty()) {
            for (GoalMilestoneDto milestone : request.getMilestones()) {
                if (milestone.getSubtasks() != null) {
                    for (ProjectSubtaskDto subtaskDto : milestone.getSubtasks()) {
                        ProjectSubtaskEntity entity = ProjectSubtaskEntity.builder()
                                .projectId(projectId)
                                .milestoneName(milestone.getName() != null ? milestone.getName() : "Milestone")
                                .title(subtaskDto.getTitle())
                                .estimatedMinutes(subtaskDto.getEstimatedMinutes() != null ? subtaskDto.getEstimatedMinutes() : 60)
                                .completed(false)
                                .orderIndex(orderCounter++)
                                .build();
                        savedSubtasks.add(entity);
                    }
                }
            }
        }

        // 3. If roadmap days provided in scenario, create TimeBlocks or embed into existing work routine
        if (request.getSelectedScenario() != null && request.getSelectedScenario().getRoadmapDays() != null) {
            int subtaskIdx = 0;
            for (GoalScenarioOption.DailyRoadmapDayDto dayDto : request.getSelectedScenario().getRoadmapDays()) {
                if (Boolean.TRUE.equals(dayDto.getIsBufferDay())) {
                    continue;
                }
                LocalDate date = dayDto.getDate();

                for (GoalScenarioOption.RoadmapBlockDto blockDto : dayDto.getBlocks()) {
                    // 1. Resolve matching subtasks for this block first
                    List<ProjectSubtaskEntity> currentBlockSubtasks = new ArrayList<>();
                    if (blockDto.getSubtaskTitles() != null && !blockDto.getSubtaskTitles().isEmpty()) {
                        for (String subtaskTitle : blockDto.getSubtaskTitles()) {
                            for (ProjectSubtaskEntity st : savedSubtasks) {
                                if (st.getScheduledDate() == null && st.getTitle().equalsIgnoreCase(subtaskTitle)) {
                                    st.setScheduledDate(date);
                                    currentBlockSubtasks.add(st);
                                    break;
                                }
                            }
                        }
                    } else if (subtaskIdx < savedSubtasks.size()) {
                        ProjectSubtaskEntity st = savedSubtasks.get(subtaskIdx++);
                        if (st.getScheduledDate() == null) {
                            st.setScheduledDate(date);
                            currentBlockSubtasks.add(st);
                        }
                    }

                    StringBuilder msJson = new StringBuilder();
                    if (!currentBlockSubtasks.isEmpty()) {
                        msJson.append("[");
                        for (int i = 0; i < currentBlockSubtasks.size(); i++) {
                            if (i > 0) msJson.append(",");
                            msJson.append(String.format("{\"id\":\"st-%d\",\"text\":\"%s\",\"done\":false}", i, currentBlockSubtasks.get(i).getTitle().replace("\"", "\\\"")));
                        }
                        msJson.append("]");
                    }

                    TimeBlockEntity timeBlock = null;

                    // Option A: Embed directly into existing work hours/routine on timetable if permitted by scenario
                    if ("EXISTING_WORK_FIT".equalsIgnoreCase(blockDto.getBlockType())) {
                        List<TimeBlockEntity> existingWorkBlocks = timeBlockRepository.findByDateOrderByStartTimeAsc(date)
                                .stream()
                                .filter(b -> "work".equalsIgnoreCase(b.getCategory()) && !"CANCELLED".equalsIgnoreCase(b.getOverrideType()))
                                .sorted((a, b) -> Integer.compare(parseDurationMinutes(b.getStartTime(), b.getEndTime()), parseDurationMinutes(a.getStartTime(), a.getEndTime())))
                                .collect(Collectors.toList());

                        if (!existingWorkBlocks.isEmpty()) {
                            timeBlock = existingWorkBlocks.get(0);
                            timeBlock.setProjectGoalId(projectId);
                            String milestoneName = blockDto.getMilestoneName() != null ? blockDto.getMilestoneName() : "Focus";
                            timeBlock.setDetail("Project: " + goal.getTitle() + " · " + milestoneName);
                            if (msJson.length() > 0) {
                                timeBlock.setMicroStepsJson(msJson.toString());
                            }
                            timeBlock = timeBlockRepository.save(timeBlock);
                        } else if (weeklyRoutineService != null) {
                            // Look up routine work templates for that day and select the one with largest duration (most work hours)
                            List<WeeklyRoutineDto> routines = weeklyRoutineService.getActiveRoutinesForDay(date.getDayOfWeek());
                            WeeklyRoutineDto workRoutine = routines.stream()
                                    .filter(r -> "work".equalsIgnoreCase(r.getCategory()) || (r.getTitle() != null && r.getTitle().toLowerCase().contains("work")))
                                    .max(Comparator.comparingInt(r -> parseDurationMinutes(r.getStartTime(), r.getEndTime())))
                                    .orElse(null);

                            if (workRoutine != null) {
                                String milestoneName = blockDto.getMilestoneName() != null ? blockDto.getMilestoneName() : "Focus";
                                timeBlock = TimeBlockEntity.builder()
                                        .title(workRoutine.getTitle())
                                        .detail("Project: " + goal.getTitle() + " · " + milestoneName)
                                        .startTime(workRoutine.getStartTime())
                                        .endTime(workRoutine.getEndTime())
                                        .category(workRoutine.getCategory())
                                        .energyLevel(workRoutine.getEnergyLevel())
                                        .priority(workRoutine.getPriority())
                                        .isMovable(false)
                                        .status("ACTIVE")
                                        .isCompleted(false)
                                        .isBufferBlock(false)
                                        .microStepsJson(msJson.length() > 0 ? msJson.toString() : null)
                                        .date(date)
                                        .sourceType("ROUTINE")
                                        .sourceRoutineId(workRoutine.getId())
                                        .overrideType("MODIFIED")
                                        .projectGoalId(projectId)
                                        .build();
                                timeBlock = timeBlockRepository.save(timeBlock);
                            }
                        }
                    }

                    // Option B: Add a new dedicated slot into timetable (for Dedicated Deep Work, Flexible, or if no work routine exists)
                    if (timeBlock == null) {
                        timeBlock = TimeBlockEntity.builder()
                                .title(blockDto.getTitle() != null ? blockDto.getTitle() : ("Project: " + goal.getTitle()))
                                .detail(blockDto.getMilestoneName() != null ? blockDto.getMilestoneName() : blockDto.getNote())
                                .startTime(blockDto.getStartTime())
                                .endTime(blockDto.getEndTime())
                                .category("work")
                                .energyLevel("high")
                                .priority("HIGH")
                                .isMovable(true)
                                .status("ACTIVE")
                                .isCompleted(false)
                                .isBufferBlock(false)
                                .microStepsJson(msJson.length() > 0 ? msJson.toString() : null)
                                .date(date)
                                .sourceType("AI_ADDED")
                                .projectGoalId(projectId)
                                .build();
                        timeBlock = timeBlockRepository.save(timeBlock);
                    }

                    // Link subtasks to this saved timeBlock ID
                    final Long timeBlockId = timeBlock.getId();
                    for (ProjectSubtaskEntity st : currentBlockSubtasks) {
                        st.setTimeBlockId(timeBlockId);
                    }
                }
            }
        }

        if (!savedSubtasks.isEmpty()) {
            projectSubtaskRepository.saveAll(savedSubtasks);
        }

        return enrichGoalDto(goal);
    }

    private ProjectGoalDto enrichGoalDto(ProjectGoalEntity goal) {
        List<ProjectSubtaskEntity> subtaskEntities = projectSubtaskRepository.findByProjectIdOrderByOrderIndexAsc(goal.getId());
        List<ProjectSubtaskDto> subtaskDtos = subtaskEntities.stream()
                .map(this::toSubtaskDto)
                .collect(Collectors.toList());

        int totalEstimatedMinutes = 0;
        int completedEstimatedMinutes = 0;
        String currentMilestone = "Completed";

        for (ProjectSubtaskEntity s : subtaskEntities) {
            int est = s.getEstimatedMinutes() != null ? s.getEstimatedMinutes() : 0;
            totalEstimatedMinutes += est;
            if (Boolean.TRUE.equals(s.getCompleted())) {
                completedEstimatedMinutes += est;
            } else if ("Completed".equals(currentMilestone)) {
                currentMilestone = s.getMilestoneName() != null ? s.getMilestoneName() : "Ongoing";
            }
        }

        int progressPercentage = totalEstimatedMinutes > 0
                ? (int) Math.round(((double) completedEstimatedMinutes / totalEstimatedMinutes) * 100)
                : 0;

        return ProjectGoalDto.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .officialDeadline(goal.getOfficialDeadline())
                .internalTargetDate(goal.getInternalTargetDate())
                .bufferDays(goal.getBufferDays())
                .status(goal.getStatus())
                .feasibilityStatus(goal.getFeasibilityStatus())
                .conversationId(goal.getConversationId())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .subtasks(subtaskDtos)
                .totalEstimatedMinutes(totalEstimatedMinutes)
                .completedEstimatedMinutes(completedEstimatedMinutes)
                .progressPercentage(progressPercentage)
                .currentMilestone(currentMilestone)
                .remainingBufferDays(goal.getBufferDays())
                .build();
    }

    private ProjectSubtaskDto toSubtaskDto(ProjectSubtaskEntity entity) {
        return ProjectSubtaskDto.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .milestoneName(entity.getMilestoneName())
                .title(entity.getTitle())
                .estimatedMinutes(entity.getEstimatedMinutes())
                .completed(entity.getCompleted())
                .scheduledDate(entity.getScheduledDate())
                .timeBlockId(entity.getTimeBlockId())
                .orderIndex(entity.getOrderIndex())
                .build();
    }

    private int parseDurationMinutes(String start, String end) {
        if (start == null || end == null) return 0;
        try {
            String[] s = start.split(":");
            String[] e = end.split(":");
            int sm = Integer.parseInt(s[0]) * 60 + Integer.parseInt(s[1]);
            int em = Integer.parseInt(e[0]) * 60 + Integer.parseInt(e[1]);
            return Math.max(0, em - sm);
        } catch (Exception ex) {
            return 0;
        }
    }
}
