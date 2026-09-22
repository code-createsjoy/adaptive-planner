package com.adaptive.planner.service;

import com.adaptive.planner.dto.insights.WeeklyInsightsResponse;
import com.adaptive.planner.dto.insights.WeeklyInsightsResponse.*;
import com.adaptive.planner.entity.AdaptationActionEntity;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.repository.AdaptationActionRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import com.adaptive.planner.config.InsightsProperties;
import com.adaptive.planner.entity.InsightExperimentEntity;
import com.adaptive.planner.repository.InsightExperimentRepository;

@Service
@RequiredArgsConstructor
public class WeeklyInsightsService {

    private final TimeBlockRepository timeBlockRepository;
    private final AdaptationActionRepository adaptationActionRepository;
    private final InsightExperimentRepository insightExperimentRepository;
    private final InsightsProperties properties;
    private final InsightsWeekSemantics semantics;

    @Transactional(readOnly = true)
    public WeeklyInsightsResponse getWeeklyInsights(LocalDate requestedWeekStart) {
        InsightsWeekSemantics.WeekWindow window = semantics.resolve(requestedWeekStart);
        return aggregateWeek(window);
    }

    private WeeklyInsightsResponse aggregateWeek(InsightsWeekSemantics.WeekWindow window) {
        LocalDate weekStart = window.weekStart();
        LocalDate weekEnd = window.weekEnd();
        LocalDate dataThrough = window.dataThrough();

        List<TimeBlockEntity> rawBlocks = timeBlockRepository.findByDateBetweenOrderByStartTimeAsc(weekStart, weekEnd);
        List<AdaptationActionEntity> rawAdaptations = adaptationActionRepository.findByDateBetweenOrderByCreatedAtDesc(weekStart, weekEnd);

        // Exclude cancelled overrides and blocks after dataThrough
        List<TimeBlockEntity> validRangeBlocks = rawBlocks.stream()
                .filter(b -> b.getDate() != null && !b.getDate().isAfter(dataThrough))
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getOverrideType()))
                .toList();

        List<TimeBlockEntity> eligibleBlocks = new ArrayList<>();
        int malformedBlocks = 0;

        for (TimeBlockEntity block : validRangeBlocks) {
            if (semantics.isValidInterval(block.getStartTime(), block.getEndTime())) {
                eligibleBlocks.add(block);
            } else {
                malformedBlocks++;
            }
        }

        Set<LocalDate> coveredDateSet = eligibleBlocks.stream()
                .map(TimeBlockEntity::getDate)
                .collect(Collectors.toSet());
        int coveredDays = coveredDateSet.size();
        boolean sufficient = coveredDays >= InsightsWeekSemantics.MINIMUM_COVERED_DAYS;

        Coverage coverage = new Coverage(
                coveredDays,
                InsightsWeekSemantics.MINIMUM_COVERED_DAYS,
                eligibleBlocks.size(),
                malformedBlocks,
                sufficient,
                List.of("PERSISTED_OCCURRENCES_ONLY"),
                List.of("CANCELLED overrides excluded", "Zero/negative/invalid intervals excluded from time calculations")
        );

        // Metrics computation
        int scheduledBlocks = eligibleBlocks.size();
        int completedBlocks = (int) eligibleBlocks.stream().filter(b -> Boolean.TRUE.equals(b.getIsCompleted())).count();
        Integer completionRatePercent = scheduledBlocks > 0
                ? Math.round(((float) completedBlocks * 100) / scheduledBlocks)
                : null;

        // Daypart metrics
        Map<InsightsWeekSemantics.Daypart, List<TimeBlockEntity>> blocksByDaypart = new EnumMap<>(InsightsWeekSemantics.Daypart.class);
        for (InsightsWeekSemantics.Daypart dp : InsightsWeekSemantics.Daypart.values()) {
            blocksByDaypart.put(dp, new ArrayList<>());
        }

        for (TimeBlockEntity b : eligibleBlocks) {
            LocalTime st = semantics.parseStrictTime(b.getStartTime());
            InsightsWeekSemantics.Daypart dp = semantics.daypart(st);
            blocksByDaypart.get(dp).add(b);
        }

        List<DaypartMetric> daypartMetrics = new ArrayList<>();
        for (InsightsWeekSemantics.Daypart dp : InsightsWeekSemantics.Daypart.values()) {
            List<TimeBlockEntity> dpBlocks = blocksByDaypart.get(dp);
            int dpEligible = dpBlocks.size();
            int dpCompleted = (int) dpBlocks.stream().filter(b -> Boolean.TRUE.equals(b.getIsCompleted())).count();
            Integer dpRate = dpEligible > 0 ? Math.round(((float) dpCompleted * 100) / dpEligible) : null;
            daypartMetrics.add(new DaypartMetric(dp.name().toLowerCase(), dpEligible, dpCompleted, dpRate));
        }

        // Transitions computation
        TransitionMetric transitions = computeTransitions(eligibleBlocks);

        // Adaptations computation
        List<AdaptationActionEntity> validAdaptations = rawAdaptations.stream()
                .filter(a -> a.getDate() != null && !a.getDate().isAfter(dataThrough))
                .toList();
        int appliedAdaptations = (int) validAdaptations.stream().filter(a -> "APPLIED".equalsIgnoreCase(a.getStatus())).count();
        int rolledBackAdaptations = (int) validAdaptations.stream().filter(a -> "ROLLED_BACK".equalsIgnoreCase(a.getStatus())).count();
        int undoneAdaptations = (int) validAdaptations.stream().filter(a -> "UNDONE".equalsIgnoreCase(a.getStatus())).count();

        AdaptationMetric adaptationMetric = new AdaptationMetric(appliedAdaptations, rolledBackAdaptations, undoneAdaptations);

        Metrics metrics = new Metrics(
                scheduledBlocks,
                completedBlocks,
                completionRatePercent,
                daypartMetrics,
                transitions,
                adaptationMetric
        );

        // Patterns & Recommendations (only if data is sufficient >= 3 covered days)
        List<Pattern> patterns = new ArrayList<>();
        List<Recommendation> recommendations = new ArrayList<>();

        if (sufficient) {
            // Rule 1: High completion daypart
            Optional<DaypartMetric> bestDaypart = daypartMetrics.stream()
                    .filter(dm -> dm.eligibleBlocks() >= InsightsWeekSemantics.MINIMUM_RULE_SAMPLE && dm.completionRatePercent() != null)
                    .max(Comparator.comparingInt(DaypartMetric::completionRatePercent));

            bestDaypart.ifPresent(dm -> {
                String ruleKey = "DAYPART_FLOW";
                List<Evidence> evidenceList = eligibleBlocks.stream()
                        .filter(b -> semantics.daypart(semantics.parseStrictTime(b.getStartTime())).name().equalsIgnoreCase(dm.daypart()))
                        .map(b -> new Evidence("timeblock", String.valueOf(b.getId()), b.getDate(), b.getTitle() + " (" + b.getStartTime() + " - " + b.getEndTime() + ")"))
                        .toList();

                String fp = generateFingerprint(ruleKey, weekStart, evidenceList);
                String daypartVn = "morning".equals(dm.daypart()) ? "buổi sáng" : "afternoon".equals(dm.daypart()) ? "buổi chiều" : "buổi tối";
                Pattern p = new Pattern(
                        ruleKey,
                        "Hiệu quả hoàn thành tốt nhất vào " + daypartVn,
                        "Bạn hoàn thành " + dm.completedBlocks() + "/" + dm.eligibleBlocks() + " việc (" + dm.completionRatePercent() + "%) vào " + daypartVn + ".",
                        dm.eligibleBlocks(),
                        semantics.confidence(dm.eligibleBlocks()),
                        fp,
                        evidenceList
                );
                patterns.add(p);

                recommendations.add(new Recommendation(
                        ruleKey,
                        "Ưu tiên công việc trọng tâm vào " + daypartVn,
                        "Dữ liệu cho thấy bạn giữ nhịp độ và hoàn thành công việc cao nhất trong khung giờ này.",
                        "Xếp 1-2 khối công việc quan trọng nhất của ngày vào " + daypartVn + " cho tuần tới.",
                        fp,
                        dm.eligibleBlocks()
                ));
            });

            // Rule 2: Transition & buffer protection
            if (transitions.opportunities() >= InsightsWeekSemantics.MINIMUM_RULE_SAMPLE) {
                String ruleKey = "TRANSITION_PROTECTION";
                List<Evidence> evidenceList = eligibleBlocks.stream()
                        .map(b -> new Evidence("timeblock", String.valueOf(b.getId()), b.getDate(), b.getTitle()))
                        .limit(5)
                        .toList();
                String fp = generateFingerprint(ruleKey, weekStart, evidenceList);

                int rate = transitions.coverageRatePercent() != null ? transitions.coverageRatePercent() : 0;
                String obs = rate >= 70
                        ? "Bạn duy trì khoảng nghỉ chuyển tiếp tốt (" + rate + "% khoảng trống bảo vệ giữa các việc)."
                        : "Lịch trình khá sát nhau (" + (100 - rate) + "% ca làm việc liền kề thiếu khoảng đệm).";

                patterns.add(new Pattern(
                        ruleKey,
                        "Độ đệm và chuyển tiếp giữa các công việc",
                        obs,
                        transitions.opportunities(),
                        semantics.confidence(transitions.opportunities()),
                        fp,
                        evidenceList
                ));

                if (rate < 70) {
                    recommendations.add(new Recommendation(
                            ruleKey,
                            "Bổ sung 10-15 phút đệm giữa các phiên làm việc",
                            "Khoảng nghỉ chuyển tiếp giúp giảm căng thẳng và tránh việc trễ giờ dây chuyền.",
                            "Tự động chèn thêm khoảng nghỉ 10 phút sau mỗi khối làm việc trên 90 phút.",
                            fp,
                            transitions.opportunities()
                    ));
                }
            }

            // Rule 3: Adaptation Protection
            if (appliedAdaptations > 0) {
                String ruleKey = "ADAPTATION_RESILIENCE";
                List<Evidence> evidenceList = validAdaptations.stream()
                        .filter(a -> "APPLIED".equalsIgnoreCase(a.getStatus()))
                        .map(a -> new Evidence("adaptation", String.valueOf(a.getId()), a.getDate(), a.getScenarioTitle() != null ? a.getScenarioTitle() : a.getReason()))
                        .toList();
                String fp = generateFingerprint(ruleKey, weekStart, evidenceList);

                patterns.add(new Pattern(
                        ruleKey,
                        "Khả năng thích ứng và bảo vệ ưu tiên",
                        "Đã áp dụng thành công " + appliedAdaptations + " đề xuất điều chỉnh lịch từ AI để bảo vệ các mục tiêu chính.",
                        appliedAdaptations,
                        semantics.confidence(appliedAdaptations),
                        fp,
                        evidenceList
                ));
            }
        }

        // Previous week comparison
        PreviousWeekComparison previousWeekComparison = computePreviousWeekComparison(weekStart, metrics, sufficient);

        // Active Experiment State
        ExperimentState experimentState = insightExperimentRepository
                .findFirstByCanonicalUserKeyAndSourceWeekAndStatusNot(properties.canonicalUserKey(), weekStart, "DISMISSED")
                .map(e -> new ExperimentState(e.getId(), e.getRuleKey(), e.getEvidenceFingerprint(), e.getStatus(), e.getReminderDate()))
                .orElse(null);

        return new WeeklyInsightsResponse(
                weekStart,
                weekEnd,
                dataThrough,
                window.timezone(),
                window.periodLabel(),
                coverage,
                metrics,
                patterns,
                recommendations,
                experimentState,
                previousWeekComparison
        );
    }

    private TransitionMetric computeTransitions(List<TimeBlockEntity> eligibleBlocks) {
        Map<LocalDate, List<TimeBlockEntity>> byDate = eligibleBlocks.stream()
                .collect(Collectors.groupingBy(TimeBlockEntity::getDate));

        int opportunities = 0;
        int covered = 0;

        for (List<TimeBlockEntity> dayBlocks : byDate.values()) {
            List<TimeBlockEntity> sorted = dayBlocks.stream()
                    .sorted(Comparator.comparing(b -> semantics.parseStrictTime(b.getStartTime())))
                    .toList();

            for (int i = 0; i < sorted.size() - 1; i++) {
                TimeBlockEntity current = sorted.get(i);
                TimeBlockEntity next = sorted.get(i + 1);

                LocalTime currentEnd = semantics.parseStrictTime(current.getEndTime());
                LocalTime nextStart = semantics.parseStrictTime(next.getStartTime());

                if (!nextStart.isBefore(currentEnd)) {
                    opportunities++;
                    long gapMinutes = ChronoUnit.MINUTES.between(currentEnd, nextStart);
                    if (gapMinutes >= InsightsWeekSemantics.TRANSITION_GAP_MINUTES || Boolean.TRUE.equals(next.getIsBufferBlock()) || "transition".equalsIgnoreCase(next.getCategory())) {
                        covered++;
                    }
                }
            }
        }

        Integer rate = opportunities > 0 ? Math.round(((float) covered * 100) / opportunities) : null;
        return new TransitionMetric(opportunities, covered, rate);
    }

    private PreviousWeekComparison computePreviousWeekComparison(LocalDate currentWeekStart, Metrics currentMetrics, boolean currentSufficient) {
        LocalDate prevWeekStart = currentWeekStart.minusWeeks(1);
        LocalDate prevWeekEnd = prevWeekStart.plusDays(6);

        List<TimeBlockEntity> prevBlocks = timeBlockRepository.findByDateBetweenOrderByStartTimeAsc(prevWeekStart, prevWeekEnd).stream()
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getOverrideType()))
                .filter(b -> semantics.isValidInterval(b.getStartTime(), b.getEndTime()))
                .toList();

        Set<LocalDate> prevCoveredDates = prevBlocks.stream()
                .map(TimeBlockEntity::getDate)
                .collect(Collectors.toSet());

        boolean prevSufficient = prevCoveredDates.size() >= InsightsWeekSemantics.MINIMUM_COVERED_DAYS;

        if (!currentSufficient || !prevSufficient) {
            return new PreviousWeekComparison(
                    false,
                    "Chưa đủ dữ liệu tối thiểu 3 ngày ở cả 2 tuần để so sánh chính xác.",
                    List.of()
            );
        }

        int prevScheduled = prevBlocks.size();
        int prevCompleted = (int) prevBlocks.stream().filter(b -> Boolean.TRUE.equals(b.getIsCompleted())).count();
        int prevRate = prevScheduled > 0 ? Math.round(((float) prevCompleted * 100) / prevScheduled) : 0;
        int currentRate = currentMetrics.completionRatePercent() != null ? currentMetrics.completionRatePercent() : 0;

        List<MetricDelta> deltas = List.of(
                new MetricDelta("completedBlocks", currentMetrics.completedBlocks() - prevCompleted),
                new MetricDelta("scheduledBlocks", currentMetrics.scheduledBlocks() - prevScheduled),
                new MetricDelta("completionRatePercent", currentRate - prevRate)
        );

        return new PreviousWeekComparison(true, null, deltas);
    }

    private String generateFingerprint(String ruleKey, LocalDate weekStart, List<Evidence> evidenceList) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            StringBuilder sb = new StringBuilder();
            sb.append(ruleKey).append("|").append(weekStart);
            for (Evidence e : evidenceList) {
                sb.append("|").append(e.type()).append(":").append(e.id()).append(":").append(e.date());
            }
            byte[] hash = digest.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().substring(0, 16);
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString().substring(0, 16);
        }
    }
}
