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
public class RebalanceOptionDto {
    private String id;
    private String type; // ADD_BUFFER, MOVE_FLEXIBLE_TASK, REDUCE_CONTEXT_SWITCH
    private String title;
    private String description;
    private int estimatedLoadReduction;
    private OptionDiffDto diff;
    private List<TimeBlockDto> proposedBlocks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionDiffDto {
        private int movedBlockCount;
        private int bufferAddedMinutes;
        private int deferredBlockCount;
    }
}
