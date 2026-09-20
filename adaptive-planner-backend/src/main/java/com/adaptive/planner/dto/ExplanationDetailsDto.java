package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplanationDetailsDto {
    private String whatChanged;
    private String whatWillHappen;
    private List<String> reasons;
    private Double confidenceLevel;
}
