package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptationActionDto {
    private Long id;
    private Long conversationId;
    private LocalDate date;
    private String reason;
    private String selectedScenarioId;
    private String scenarioTitle;
    private String explanationJson;
    private String beforeSnapshotJson;
    private String afterSnapshotJson;
    private String status;
    private LocalDateTime createdAt;
}
