package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalRebalanceResponse {
    private Long projectId;
    private Integer overdueMinutes;
    private String companionMessage; // e.g. "Bạn đã hoàn thành 2/4 task hôm nay. Deadline vẫn an toàn! Tôi có thể phân bổ 80 phút còn lại mà không đụng đến giờ ăn hay giờ nghỉ."
    @Builder.Default
    private List<RebalanceOptionDto> options = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RebalanceOptionDto {
        private String id; // "smart_rebalance", "catch_up_tomorrow", "use_buffer"
        private String title;
        private String badge; // "RECOMMENDED", "FASTER", "BUFFER"
        private String description;
        private String impactSummary; // "+40 min Thứ 3, +40 min Thứ 4 · Deadline không đổi"
        private Boolean deadlineSafe;
        @Builder.Default
        private List<GoalScenarioOption.DailyRoadmapDayDto> modifiedDays = new ArrayList<>();
    }
}
