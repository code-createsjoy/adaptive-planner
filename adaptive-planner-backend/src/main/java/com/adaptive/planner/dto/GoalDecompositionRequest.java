package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalDecompositionRequest {
    private String prompt; // e.g. "Tôi cần làm 1 website mini bán hàng trong vòng 2 tuần"
    private LocalDate startDate; // Defaults to today if null
    private LocalDate explicitDeadline; // Optional if extracted by LLM
    private Long conversationId;
}
