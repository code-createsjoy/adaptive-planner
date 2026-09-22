package com.adaptive.planner.dto;

import com.adaptive.planner.entity.FeasibilityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalDecompositionResponse {
    private String goalTitle;
    private String summaryMessage; // e.g. "Dựa trên lịch hiện tại của bạn, tôi có thể phân bổ dự án vào 8 block Work có sẵn..."
    private LocalDate officialDeadline;
    private LocalDate internalTargetDate;
    private Integer bufferDays;
    private Integer totalRequiredMinutes;
    private Integer availableHours;
    private FeasibilityStatus feasibilityStatus; // FEASIBLE, TIGHT, NOT_FEASIBLE
    private String feasibilityRationale;

    @Builder.Default
    private List<GoalMilestoneDto> milestones = new ArrayList<>();

    @Builder.Default
    private List<GoalScenarioOption> scenarios = new ArrayList<>();
}
