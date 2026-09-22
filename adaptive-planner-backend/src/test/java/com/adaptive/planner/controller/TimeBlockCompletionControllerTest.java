package com.adaptive.planner.controller;

import com.adaptive.planner.exception.GlobalExceptionHandler;
import com.adaptive.planner.service.CalmSlotService;
import com.adaptive.planner.service.TimeBlockService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TimeBlockCompletionControllerTest {

    private TimeBlockService service;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        service = mock(TimeBlockService.class);
        TimeBlockController controller = new TimeBlockController(
                service,
                mock(CalmSlotService.class),
                Clock.fixed(Instant.parse("2026-09-21T02:00:00Z"), ZoneOffset.UTC)
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void customCompletionRequiresBooleanValue() throws Exception {
        mockMvc.perform(put("/api/timeblocks/41/completion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"completed\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.completed").exists());

        verifyNoInteractions(service);
    }

    @Test
    void routineCompletionRequiresBooleanValue() throws Exception {
        mockMvc.perform(put("/api/timeblocks/routines/7/occurrences/2026-09-21/completion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.completed").exists());

        verifyNoInteractions(service);
    }

    @Test
    void routineCompletionRejectsMalformedOccurrenceDate() throws Exception {
        mockMvc.perform(put("/api/timeblocks/routines/7/occurrences/not-a-date/completion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"completed\":true}"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(service);
    }
}
