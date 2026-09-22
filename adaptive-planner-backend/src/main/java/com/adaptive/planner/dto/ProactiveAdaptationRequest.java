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
public class ProactiveAdaptationRequest {
    private LocalDate checkinDate;
    private Integer energyLevel;
    private Boolean isPeriodDay;
}
