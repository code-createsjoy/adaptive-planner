package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictedCycleWindowDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private Double confidenceScore; // 0.0 to 1.0
    private String label; // "Dự kiến chu kỳ"
}
