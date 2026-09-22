package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CyclePredictionDto {
    private Integer averageCycleLengthDays; // e.g. 28
    private Integer averagePeriodDurationDays; // e.g. 5
    private Integer totalCyclesLogged;
    private LocalDate lastPeriodStartDate;
    private List<PredictedCycleWindowDto> predictedWindows;
}
