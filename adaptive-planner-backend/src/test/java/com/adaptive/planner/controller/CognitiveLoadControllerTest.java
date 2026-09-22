package com.adaptive.planner.controller;

import com.adaptive.planner.dto.CognitiveLoadAssessmentDto;
import com.adaptive.planner.dto.QuickRebalanceProposalDto;
import com.adaptive.planner.service.CognitiveLoadEvaluationService;
import com.adaptive.planner.service.QuickRebalanceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(CognitiveLoadController.class)
@AutoConfigureMockMvc(addFilters = false)
class CognitiveLoadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CognitiveLoadEvaluationService evaluationService;

    @MockBean
    private QuickRebalanceService rebalanceService;

    @Test
    void testEvaluateWorkloadEndpoint() throws Exception {
        LocalDate date = LocalDate.of(2026, 9, 22);
        CognitiveLoadAssessmentDto mockDto = CognitiveLoadAssessmentDto.builder()
                .date("2026-09-22")
                .score(78)
                .level("HEAVY")
                .summary("Demanding afternoon")
                .bulletPoints(List.of("4 meetings", "2 back-to-back"))
                .isDemanding(true)
                .build();

        when(evaluationService.evaluateSchedule(eq("default-user"), eq(date))).thenReturn(mockDto);

        mockMvc.perform(get("/api/workload/evaluate")
                        .param("date", "2026-09-22")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(78))
                .andExpect(jsonPath("$.level").value("HEAVY"))
                .andExpect(jsonPath("$.isDemanding").value(true));
    }

    @Test
    void testGetRebalanceOptionsEndpoint() throws Exception {
        LocalDate date = LocalDate.of(2026, 9, 22);
        QuickRebalanceProposalDto mockProposal = QuickRebalanceProposalDto.builder()
                .date("2026-09-22")
                .loadScore(78)
                .options(List.of())
                .build();

        when(rebalanceService.generateRebalanceOptions(eq("default-user"), eq(date))).thenReturn(mockProposal);

        mockMvc.perform(get("/api/workload/rebalance-options")
                        .param("date", "2026-09-22")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loadScore").value(78));
    }
}
