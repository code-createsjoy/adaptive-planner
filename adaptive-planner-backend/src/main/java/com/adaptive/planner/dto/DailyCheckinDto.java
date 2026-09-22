package com.adaptive.planner.dto;

import com.adaptive.planner.entity.DailyCheckinEntity;
import com.adaptive.planner.entity.PeriodFlow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyCheckinDto {
    private Long id;
    private String userId;
    private LocalDate checkinDate;
    private String moodEmoji;
    private String moodLabel;
    private Integer energyLevel;
    private String note;
    private Boolean isPeriodDay;
    private PeriodFlow flowIntensity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DailyCheckinDto fromEntity(DailyCheckinEntity entity) {
        if (entity == null) return null;
        return DailyCheckinDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .checkinDate(entity.getCheckinDate())
                .moodEmoji(entity.getMoodEmoji())
                .moodLabel(entity.getMoodLabel())
                .energyLevel(entity.getEnergyLevel())
                .note(entity.getNote())
                .isPeriodDay(entity.getIsPeriodDay())
                .flowIntensity(entity.getFlowIntensity() != null ? entity.getFlowIntensity() : PeriodFlow.NONE)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
