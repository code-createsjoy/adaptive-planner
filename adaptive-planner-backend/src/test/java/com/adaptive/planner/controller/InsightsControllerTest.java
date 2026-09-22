package com.adaptive.planner.controller;

import com.adaptive.planner.dto.insights.ProgressiveInsightsDto;
import com.adaptive.planner.dto.insights.SaveExperimentRequest;
import com.adaptive.planner.dto.insights.WeeklyInsightsResponse;
import com.adaptive.planner.dto.insights.WeeklyInsightsResponse.*;
import com.adaptive.planner.entity.InsightExperimentEntity;
import com.adaptive.planner.service.InsightExperimentService;
import com.adaptive.planner.service.ProgressiveInsightsService;
import com.adaptive.planner.service.WeeklyInsightsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(InsightsController.class)
@AutoConfigureMockMvc(addFilters = false)
class InsightsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WeeklyInsightsService weeklyInsightsService;

    @MockBean
    private ProgressiveInsightsService progressiveInsightsService;

    @MockBean
    private InsightExperimentService experimentService;

    @Test
    void getProgressiveInsightsReturnsOk() throws Exception {
        LocalDate weekStart = LocalDate.of(2026, 9, 21);
        ProgressiveInsightsDto response = new ProgressiveInsightsDto(
                new com.adaptive.planner.dto.insights.CurrentWeekProgressDto(
                        weekStart,
                        weekStart.plusDays(6),
                        2,
                        7,
                        6,
                        11,
                        55,
                        220,
                        4,
                        new com.adaptive.planner.dto.insights.DaypartRhythmDto(120, 75, 25, "MORNING"),
                        new com.adaptive.planner.dto.insights.PatternObservationDto(
                                "EARLY",
                                "🌱 Xu hướng ban đầu (Dựa trên 2 ngày)",
                                "Cho đến nay...",
                                "4 trong 6 ca..."
                        )
                ),
                new com.adaptive.planner.dto.insights.LastWeekReflectionDto(
                        weekStart.minusWeeks(1),
                        weekStart.minusDays(1),
                        18,
                        22,
                        81,
                        495,
                        "Bạn hoàn thành các công việc phức tạp ổn định nhất trước 12:00 trưa.",
                        "82% các ca làm việc...",
                        new com.adaptive.planner.dto.insights.LastWeekSuggestionDto(
                                "protect-morning-focus",
                                "Bảo vệ 1 khung giờ",
                                "Đặt một khối Deep Work",
                                "Xem trước"
                        )
                )
        );

        when(progressiveInsightsService.getProgressiveInsights(any())).thenReturn(response);

        mockMvc.perform(get("/api/insights/progressive")
                        .param("weekStart", "2026-09-21")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentWeek.completedTasks").value(6))
                .andExpect(jsonPath("$.currentWeek.pattern.maturity").value("EARLY"))
                .andExpect(jsonPath("$.lastWeek.completedTasks").value(18));
    }

    @Test
    void getWeeklyInsightsReturnsOk() throws Exception {
        LocalDate weekStart = LocalDate.of(2026, 9, 21);
        WeeklyInsightsResponse response = new WeeklyInsightsResponse(
                weekStart,
                weekStart.plusDays(6),
                weekStart.plusDays(4),
                "Asia/Ho_Chi_Minh",
                "Week so far",
                new Coverage(4, 3, 10, 0, true, List.of(), List.of()),
                new Metrics(10, 8, 80, List.of(), new TransitionMetric(5, 4, 80), new AdaptationMetric(1, 0, 0)),
                List.of(),
                List.of(),
                null,
                new PreviousWeekComparison(false, "No prev week", List.of())
        );

        when(weeklyInsightsService.getWeeklyInsights(any())).thenReturn(response);

        mockMvc.perform(get("/api/insights/weekly")
                        .param("weekStart", "2026-09-21")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weekStart").value("2026-09-21"))
                .andExpect(jsonPath("$.periodLabel").value("Week so far"))
                .andExpect(jsonPath("$.coverage.sufficient").value(true))
                .andExpect(jsonPath("$.metrics.completionRatePercent").value(80));
    }

    @Test
    void getWeeklyInsightsWithInvalidDateFormatReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/insights/weekly")
                        .param("weekStart", "invalid-date")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void saveExperimentReturnsOk() throws Exception {
        SaveExperimentRequest request = new SaveExperimentRequest(LocalDate.of(2026, 9, 21), "DAYPART_FLOW", "fp123");
        InsightExperimentEntity entity = InsightExperimentEntity.builder()
                .id(1L)
                .ruleKey("DAYPART_FLOW")
                .evidenceFingerprint("fp123")
                .title("Ưu tiên buổi sáng")
                .status("SAVED")
                .reminderDate(LocalDate.of(2026, 9, 28))
                .build();

        when(experimentService.saveExperiment(any())).thenReturn(entity);

        mockMvc.perform(post("/api/insights/experiments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.ruleKey").value("DAYPART_FLOW"))
                .andExpect(jsonPath("$.status").value("SAVED"));
    }

    @Test
    void dismissExperimentReturnsOk() throws Exception {
        SaveExperimentRequest request = new SaveExperimentRequest(LocalDate.of(2026, 9, 21), "DAYPART_FLOW", "fp123");
        doNothing().when(experimentService).dismissExperiment(any());

        mockMvc.perform(post("/api/insights/experiments/dismiss")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
