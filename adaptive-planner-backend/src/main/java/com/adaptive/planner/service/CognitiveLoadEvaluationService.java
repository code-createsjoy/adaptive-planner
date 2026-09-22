package com.adaptive.planner.service;

import com.adaptive.planner.dto.CognitiveLoadAssessmentDto;
import com.adaptive.planner.dto.CognitiveLoadAssessmentDto.CognitiveMetricsDto;
import com.adaptive.planner.entity.DailyCheckinEntity;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.entity.UserAccessibilityProfileEntity;
import com.adaptive.planner.repository.DailyCheckinRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import com.adaptive.planner.repository.UserAccessibilityProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CognitiveLoadEvaluationService {

    private final TimeBlockRepository timeBlockRepository;
    private final UserAccessibilityProfileRepository profileRepository;
    private final DailyCheckinRepository dailyCheckinRepository;

    private static final String DEFAULT_USER_ID = "default-user";

    @Transactional(readOnly = true)
    public CognitiveLoadAssessmentDto evaluateSchedule(String userId, LocalDate date) {
        String effectiveUser = (userId != null && !userId.isBlank()) ? userId : DEFAULT_USER_ID;
        List<TimeBlockEntity> blocks = timeBlockRepository.findByDateOrderByStartTimeAsc(date);
        Optional<UserAccessibilityProfileEntity> profileOpt = profileRepository.findByUserId(effectiveUser);
        Optional<DailyCheckinEntity> checkinOpt = dailyCheckinRepository.findByUserIdAndCheckinDate(effectiveUser, date);

        return evaluateFromEntities(date, blocks, profileOpt.orElse(null), checkinOpt.orElse(null));
    }

    public CognitiveLoadAssessmentDto evaluateFromEntities(
            LocalDate date,
            List<TimeBlockEntity> blocks,
            UserAccessibilityProfileEntity profile,
            DailyCheckinEntity checkin
    ) {
        if (blocks == null || blocks.isEmpty()) {
            return CognitiveLoadAssessmentDto.builder()
                    .date(date.toString())
                    .score(10)
                    .level("LIGHT")
                    .summary("Hôm nay lịch trình trống trải và rất thư thả.")
                    .bulletPoints(List.of("Không có khối công việc nào được lên lịch", "Thời gian tự do tối đa"))
                    .metrics(CognitiveMetricsDto.builder()
                            .totalTasks(0)
                            .meetingCount(0)
                            .backToBackCount(0)
                            .contextSwitchCount(0)
                            .highFocusHours(0.0)
                            .totalBufferMinutes(540)
                            .deadlineCount(0)
                            .build())
                    .isDemanding(false)
                    .build();
        }

        int totalTasks = blocks.size();
        int meetingCount = 0;
        int backToBackCount = 0;
        int contextSwitchCount = 0;
        int highFocusMinutes = 0;
        int deadlineCount = 0;
        boolean hasLongUnbrokenBlock = false;

        for (int i = 0; i < blocks.size(); i++) {
            TimeBlockEntity block = blocks.get(i);
            int startMin = timeToMinutes(block.getStartTime());
            int endMin = timeToMinutes(block.getEndTime());
            int duration = Math.max(0, endMin - startMin);

            String cat = block.getCategory() != null ? block.getCategory().toLowerCase() : "work";
            String title = block.getTitle() != null ? block.getTitle().toLowerCase() : "";
            String energy = block.getEnergyLevel() != null ? block.getEnergyLevel().toLowerCase() : "medium";

            if (cat.contains("social") || cat.contains("meeting") || title.contains("meeting") || title.contains("họp") || title.contains("call")) {
                meetingCount++;
            }

            if ("high".equals(energy) || duration >= 90 || cat.contains("work")) {
                highFocusMinutes += duration;
            }

            if (duration >= 90) {
                hasLongUnbrokenBlock = true;
            }

            if (block.getDeadline() != null && !block.getDeadline().isBlank()) {
                deadlineCount++;
            }

            if (i > 0) {
                TimeBlockEntity prevBlock = blocks.get(i - 1);
                int prevEndMin = timeToMinutes(prevBlock.getEndTime());
                int gap = startMin - prevEndMin;

                String prevCat = prevBlock.getCategory() != null ? prevBlock.getCategory().toLowerCase() : "work";

                // Back to back check (gap <= 5 min)
                if (gap <= 5 && !cat.contains("transition") && !prevCat.contains("transition") && !cat.contains("rest") && !prevCat.contains("rest")) {
                    backToBackCount++;
                }

                // Context switch check
                if (!cat.equals(prevCat) && !cat.contains("transition") && !prevCat.contains("transition")) {
                    contextSwitchCount++;
                }
            }
        }

        // Calculate total buffer minutes between 09:00 (540) and 18:00 (1080)
        int totalBufferMinutes = calculateDaytimeBuffer(blocks);
        double highFocusHours = Math.round((highFocusMinutes / 60.0) * 10.0) / 10.0;

        // 10-Factor Scoring System
        double rawScore = 15.0; // Baseline

        // 1. Task Count penalty
        if (totalTasks > 5) {
            rawScore += Math.min(20, (totalTasks - 5) * 3);
        }

        // 2. Meeting density penalty
        if (meetingCount >= 4) {
            rawScore += 18;
        } else if (meetingCount >= 2) {
            rawScore += meetingCount * 4;
        }

        // 3. Back-to-back fatigue
        rawScore += Math.min(25, backToBackCount * 8);

        // 4. Context switching penalty
        rawScore += Math.min(20, contextSwitchCount * 3.5);

        // 5. High focus duration
        if (highFocusHours > 4.5) {
            rawScore += Math.min(18, (highFocusHours - 4.5) * 6);
        }

        // 6. Long unbroken block
        if (hasLongUnbrokenBlock) {
            rawScore += 8;
        }

        // 7. Deadline pressure
        if (deadlineCount >= 2) {
            rawScore += 14;
        } else if (deadlineCount == 1) {
            rawScore += 6;
        }

        // 8. Buffer deficit penalty
        if (totalBufferMinutes < 30) {
            rawScore += 20;
        } else if (totalBufferMinutes < 60) {
            rawScore += 10;
        }

        // 9. Personal Accessibility Profile Modifier
        if (profile != null) {
            String sensory = profile.getSensorySensitivity() != null ? profile.getSensorySensitivity().toLowerCase() : "medium";
            if ("high".equals(sensory)) {
                rawScore *= 1.15; // 15% more demanding for sensory sensitive users
            }
            String struct = profile.getScheduleStructure() != null ? profile.getScheduleStructure().toLowerCase() : "flexible";
            if ("flexible".equals(struct) && totalBufferMinutes < 60) {
                rawScore += 8;
            }
        }

        // 10. Daily Check-in state Modifier
        if (checkin != null) {
            boolean lowEnergy = checkin.getEnergyLevel() != null && checkin.getEnergyLevel() <= 2;
            boolean isPeriod = Boolean.TRUE.equals(checkin.getIsPeriodDay());
            String mood = checkin.getMoodLabel() != null ? checkin.getMoodLabel().toLowerCase() : "";

            if (lowEnergy || isPeriod || mood.contains("mệt") || mood.contains("exhaust") || mood.contains("stress")) {
                rawScore *= 1.25; // 25% amplification on low capacity days
            }
        }

        int score = (int) Math.max(10, Math.min(100, Math.round(rawScore)));

        String level;
        if (score < 40) {
            level = "LIGHT";
        } else if (score < 75) {
            level = "MODERATE";
        } else {
            level = "HEAVY";
        }

        boolean isDemanding = score >= 75;

        // Generate empathetic summary & bullet points
        String summary = generateSummary(level, meetingCount, backToBackCount, contextSwitchCount, totalBufferMinutes, highFocusHours);
        List<String> bullets = generateBullets(totalTasks, meetingCount, backToBackCount, contextSwitchCount, totalBufferMinutes, highFocusHours, deadlineCount);

        return CognitiveLoadAssessmentDto.builder()
                .date(date.toString())
                .score(score)
                .level(level)
                .summary(summary)
                .bulletPoints(bullets)
                .metrics(CognitiveMetricsDto.builder()
                        .totalTasks(totalTasks)
                        .meetingCount(meetingCount)
                        .backToBackCount(backToBackCount)
                        .contextSwitchCount(contextSwitchCount)
                        .highFocusHours(highFocusHours)
                        .totalBufferMinutes(totalBufferMinutes)
                        .deadlineCount(deadlineCount)
                        .build())
                .isDemanding(isDemanding)
                .build();
    }

    private int calculateDaytimeBuffer(List<TimeBlockEntity> blocks) {
        int dayStart = 9 * 60; // 09:00
        int dayEnd = 18 * 60;  // 18:00
        int totalBuffer = 0;
        int currentPointer = dayStart;

        for (TimeBlockEntity b : blocks) {
            int start = timeToMinutes(b.getStartTime());
            int end = timeToMinutes(b.getEndTime());

            if (start > currentPointer && currentPointer < dayEnd) {
                int gapStart = Math.max(dayStart, currentPointer);
                int gapEnd = Math.min(dayEnd, start);
                if (gapEnd > gapStart) {
                    totalBuffer += (gapEnd - gapStart);
                }
            }
            currentPointer = Math.max(currentPointer, end);
        }

        if (currentPointer < dayEnd) {
            totalBuffer += (dayEnd - currentPointer);
        }

        return Math.max(0, totalBuffer);
    }

    private String generateSummary(String level, int meetings, int backToBack, int contextSwitches, int bufferMin, double focusHours) {
        if ("HEAVY".equals(level)) {
            if (backToBack >= 2 || (meetings >= 3 && bufferMin < 30)) {
                return "Buổi chiều có nhiều khối công việc liên tiếp với ít khoảng đệm phục hồi.";
            } else if (contextSwitches >= 4) {
                return "Lịch trình có nhiều lần chuyển đổi lĩnh vực liên tục, dễ gây tiêu hao năng lượng nhận thức.";
            } else if (focusHours >= 5.0) {
                return "Tổng thời gian tập trung cao độ vượt ngưỡng tối ưu cho một ngày làm việc.";
            }
            return "Khối lượng công việc hôm nay khá dày đặc, bạn nên bổ sung các quãng nghỉ đệm.";
        } else if ("MODERATE".equals(level)) {
            if (meetings >= 2) {
                return "Lịch trình cân bằng vừa phải, có vài cuộc họp xen kẽ công việc chuyên môn.";
            }
            return "Khối lượng công việc ở mức ổn định, nhịp độ hoạt động hài hòa.";
        } else {
            return "Lịch trình nhẹ nhàng, có nhiều khoảng trống thoải mái để sáng tạo và nghỉ ngơi.";
        }
    }

    private List<String> generateBullets(int tasks, int meetings, int backToBack, int contextSwitches, int bufferMin, double focusHours, int deadlines) {
        List<String> list = new ArrayList<>();
        if (focusHours > 0) {
            list.add(String.format("%.1fh tập trung chuyên sâu", focusHours));
        }
        if (meetings > 0) {
            if (backToBack > 0) {
                list.add(String.format("%d cuộc họp (%d cuộc họp liên tiếp)", meetings, backToBack));
            } else {
                list.add(String.format("%d cuộc họp được phân bổ", meetings));
            }
        }
        if (contextSwitches >= 2) {
            list.add(String.format("%d lần chuyển đổi ngữ cảnh công việc", contextSwitches));
        }
        if (bufferMin < 45) {
            list.add(String.format("Chỉ có %d phút đệm trống trong ngày", bufferMin));
        } else {
            list.add(String.format("%d phút thời gian đệm thoải mái", bufferMin));
        }
        if (deadlines > 0) {
            list.add(String.format("%d hạn chót cần hoàn thành", deadlines));
        }
        return list;
    }

    private int timeToMinutes(String timeStr) {
        if (timeStr == null || !timeStr.contains(":")) return 0;
        try {
            String[] parts = timeStr.trim().split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception e) {
            return 0;
        }
    }
}
