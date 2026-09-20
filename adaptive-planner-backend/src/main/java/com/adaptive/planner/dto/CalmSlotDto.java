package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalmSlotDto {
    private String startTime; // "10:00"
    private String endTime;   // "11:00"
    private Integer durationMinutes;
    private Double calmScore; // 0.0 - 1.0
    private String reason;    // e.g. "Khoảng trống êm ả sau bữa trưa, cách xa các phiên họp căng thẳng"
    private boolean isRecommended;
}
