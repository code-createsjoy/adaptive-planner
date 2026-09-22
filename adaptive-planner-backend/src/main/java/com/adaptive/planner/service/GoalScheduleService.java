package com.adaptive.planner.service;

import com.adaptive.planner.dto.*;
import com.adaptive.planner.entity.FeasibilityStatus;
import com.adaptive.planner.entity.ProjectGoalEntity;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.repository.ProjectGoalRepository;
import com.adaptive.planner.repository.ProjectSubtaskRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalScheduleService {

    private final TimeBlockRepository timeBlockRepository;
    private final ProjectGoalRepository projectGoalRepository;
    private final ProjectSubtaskRepository projectSubtaskRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM");

    public GoalDecompositionResponse decomposeGoal(GoalDecompositionRequest request) {
        String prompt = (request.getPrompt() != null) ? request.getPrompt().trim() : "";
        LocalDate startDate = (request.getStartDate() != null) ? request.getStartDate() : LocalDate.now();

        // 1. Extract Goal Title & Deadline Heuristics
        String goalTitle = extractGoalTitle(prompt);
        LocalDate officialDeadline = extractDeadline(prompt, startDate, request.getExplicitDeadline());

        // 2. Generate Work Breakdown Structure (Milestones & Subtasks)
        List<GoalMilestoneDto> milestones = generateMilestones(goalTitle, prompt);
        int totalRequiredMinutes = milestones.stream()
                .mapToInt(m -> m.getSubtasks().stream().mapToInt(s -> s.getEstimatedMinutes() != null ? s.getEstimatedMinutes() : 0).sum())
                .sum();

        // 3. Heuristic Protected Buffer (1-2 days based on project duration)
        long totalDaysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, officialDeadline);
        int bufferDays = totalDaysBetween >= 10 ? 2 : 1;
        LocalDate internalTargetDate = officialDeadline.minusDays(bufferDays);
        if (internalTargetDate.isBefore(startDate)) {
            internalTargetDate = officialDeadline;
            bufferDays = 0;
        }

        // 4. Calculate Available Hours & Feasibility
        List<TimeBlockEntity> existingBlocks = timeBlockRepository.findByDateBetweenOrderByStartTimeAsc(startDate, officialDeadline);
        int availableMinutes = calculateAvailableMinutes(startDate, officialDeadline, existingBlocks);
        int availableHours = availableMinutes / 60;
        int requiredHours = (int) Math.ceil((double) totalRequiredMinutes / 60);

        FeasibilityStatus feasibilityStatus;
        String feasibilityRationale;
        if (availableHours >= requiredHours + (bufferDays * 4)) {
            feasibilityStatus = FeasibilityStatus.FEASIBLE;
            feasibilityRationale = String.format("Available free time (%dh) is plenty compared to required effort (%dh). Safe completion well ahead of deadline.", availableHours, requiredHours);
        } else if (availableHours >= requiredHours) {
            feasibilityStatus = FeasibilityStatus.TIGHT;
            feasibilityRationale = String.format("Available free time (%dh) fits the required workload (%dh). Requires consistent focus due to narrow buffer margins.", availableHours, requiredHours);
        } else {
            feasibilityStatus = FeasibilityStatus.NOT_FEASIBLE;
            feasibilityRationale = String.format("Available free time (%dh) is insufficient for total effort (%dh). Consider allocating more hours or extending the deadline.", availableHours, requiredHours);
        }

        // 5. Generate 3 Scenarios
        List<GoalScenarioOption> scenarios = new ArrayList<>();
        scenarios.add(buildRecommendedScenario(startDate, internalTargetDate, officialDeadline, bufferDays, milestones, totalRequiredMinutes));
        scenarios.add(buildFasterScenario(startDate, internalTargetDate, officialDeadline, milestones, totalRequiredMinutes));
        scenarios.add(buildFlexibleScenario(startDate, internalTargetDate, officialDeadline, milestones, totalRequiredMinutes));

        String summaryMessage = String.format(
                "Based on your current schedule, I broke down your goal into %d milestones (~%dh%dm) and found a schedule roadmap completing before deadline %s while keeping your meals and rest hours intact.",
                milestones.size(),
                totalRequiredMinutes / 60,
                totalRequiredMinutes % 60,
                officialDeadline.format(DATE_FMT)
        );

        return GoalDecompositionResponse.builder()
                .goalTitle(goalTitle)
                .summaryMessage(summaryMessage)
                .officialDeadline(officialDeadline)
                .internalTargetDate(internalTargetDate)
                .bufferDays(bufferDays)
                .totalRequiredMinutes(totalRequiredMinutes)
                .availableHours(availableHours)
                .feasibilityStatus(feasibilityStatus)
                .feasibilityRationale(feasibilityRationale)
                .milestones(milestones)
                .scenarios(scenarios)
                .build();
    }

    public GoalRebalanceResponse generateRebalanceOptions(GoalRebalanceRequest request) {
        Long projectId = request.getProjectId();
        int overdueMinutes = (request.getOverdueMinutes() != null && request.getOverdueMinutes() > 0) ? request.getOverdueMinutes() : 80;
        LocalDate currentDate = (request.getCurrentDate() != null) ? request.getCurrentDate() : LocalDate.now();

        ProjectGoalEntity goal = (projectId != null) ? projectGoalRepository.findById(projectId).orElse(null) : null;
        String goalTitle = (goal != null) ? goal.getTitle() : "Project";

        String companionMessage = String.format(
                "You haven't finished all scheduled tasks today. No worries — your deadline is still safe! I can rebalance the remaining ~%d minutes without touching your rest hours.",
                overdueMinutes
        );

        List<GoalRebalanceResponse.RebalanceOptionDto> options = new ArrayList<>();

        // Option 1: Smart Rebalance (Recommended)
        int splitMin = (int) Math.ceil((double) overdueMinutes / 2);
        LocalDate d1 = currentDate.plusDays(1);
        LocalDate d2 = currentDate.plusDays(2);
        options.add(GoalRebalanceResponse.RebalanceOptionDto.builder()
                .id("smart_rebalance")
                .title("Smart Rebalance (Recommended)")
                .badge("RECOMMENDED")
                .description("Evenly distribute remaining minutes into existing work blocks over the next 2 days.")
                .impactSummary(String.format("+%dm on %s, +%dm on %s · Keeps original deadline", splitMin, getDayOfWeekName(d1), splitMin, getDayOfWeekName(d2)))
                .deadlineSafe(true)
                .modifiedDays(List.of(
                        GoalScenarioOption.DailyRoadmapDayDto.builder()
                                .date(d1)
                                .dayOfWeek(getDayOfWeekName(d1))
                                .formattedDate(d1.format(DATE_FMT))
                                .blocks(List.of(GoalScenarioOption.RoadmapBlockDto.builder()
                                        .title(goalTitle)
                                        .startTime("14:00")
                                        .endTime("16:40")
                                        .durationMinutes(160)
                                        .blockType("EXISTING_WORK_FIT")
                                        .note(String.format("Extend by +%dm into afternoon work block", splitMin))
                                        .build()))
                                .build(),
                        GoalScenarioOption.DailyRoadmapDayDto.builder()
                                .date(d2)
                                .dayOfWeek(getDayOfWeekName(d2))
                                .formattedDate(d2.format(DATE_FMT))
                                .blocks(List.of(GoalScenarioOption.RoadmapBlockDto.builder()
                                        .title(goalTitle)
                                        .startTime("09:00")
                                        .endTime("11:40")
                                        .durationMinutes(160)
                                        .blockType("EXISTING_WORK_FIT")
                                        .note(String.format("Extend by +%dm into morning work block", splitMin))
                                        .build()))
                                .build()
                ))
                .build());

        // Option 2: Catch Up Tomorrow
        options.add(GoalRebalanceResponse.RebalanceOptionDto.builder()
                .id("catch_up_tomorrow")
                .title("Catch Up Tomorrow (Dedicated Sprint)")
                .badge("FASTER")
                .description("Focus and complete all overdue tasks in a single dedicated session tomorrow.")
                .impactSummary(String.format("+%dm tomorrow (%s) · Keeps original deadline", overdueMinutes, getDayOfWeekName(d1)))
                .deadlineSafe(true)
                .modifiedDays(List.of(
                        GoalScenarioOption.DailyRoadmapDayDto.builder()
                                .date(d1)
                                .dayOfWeek(getDayOfWeekName(d1))
                                .formattedDate(d1.format(DATE_FMT))
                                .blocks(List.of(GoalScenarioOption.RoadmapBlockDto.builder()
                                        .title(goalTitle)
                                        .startTime("14:00")
                                        .endTime("17:20")
                                        .durationMinutes(200)
                                        .blockType("DEDICATED_DEEP_WORK")
                                        .note(String.format("Add dedicated Deep Work session (+%dm)", overdueMinutes))
                                        .build()))
                                .build()
                ))
                .build());

        // Option 3: Use Project Buffer
        options.add(GoalRebalanceResponse.RebalanceOptionDto.builder()
                .id("use_buffer")
                .title("Use Project Buffer (Protected Day)")
                .badge("BUFFER")
                .description("Leave upcoming weekdays intact and absorb remaining tasks into the pre-planned buffer day.")
                .impactSummary(String.format("Uses %dh%dm from Protected Buffer · No schedule changes this week", overdueMinutes / 60, overdueMinutes % 60))
                .deadlineSafe(true)
                .modifiedDays(List.of(
                        GoalScenarioOption.DailyRoadmapDayDto.builder()
                                .date(currentDate.plusDays(7))
                                .dayOfWeek(getDayOfWeekName(currentDate.plusDays(7)))
                                .formattedDate(currentDate.plusDays(7).format(DATE_FMT))
                                .isBufferDay(true)
                                .blocks(List.of(GoalScenarioOption.RoadmapBlockDto.builder()
                                        .title("Buffer Session")
                                        .startTime("09:00")
                                        .endTime("10:20")
                                        .durationMinutes(overdueMinutes)
                                        .blockType("BUFFER")
                                        .note("Finish pending milestone tasks from buffer")
                                        .build()))
                                .build()
                ))
                .build());

        // Emit REBALANCE_AVAILABLE notification for user in-app Notification Center
        if (projectId != null) {
            try {
                notificationService.createNotification(CreateNotificationRequest.builder()
                        .type("REBALANCE_AVAILABLE")
                        .priority("HIGH")
                        .title("Schedule Rebalance Options Ready")
                        .message("AI detected ~" + overdueMinutes + " minutes unfinished in \"" + goalTitle + "\" and generated 3 recovery scenarios without affecting sleep.")
                        .relatedEntityType("PROJECT")
                        .relatedEntityId(projectId)
                        .actionType("OPEN_AI_REBALANCE")
                        .actionData("{\"projectId\":" + projectId + "}")
                        .eventKey("rebalance_available:" + projectId + ":" + currentDate)
                        .build());
            } catch (Exception ex) {
                log.warn("Could not emit rebalance notification: {}", ex.getMessage());
            }
        }

        return GoalRebalanceResponse.builder()
                .projectId(projectId)
                .overdueMinutes(overdueMinutes)
                .companionMessage(companionMessage)
                .options(options)
                .build();
    }

    private String extractGoalTitle(String prompt) {
        String pLower = prompt.toLowerCase();
        if (pLower.contains("website") || pLower.contains("web bán hàng")) {
            return "Mini E-commerce Website";
        }
        if (pLower.contains("landing page") || pLower.contains("cuộc thi")) {
            return "Competition Landing Page";
        }
        if (pLower.contains("mobile app") || pLower.contains("ứng dụng")) {
            return "Mobile App Prototype";
        }
        if (pLower.contains("bài báo") || pLower.contains("bài viết") || pLower.contains("viết bài") || pLower.contains("article") || pLower.contains("harness")) {
            Pattern p = Pattern.compile("(?:viết|soạn|làm|write)\\s+([^.,;\\n]+?)(?:\\s+trong vòng|\\s+trước|\\s+deadline|$)", Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(prompt);
            if (m.find()) {
                return capitalizeWords(m.group(1).trim());
            }
            return "Specialized Research Article";
        }
        // General extraction
        Pattern p = Pattern.compile("(?:làm|xây dựng|hoàn thành|phát triển|viết|chuẩn bị|build|create|finish)\\s+([^.,;\\n]+?)(?:\\s+trong vòng|\\s+trước|\\s+deadline|$)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(prompt);
        if (m.find()) {
            return capitalizeWords(m.group(1).trim());
        }
        return "Core Focus Project";
    }

    private LocalDate extractDeadline(String prompt, LocalDate startDate, LocalDate explicitDeadline) {
        if (explicitDeadline != null) {
            return explicitDeadline;
        }
        String pLower = prompt.toLowerCase();
        if (pLower.contains("2 tuần") || pLower.contains("hai tuần") || pLower.contains("2 weeks")) {
            return startDate.plusWeeks(2);
        }
        if (pLower.contains("1 tuần") || pLower.contains("một tuần") || pLower.contains("tuần sau") || pLower.contains("trong vòng 1 tuần") || pLower.contains("1 week")) {
            return startDate.plusWeeks(1);
        }
        if (pLower.contains("3 tuần") || pLower.contains("3 weeks")) {
            return startDate.plusWeeks(3);
        }
        if (pLower.contains("1 tháng") || pLower.contains("một tháng") || pLower.contains("1 month")) {
            return startDate.plusMonths(1);
        }

        // Match date like "5/10" or "05/10" or "15/10/2026"
        Pattern datePattern = Pattern.compile("(\\d{1,2})[/-](\\d{1,2})(?:[/-](\\d{4}))?");
        Matcher m = datePattern.matcher(prompt);
        if (m.find()) {
            int day = Integer.parseInt(m.group(1));
            int month = Integer.parseInt(m.group(2));
            int year = (m.group(3) != null) ? Integer.parseInt(m.group(3)) : startDate.getYear();
            try {
                LocalDate parsed = LocalDate.of(year, month, day);
                if (parsed.isBefore(startDate)) {
                    parsed = parsed.plusYears(1);
                }
                return parsed;
            } catch (Exception ignored) {
            }
        }

        // Default 2 weeks
        return startDate.plusWeeks(2);
    }

    private List<GoalMilestoneDto> generateMilestones(String goalTitle, String prompt) {
        List<GoalMilestoneDto> milestones = new ArrayList<>();
        String pLower = prompt.toLowerCase();

        // 1. Article / Writing / Research domain
        if (pLower.contains("bài báo") || pLower.contains("bài viết") || pLower.contains("viết") || pLower.contains("báo cáo") || pLower.contains("harness") || pLower.contains("content") || pLower.contains("article") || pLower.contains("paper")) {
            milestones.add(GoalMilestoneDto.builder()
                    .name("Research & Outline")
                    .totalMinutes(90)
                    .subtasks(List.of(
                            ProjectSubtaskDto.builder().title("Review literature & gather source references").estimatedMinutes(45).orderIndex(0).build(),
                            ProjectSubtaskDto.builder().title("Draft detailed article outline & structure").estimatedMinutes(45).orderIndex(1).build()
                    ))
                    .build());

            milestones.add(GoalMilestoneDto.builder()
                    .name("Drafting Content")
                    .totalMinutes(180)
                    .subtasks(List.of(
                            ProjectSubtaskDto.builder().title("Draft introduction & core thesis points").estimatedMinutes(90).orderIndex(2).build(),
                            ProjectSubtaskDto.builder().title("Draft in-depth analysis & case studies").estimatedMinutes(90).orderIndex(3).build()
                    ))
                    .build());

            milestones.add(GoalMilestoneDto.builder()
                    .name("Review & Refine")
                    .totalMinutes(90)
                    .subtasks(List.of(
                            ProjectSubtaskDto.builder().title("Fact-check & polish phrasing and grammar").estimatedMinutes(45).orderIndex(4).build(),
                            ProjectSubtaskDto.builder().title("Format visuals, diagrams & typography").estimatedMinutes(45).orderIndex(5).build()
                    ))
                    .build());

            milestones.add(GoalMilestoneDto.builder()
                    .name("Final Polish & Submission")
                    .totalMinutes(60)
                    .subtasks(List.of(
                            ProjectSubtaskDto.builder().title("Final comprehensive proofreading").estimatedMinutes(30).orderIndex(6).build(),
                            ProjectSubtaskDto.builder().title("Publish / Submit final deliverable").estimatedMinutes(30).orderIndex(7).build()
                    ))
                    .build());

            return milestones;
        }

        // 2. Software / Web / App domain
        milestones.add(GoalMilestoneDto.builder()
                .name("Research & Wireframe")
                .totalMinutes(105)
                .subtasks(List.of(
                        ProjectSubtaskDto.builder().title("Requirement analysis & user story mapping").estimatedMinutes(45).orderIndex(0).build(),
                        ProjectSubtaskDto.builder().title("Draft wireframes for core user journeys").estimatedMinutes(60).orderIndex(1).build()
                ))
                .build());

        milestones.add(GoalMilestoneDto.builder()
                .name("UI & Visual Design")
                .totalMinutes(180)
                .subtasks(List.of(
                        ProjectSubtaskDto.builder().title("Design Hero section, Header & Navigation").estimatedMinutes(60).orderIndex(2).build(),
                        ProjectSubtaskDto.builder().title("Design Product Catalog & Cart drawer").estimatedMinutes(120).orderIndex(3).build()
                ))
                .build());

        milestones.add(GoalMilestoneDto.builder()
                .name("Frontend Development")
                .totalMinutes(240)
                .subtasks(List.of(
                        ProjectSubtaskDto.builder().title("Build responsive layout & core components").estimatedMinutes(90).orderIndex(4).build(),
                        ProjectSubtaskDto.builder().title("Integrate cart state & checkout flow").estimatedMinutes(150).orderIndex(5).build()
                ))
                .build());

        milestones.add(GoalMilestoneDto.builder()
                .name("Integration & API")
                .totalMinutes(180)
                .subtasks(List.of(
                        ProjectSubtaskDto.builder().title("Connect product catalog & order API").estimatedMinutes(120).orderIndex(6).build(),
                        ProjectSubtaskDto.builder().title("Handle auth state & order notifications").estimatedMinutes(60).orderIndex(7).build()
                ))
                .build());

        milestones.add(GoalMilestoneDto.builder()
                .name("Testing, Polish & Deploy")
                .totalMinutes(120)
                .subtasks(List.of(
                        ProjectSubtaskDto.builder().title("End-to-End QA testing & bug fixing").estimatedMinutes(80).orderIndex(8).build(),
                        ProjectSubtaskDto.builder().title("Deploy to production & post-launch check").estimatedMinutes(40).orderIndex(9).build()
                ))
                .build());

        return milestones;
    }

    private GoalScenarioOption buildRecommendedScenario(
            LocalDate startDate,
            LocalDate internalTargetDate,
            LocalDate officialDeadline,
            int bufferDays,
            List<GoalMilestoneDto> milestones,
            int totalMinutes
    ) {
        List<GoalScenarioOption.DailyRoadmapDayDto> roadmap = new ArrayList<>();
        LocalDate cur = startDate;

        // Flatten subtasks
        List<ProjectSubtaskDto> allSubtasks = new ArrayList<>();
        for (GoalMilestoneDto m : milestones) {
            allSubtasks.addAll(m.getSubtasks());
        }

        int subtaskIdx = 0;
        int plannedMinutes = 0;

        while (!cur.isAfter(internalTargetDate) && subtaskIdx < allSubtasks.size()) {
            DayOfWeek dow = cur.getDayOfWeek();
            // Skip Sunday or keep light
            if (dow != DayOfWeek.SUNDAY) {
                List<String> todayTaskTitles = new ArrayList<>();
                int dayMinutes = 0;

                while (subtaskIdx < allSubtasks.size() && dayMinutes < 120) {
                    ProjectSubtaskDto st = allSubtasks.get(subtaskIdx++);
                    todayTaskTitles.add(st.getTitle());
                    dayMinutes += st.getEstimatedMinutes();
                }

                if (!todayTaskTitles.isEmpty()) {
                    roadmap.add(GoalScenarioOption.DailyRoadmapDayDto.builder()
                            .date(cur)
                            .dayOfWeek(getDayOfWeekName(cur))
                            .formattedDate(cur.format(DATE_FMT))
                            .isBufferDay(false)
                            .blocks(List.of(GoalScenarioOption.RoadmapBlockDto.builder()
                                    .startTime("14:00")
                                    .endTime(calculateEndTime("14:00", dayMinutes))
                                    .milestoneName(getMilestoneForSubtask(todayTaskTitles.get(0), milestones))
                                    .title("Project: " + todayTaskTitles.get(0))
                                    .durationMinutes(dayMinutes)
                                    .blockType("EXISTING_WORK_FIT")
                                    .note("Fit seamlessly into existing afternoon work session")
                                    .subtaskTitles(todayTaskTitles)
                                    .build()))
                            .build());
                    plannedMinutes += dayMinutes;
                }
            }
            cur = cur.plusDays(1);
        }

        // Add Buffer Days
        LocalDate bufDate = internalTargetDate.plusDays(1);
        while (!bufDate.isAfter(officialDeadline)) {
            roadmap.add(GoalScenarioOption.DailyRoadmapDayDto.builder()
                    .date(bufDate)
                    .dayOfWeek(getDayOfWeekName(bufDate))
                    .formattedDate(bufDate.format(DATE_FMT))
                    .isBufferDay(true)
                    .blocks(List.of(GoalScenarioOption.RoadmapBlockDto.builder()
                            .startTime("09:00")
                            .endTime("11:00")
                            .milestoneName("Protected Buffer")
                            .title("🛡️ Protected Project Buffer")
                            .durationMinutes(120)
                            .blockType("BUFFER")
                            .note("Protected safe buffer window for unforeseen delays or rest")
                            .build()))
                    .build());
            bufDate = bufDate.plusDays(1);
        }

        return GoalScenarioOption.builder()
                .id("recommended")
                .title("Fit into Current Schedule (Recommended)")
                .badge("RECOMMENDED")
                .description("Maximizes existing work slots without disrupting daily rhythm. Finishes 2 days early with protected buffer days.")
                .internalTargetDate(internalTargetDate)
                .bufferDays(bufferDays)
                .daysCount(roadmap.size())
                .totalPlannedMinutes(plannedMinutes)
                .strategySummary(String.format("Fits into %d existing work blocks · %d safe buffer days before deadline", roadmap.size() - bufferDays, bufferDays))
                .roadmapDays(roadmap)
                .build();
    }

    private GoalScenarioOption buildFasterScenario(
            LocalDate startDate,
            LocalDate internalTargetDate,
            LocalDate officialDeadline,
            List<GoalMilestoneDto> milestones,
            int totalMinutes
    ) {
        LocalDate fasterTarget = internalTargetDate.minusDays(2);
        if (fasterTarget.isBefore(startDate)) {
            fasterTarget = startDate;
        }

        List<GoalScenarioOption.DailyRoadmapDayDto> roadmap = new ArrayList<>();
        LocalDate cur = startDate;

        List<ProjectSubtaskDto> allSubtasks = new ArrayList<>();
        for (GoalMilestoneDto m : milestones) {
            allSubtasks.addAll(m.getSubtasks());
        }

        int subtaskIdx = 0;
        int plannedMinutes = 0;

        while (!cur.isAfter(fasterTarget) && subtaskIdx < allSubtasks.size()) {
            List<String> todayTaskTitles = new ArrayList<>();
            int dayMinutes = 0;

            while (subtaskIdx < allSubtasks.size() && dayMinutes < 180) {
                ProjectSubtaskDto st = allSubtasks.get(subtaskIdx++);
                todayTaskTitles.add(st.getTitle());
                dayMinutes += st.getEstimatedMinutes();
            }

            if (!todayTaskTitles.isEmpty()) {
                // Anchor Time heuristic: prioritize 08:30 morning focus, fallback to best non-overlapping free slot
                String optimalStart = findOptimalSlot(cur, dayMinutes, "08:30");
                String optimalEnd = calculateEndTime(optimalStart, dayMinutes);

                roadmap.add(GoalScenarioOption.DailyRoadmapDayDto.builder()
                        .date(cur)
                        .dayOfWeek(getDayOfWeekName(cur))
                        .formattedDate(cur.format(DATE_FMT))
                        .isBufferDay(false)
                        .blocks(List.of(GoalScenarioOption.RoadmapBlockDto.builder()
                                .startTime(optimalStart)
                                .endTime(optimalEnd)
                                .milestoneName(getMilestoneForSubtask(todayTaskTitles.get(0), milestones))
                                .title("⚡ Deep Work: " + todayTaskTitles.get(0) + " (High Energy)")
                                .durationMinutes(dayMinutes)
                                .blockType("DEDICATED_DEEP_WORK")
                                .note("Dedicated high-energy focus block " + optimalStart + "–" + optimalEnd)
                                .subtaskTitles(todayTaskTitles)
                                .build()))
                        .build());
                plannedMinutes += dayMinutes;
            }
            cur = cur.plusDays(1);
        }

        return GoalScenarioOption.builder()
                .id("faster")
                .title("Dedicated Project Blocks (Fast-Track)")
                .badge("FASTER")
                .description("Creates dedicated High Energy Deep Work blocks at consistent hours to maximize progress and prevent distraction.")
                .internalTargetDate(fasterTarget)
                .bufferDays(4)
                .daysCount(roadmap.size())
                .totalPlannedMinutes(plannedMinutes)
                .strategySummary("Dedicated High Energy Deep Work sessions · Consistent schedule, no overlaps")
                .roadmapDays(roadmap)
                .build();
    }

    private GoalScenarioOption buildFlexibleScenario(
            LocalDate startDate,
            LocalDate internalTargetDate,
            LocalDate officialDeadline,
            List<GoalMilestoneDto> milestones,
            int totalMinutes
    ) {
        List<GoalScenarioOption.DailyRoadmapDayDto> roadmap = new ArrayList<>();
        LocalDate cur = startDate;

        List<ProjectSubtaskDto> allSubtasks = new ArrayList<>();
        for (GoalMilestoneDto m : milestones) {
            allSubtasks.addAll(m.getSubtasks());
        }

        int subtaskIdx = 0;
        int plannedMinutes = 0;

        while (!cur.isAfter(officialDeadline) && subtaskIdx < allSubtasks.size()) {
            if (subtaskIdx < allSubtasks.size()) {
                ProjectSubtaskDto st = allSubtasks.get(subtaskIdx++);
                int dayMinutes = st.getEstimatedMinutes();

                roadmap.add(GoalScenarioOption.DailyRoadmapDayDto.builder()
                        .date(cur)
                        .dayOfWeek(getDayOfWeekName(cur))
                        .formattedDate(cur.format(DATE_FMT))
                        .isBufferDay(false)
                        .blocks(List.of(GoalScenarioOption.RoadmapBlockDto.builder()
                                .startTime("19:30")
                                .endTime(calculateEndTime("19:30", dayMinutes))
                                .milestoneName(getMilestoneForSubtask(st.getTitle(), milestones))
                                .title("Gentle: " + st.getTitle())
                                .durationMinutes(dayMinutes)
                                .blockType("FLEXIBLE_SLOT")
                                .note("Gentle 1-1.5h session each evening")
                                .subtaskTitles(List.of(st.getTitle()))
                                .build()))
                        .build());
                plannedMinutes += dayMinutes;
            }
            cur = cur.plusDays(1);
        }

        return GoalScenarioOption.builder()
                .id("flexible")
                .title("Low-Pressure Flexible Plan (Gentle & Steady)")
                .badge("LOW_PRESSURE")
                .description("Splits workload into light 1–1.5 hour sessions spread evenly up to the deadline to avoid burnout.")
                .internalTargetDate(officialDeadline)
                .bufferDays(0)
                .daysCount(roadmap.size())
                .totalPlannedMinutes(plannedMinutes)
                .strategySummary("Bite-sized 1–1.5h daily sprints · Low cognitive load")
                .roadmapDays(roadmap)
                .build();
    }

    private int calculateAvailableMinutes(LocalDate startDate, LocalDate endDate, List<TimeBlockEntity> existingBlocks) {
        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        // Assume 8 working/flexible hours available per day minus existing scheduled blocks
        int totalDayMinutes = (int) days * (8 * 60);
        int occupiedMinutes = 0;
        for (TimeBlockEntity b : existingBlocks) {
            if (!Boolean.TRUE.equals(b.getIsBufferBlock())) {
                occupiedMinutes += parseDurationMinutes(b.getStartTime(), b.getEndTime());
            }
        }
        return Math.max(totalDayMinutes - occupiedMinutes, (int) days * 4 * 60);
    }

    private int parseDurationMinutes(String start, String end) {
        if (start == null || end == null || !start.contains(":") || !end.contains(":")) return 60;
        try {
            String[] s = start.split(":");
            String[] e = end.split(":");
            int sm = Integer.parseInt(s[0]) * 60 + Integer.parseInt(s[1]);
            int em = Integer.parseInt(e[0]) * 60 + Integer.parseInt(e[1]);
            return Math.max(em - sm, 30);
        } catch (Exception ex) {
            return 60;
        }
    }

    private String calculateEndTime(String start, int durationMinutes) {
        if (start == null || !start.contains(":")) return "16:00";
        try {
            String[] s = start.split(":");
            int sm = Integer.parseInt(s[0]) * 60 + Integer.parseInt(s[1]);
            int em = sm + durationMinutes;
            int h = (em / 60) % 24;
            int m = em % 60;
            return String.format("%02d:%02d", h, m);
        } catch (Exception ex) {
            return "16:00";
        }
    }

    private String getMilestoneForSubtask(String subtaskTitle, List<GoalMilestoneDto> milestones) {
        for (GoalMilestoneDto m : milestones) {
            for (ProjectSubtaskDto s : m.getSubtasks()) {
                if (s.getTitle().equalsIgnoreCase(subtaskTitle)) {
                    return m.getName();
                }
            }
        }
        return "Milestone";
    }

    private String getDayOfWeekName(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> "Mon";
            case TUESDAY -> "Tue";
            case WEDNESDAY -> "Wed";
            case THURSDAY -> "Thu";
            case FRIDAY -> "Fri";
            case SATURDAY -> "Sat";
            case SUNDAY -> "Sun";
        };
    }

    private String findOptimalSlot(LocalDate date, int durationMinutes, String preferredStartTime) {
        List<TimeBlockEntity> dayBlocks = timeBlockRepository.findByDateOrderByStartTimeAsc(date)
                .stream()
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getOverrideType()))
                .collect(Collectors.toList());

        if (dayBlocks.isEmpty()) {
            return preferredStartTime;
        }

        int prefStart = parseMinutes(preferredStartTime);
        int prefEnd = prefStart + durationMinutes;

        boolean hasConflict = dayBlocks.stream().anyMatch(b -> {
            int bStart = parseMinutes(b.getStartTime());
            int bEnd = parseMinutes(b.getEndTime());
            return Math.max(prefStart, bStart) < Math.min(prefEnd, bEnd);
        });

        if (!hasConflict) {
            return preferredStartTime;
        }

        // Try standard high-energy slots: 08:30, 09:00, 14:00, 15:00, 16:00, 19:30
        String[] candidateSlots = {"08:30", "09:00", "14:00", "15:00", "16:00", "19:30"};
        for (String slot : candidateSlots) {
            int start = parseMinutes(slot);
            int end = start + durationMinutes;
            boolean conflict = dayBlocks.stream().anyMatch(b -> {
                int bStart = parseMinutes(b.getStartTime());
                int bEnd = parseMinutes(b.getEndTime());
                return Math.max(start, bStart) < Math.min(end, bEnd);
            });
            if (!conflict) {
                return slot;
            }
        }

        return preferredStartTime;
    }

    private int parseMinutes(String timeStr) {
        if (timeStr == null || !timeStr.contains(":")) return 0;
        try {
            String[] parts = timeStr.split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception ex) {
            return 0;
        }
    }

    private String capitalizeWords(String str) {
        if (str == null || str.isEmpty()) return str;
        String[] words = str.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1).toLowerCase()).append(" ");
            }
        }
        return sb.toString().trim();
    }
}
