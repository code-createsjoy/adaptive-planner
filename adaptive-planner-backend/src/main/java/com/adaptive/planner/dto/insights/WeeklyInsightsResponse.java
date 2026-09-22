package com.adaptive.planner.dto.insights;

import java.time.LocalDate;
import java.util.List;

public record WeeklyInsightsResponse(
        LocalDate weekStart,
        LocalDate weekEnd,
        LocalDate dataThrough,
        String timezone,
        String periodLabel,
        Coverage coverage,
        Metrics metrics,
        List<Pattern> patterns,
        List<Recommendation> recommendations,
        ExperimentState experimentState,
        PreviousWeekComparison previousWeekComparison
) {
    public record Coverage(
            int coveredDays,
            int minimumCoveredDays,
            int eligibleBlocks,
            int malformedBlocks,
            boolean sufficient,
            List<String> limitations,
            List<String> exclusions
    ) {}

    public record Metrics(
            int scheduledBlocks,
            int completedBlocks,
            Integer completionRatePercent,
            List<DaypartMetric> completionByDaypart,
            TransitionMetric transitions,
            AdaptationMetric adaptations
    ) {}

    public record DaypartMetric(String daypart, int eligibleBlocks, int completedBlocks, Integer completionRatePercent) {}

    public record TransitionMetric(int opportunities, int covered, Integer coverageRatePercent) {}

    public record AdaptationMetric(int applied, int rolledBack, int undone) {}

    public record Pattern(
            String ruleKey,
            String title,
            String observation,
            int sampleSize,
            String confidence,
            String evidenceFingerprint,
            List<Evidence> evidence
    ) {}

    public record Evidence(String type, String id, LocalDate date, String label) {}

    public record Recommendation(
            String ruleKey,
            String title,
            String rationale,
            String measurableAction,
            String evidenceFingerprint,
            int sampleSize
    ) {}

    public record ExperimentState(Long id, String ruleKey, String evidenceFingerprint, String status, LocalDate reminderDate) {}

    public record PreviousWeekComparison(boolean eligible, String omittedReason, List<MetricDelta> deltas) {}

    public record MetricDelta(String metric, int absoluteDelta) {}
}
