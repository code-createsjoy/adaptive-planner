package com.adaptive.planner.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class HolidayControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldGetHolidaysForYear() throws Exception {
        mockMvc.perform(get("/api/holidays?year=2026"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldCheckNationalDayHoliday() throws Exception {
        mockMvc.perform(get("/api/holidays/check?date=2026-09-02"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ngày Quốc khánh Việt Nam"))
                .andExpect(jsonPath("$.isStatutory").value(true));
    }
}
