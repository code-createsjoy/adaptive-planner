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
public class HolidayDto {

    private LocalDate date;
    private String name;
    private String englishName;
    private String lunarDate;
    @com.fasterxml.jackson.annotation.JsonProperty("isStatutory")
    private boolean isStatutory;
    private String description;
}
