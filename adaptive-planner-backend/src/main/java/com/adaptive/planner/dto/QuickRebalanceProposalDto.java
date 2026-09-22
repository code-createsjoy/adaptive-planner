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
public class QuickRebalanceProposalDto {
    private String date;
    private int loadScore;
    private List<RebalanceOptionDto> options;
}
