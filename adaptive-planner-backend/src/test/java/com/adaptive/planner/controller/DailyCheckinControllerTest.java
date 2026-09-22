package com.adaptive.planner.controller;

import com.adaptive.planner.dto.CyclePredictionDto;
import com.adaptive.planner.dto.DailyCheckinDto;
import com.adaptive.planner.dto.PredictedCycleWindowDto;
import com.adaptive.planner.dto.ProactiveAdaptationRequest;
import com.adaptive.planner.dto.ProactiveAdaptationResponse;
import com.adaptive.planner.entity.PeriodFlow;
import com.adaptive.planner.service.DailyCheckinService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(DailyCheckinController.class)
@AutoConfigureMockMvc(addFilters = false)
class DailyCheckinControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DailyCheckinService dailyCheckinService;

    @Test
    void getCheckinsInRange_returnsList() throws Exception {
        DailyCheckinDto dto = DailyCheckinDto.builder()
                .id(1L)
                .userId("default-user")
                .checkinDate(LocalDate.of(2026, 9, 21))
                .moodEmoji("😄")
                .energyLevel(4)
                .isPeriodDay(false)
                .build();

        when(dailyCheckinService.getCheckinsInRange(eq("default-user"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/daily-checkins")
                        .param("startDate", "2026-09-01")
                        .param("endDate", "2026-09-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].moodEmoji").value("😄"))
                .andExpect(jsonPath("$[0].energyLevel").value(4));
    }

    @Test
    void getCheckinByDate_whenFound_returnsDto() throws Exception {
        DailyCheckinDto dto = DailyCheckinDto.builder()
                .id(1L)
                .checkinDate(LocalDate.of(2026, 9, 21))
                .moodEmoji("🥱")
                .energyLevel(2)
                .isPeriodDay(true)
                .flowIntensity(PeriodFlow.MEDIUM)
                .build();

        when(dailyCheckinService.getCheckinByDate("default-user", LocalDate.of(2026, 9, 21)))
                .thenReturn(Optional.of(dto));

        mockMvc.perform(get("/api/daily-checkins/2026-09-21"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.moodEmoji").value("🥱"))
                .andExpect(jsonPath("$.isPeriodDay").value(true));
    }

    @Test
    void upsertCheckin_savesAndReturnsDto() throws Exception {
        DailyCheckinDto requestDto = DailyCheckinDto.builder()
                .checkinDate(LocalDate.of(2026, 9, 21))
                .moodEmoji("🧘")
                .energyLevel(3)
                .note("Cảm thấy nhẹ nhàng")
                .isPeriodDay(false)
                .build();

        when(dailyCheckinService.upsertCheckin(eq("default-user"), any(DailyCheckinDto.class)))
                .thenReturn(requestDto);

        mockMvc.perform(post("/api/daily-checkins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.moodEmoji").value("🧘"))
                .andExpect(jsonPath("$.note").value("Cảm thấy nhẹ nhàng"));
    }

    @Test
    void getCyclePredictions_returnsPredictionDto() throws Exception {
        CyclePredictionDto prediction = CyclePredictionDto.builder()
                .averageCycleLengthDays(28)
                .averagePeriodDurationDays(5)
                .totalCyclesLogged(2)
                .predictedWindows(List.of(
                        PredictedCycleWindowDto.builder()
                                .startDate(LocalDate.of(2026, 9, 29))
                                .endDate(LocalDate.of(2026, 10, 3))
                                .confidenceScore(0.85)
                                .label("Dự kiến chu kỳ")
                                .build()
                ))
                .build();

        when(dailyCheckinService.getCyclePredictions("default-user")).thenReturn(prediction);

        mockMvc.perform(get("/api/daily-checkins/cycle-prediction"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageCycleLengthDays").value(28))
                .andExpect(jsonPath("$.predictedWindows[0].confidenceScore").value(0.85));
    }

    @Test
    void evaluateAdaptation_returnsProactiveResponse() throws Exception {
        ProactiveAdaptationRequest request = ProactiveAdaptationRequest.builder()
                .checkinDate(LocalDate.of(2026, 9, 21))
                .energyLevel(2)
                .isPeriodDay(true)
                .build();

        ProactiveAdaptationResponse response = ProactiveAdaptationResponse.builder()
                .hasRecommendation(true)
                .reason("Thể trạng thấp trong kỳ chu kỳ")
                .suggestedAction("DEFER_HEAVY_TASKS")
                .heavyBlockIds(List.of(10L, 11L))
                .proposedChangesSummary(List.of("Dời task sang ngày mai"))
                .build();

        when(dailyCheckinService.evaluateProactiveAdaptation(eq("default-user"), any(ProactiveAdaptationRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/daily-checkins/evaluate-adaptation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasRecommendation").value(true))
                .andExpect(jsonPath("$.suggestedAction").value("DEFER_HEAVY_TASKS"));
    }
}
