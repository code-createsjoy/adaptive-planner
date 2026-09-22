package com.adaptive.planner.service;

import com.adaptive.planner.config.InsightsProperties;
import com.adaptive.planner.dto.insights.*;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.repository.TimeBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressiveInsightsService {

    private final TimeBlockRepository timeBlockRepository;
    private final InsightsProperties properties;
    private final InsightsWeekSemantics semantics;
    private final Clock clock;

    @Transactional(readOnly = true)
    public ProgressiveInsightsDto getProgressiveInsights(LocalDate requestedWeekStart) {
        LocalDate today = LocalDate.now(clock.withZone(properties.zoneId()));
        LocalDate currentMonday = today.with(DayOfWeek.MONDAY);
        LocalDate weekStart = requestedWeekStart == null ? currentMonday : requestedWeekStart;

        if (weekStart.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new IllegalArgumentException("weekStart must be a Monday");
        }

        LocalDate weekEnd = weekStart.plusDays(6);
        boolean isCurrentWeek = weekStart.equals(currentMonday);
        LocalDate dataThrough = isCurrentWeek ? today : weekEnd;

        int dayIndex = isCurrentWeek
                ? (int) ChronoUnit.DAYS.between(weekStart, today) + 1
                : 7;
        dayIndex = Math.max(1, Math.min(7, dayIndex));

        CurrentWeekProgressDto currentWeekProgress = calculateCurrentWeek(weekStart, weekEnd, dataThrough, dayIndex);
        LastWeekReflectionDto lastWeekReflection = calculateLastWeek(weekStart.minusWeeks(1), weekStart.minusDays(1));

        return new ProgressiveInsightsDto(currentWeekProgress, lastWeekReflection);
    }

    private CurrentWeekProgressDto calculateCurrentWeek(LocalDate weekStart, LocalDate weekEnd, LocalDate dataThrough, int dayIndex) {
        List<TimeBlockEntity> rawBlocks = timeBlockRepository.findByDateBetweenOrderByStartTimeAsc(weekStart, weekEnd);

        List<TimeBlockEntity> validBlocks = rawBlocks.stream()
                .filter(b -> b.getDate() != null && !b.getDate().isAfter(dataThrough))
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getOverrideType()))
                .filter(b -> semantics.isValidInterval(b.getStartTime(), b.getEndTime()))
                .toList();

        int scheduled = validBlocks.size();
        int completed = (int) validBlocks.stream().filter(b -> Boolean.TRUE.equals(b.getIsCompleted())).count();
        int rate = scheduled > 0 ? Math.round(((float) completed * 100) / scheduled) : 0;

        int morningMinutes = 0;
        int afternoonMinutes = 0;
        int eveningMinutes = 0;
        int totalFocusMinutes = 0;
        int focusSessions = 0;

        for (TimeBlockEntity block : validBlocks) {
            LocalTime st = semantics.parseStrictTime(block.getStartTime());
            LocalTime et = semantics.parseStrictTime(block.getEndTime());
            int durationMinutes = (int) Duration.between(st, et).toMinutes();
            if (durationMinutes > 0) {
                totalFocusMinutes += durationMinutes;
                focusSessions++;
                InsightsWeekSemantics.Daypart dp = semantics.daypart(st);
                if (dp == InsightsWeekSemantics.Daypart.MORNING) {
                    morningMinutes += durationMinutes;
                } else if (dp == InsightsWeekSemantics.Daypart.AFTERNOON) {
                    afternoonMinutes += durationMinutes;
                } else {
                    eveningMinutes += durationMinutes;
                }
            }
        }

        String dominantPeriod = "BALANCED";
        if (morningMinutes >= afternoonMinutes && morningMinutes >= eveningMinutes && morningMinutes > 0) {
            dominantPeriod = "MORNING";
        } else if (afternoonMinutes >= morningMinutes && afternoonMinutes >= eveningMinutes && afternoonMinutes > 0) {
            dominantPeriod = "AFTERNOON";
        } else if (eveningMinutes > 0) {
            dominantPeriod = "EVENING";
        }

        DaypartRhythmDto rhythm = new DaypartRhythmDto(morningMinutes, afternoonMinutes, eveningMinutes, dominantPeriod);

        Set<LocalDate> coveredDates = validBlocks.stream().map(TimeBlockEntity::getDate).collect(Collectors.toSet());
        int coveredDays = coveredDates.size();

        PatternObservationDto pattern;
        if (coveredDays <= 2 || dayIndex <= 2) {
            int displayDays = Math.max(coveredDays, Math.min(dayIndex, 2));
            pattern = new PatternObservationDto(
                    "EARLY",
                    "🌱 Xu hướng ban đầu (Dựa trên " + displayDays + " ngày)",
                    "Cho đến nay, các phiên " + periodVietnamese(dominantPeriod) + " có xu hướng tập trung liền mạch và ít bị dời lịch nhất.",
                    completed + " trong " + scheduled + " ca làm việc được hoàn tất đúng giờ dự kiến."
            );
        } else {
            pattern = new PatternObservationDto(
                    "CONFIRMED",
                    "✨ Mẫu hình định kỳ",
                    "Bạn duy trì nhịp độ ổn định nhất trong các khung giờ " + periodVietnamese(dominantPeriod) + ".",
                    completed + " ca hoàn thành, chiếm " + rate + "% tổng lịch trình đã lên kế hoạch."
            );
        }

        return new CurrentWeekProgressDto(
                weekStart,
                weekEnd,
                dayIndex,
                7,
                completed,
                scheduled,
                rate,
                totalFocusMinutes,
                focusSessions,
                rhythm,
                pattern
        );
    }

    private LastWeekReflectionDto calculateLastWeek(LocalDate lastWeekStart, LocalDate lastWeekEnd) {
        List<TimeBlockEntity> rawBlocks = timeBlockRepository.findByDateBetweenOrderByStartTimeAsc(lastWeekStart, lastWeekEnd);

        List<TimeBlockEntity> validBlocks = rawBlocks.stream()
                .filter(b -> b.getDate() != null)
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getOverrideType()))
                .filter(b -> semantics.isValidInterval(b.getStartTime(), b.getEndTime()))
                .toList();

        int scheduled = validBlocks.size();
        int completed = (int) validBlocks.stream().filter(b -> Boolean.TRUE.equals(b.getIsCompleted())).count();
        int rate = scheduled > 0 ? Math.round(((float) completed * 100) / scheduled) : 0;

        int totalFocusMinutes = 0;
        int morningCompleted = 0;

        for (TimeBlockEntity block : validBlocks) {
            LocalTime st = semantics.parseStrictTime(block.getStartTime());
            LocalTime et = semantics.parseStrictTime(block.getEndTime());
            int durationMinutes = (int) Duration.between(st, et).toMinutes();
            if (durationMinutes > 0) {
                totalFocusMinutes += durationMinutes;
            }
            if (Boolean.TRUE.equals(block.getIsCompleted()) && semantics.daypart(st) == InsightsWeekSemantics.Daypart.MORNING) {
                morningCompleted++;
            }
        }

        String dominantPattern;
        String whyReason;
        if (scheduled > 0) {
            dominantPattern = "Bạn hoàn thành các công việc phức tạp ổn định nhất trước 12:00 trưa.";
            whyReason = rate + "% các ca làm việc tuần trước đạt trạng thái hoàn tất mà không cần dời lịch.";
        } else {
            dominantPattern = "Tuần trước bạn đã có một khoảng nghỉ ngơi hoặc chưa lưu lịch trình.";
            whyReason = "Bắt đầu ghi nhận lịch tuần này để khám phá nhịp điệu sinh hoạt tự nhiên của bạn.";
        }

        LastWeekSuggestionDto suggestion = new LastWeekSuggestionDto(
                "protect-morning-focus",
                "Bảo vệ 1 khung giờ tập trung buổi sáng tuần này",
                "Đặt một khối Deep Work (09:00 - 10:30) vào các ngày làm việc để duy trì năng lượng cao nhất.",
                "Xem trước lịch trình tuần tới"
        );

        return new LastWeekReflectionDto(
                lastWeekStart,
                lastWeekEnd,
                completed,
                scheduled,
                rate,
                totalFocusMinutes,
                dominantPattern,
                whyReason,
                suggestion
        );
    }

    private String periodVietnamese(String period) {
        return switch (period) {
            case "MORNING" -> "buổi sáng (08:00 - 12:00)";
            case "AFTERNOON" -> "buổi chiều (13:00 - 17:00)";
            case "EVENING" -> "buổi tối (18:00 - 22:00)";
            default -> "trong ngày";
        };
    }
}
