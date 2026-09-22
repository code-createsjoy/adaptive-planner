package com.adaptive.planner.controller;

import com.adaptive.planner.dto.CreateTimeBlockRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TimeBlockControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldGetAllTimeBlocks() throws Exception {
        mockMvc.perform(get("/api/timeblocks"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldCreateTimeBlock() throws Exception {
        CreateTimeBlockRequest request = CreateTimeBlockRequest.builder()
                .title("Evening Reading & Wind-down")
                .detail("Relaxing with a book")
                .startTime("21:00")
                .endTime("22:00")
                .category("rest")
                .energyLevel("low")
                .priority("Normal")
                .reminderMinutesBefore(List.of(10, 0))
                .isBufferBlock(false)
                .build();

        mockMvc.perform(post("/api/timeblocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Evening Reading & Wind-down"))
                .andExpect(jsonPath("$.startTime").value("21:00"));
    }

    @Test
    void shouldRejectTimeBlockInThePast() throws Exception {
        CreateTimeBlockRequest request = CreateTimeBlockRequest.builder()
                .title("Past Meeting")
                .detail("Meeting yesterday")
                .startTime("10:00")
                .endTime("11:00")
                .date(java.time.LocalDate.now().minusDays(1))
                .category("work")
                .energyLevel("medium")
                .priority("Normal")
                .build();

        mockMvc.perform(post("/api/timeblocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("Không thể thêm lịch cho những ngày trong quá khứ")));
    }
}
