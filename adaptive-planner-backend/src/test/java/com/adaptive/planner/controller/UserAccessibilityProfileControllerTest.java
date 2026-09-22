package com.adaptive.planner.controller;

import com.adaptive.planner.dto.OnboardingAnswersDto;
import com.adaptive.planner.dto.UserAccessibilityProfileDto;
import com.adaptive.planner.service.UserAccessibilityProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(UserAccessibilityProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserAccessibilityProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserAccessibilityProfileService service;

    @Test
    void getProfile_returnsDto() throws Exception {
        UserAccessibilityProfileDto dto = UserAccessibilityProfileDto.builder()
                .id(1L)
                .userId("default-user")
                .visualDensity("medium")
                .sensorySensitivity("high")
                .focusSupport("now-next")
                .onboardingCompleted(false)
                .build();

        when(service.getOrCreateProfile("default-user")).thenReturn(dto);

        mockMvc.perform(get("/api/user/accessibility-profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sensorySensitivity").value("high"))
                .andExpect(jsonPath("$.focusSupport").value("now-next"));
    }

    @Test
    void completeOnboarding_savesAndReturnsProfile() throws Exception {
        OnboardingAnswersDto answers = OnboardingAnswersDto.builder()
                .infoStyle("VISUAL")
                .distractionSensitivity("HIGH")
                .reminderPreference("GENTLE")
                .schedulePreference("FLEXIBLE")
                .build();

        UserAccessibilityProfileDto result = UserAccessibilityProfileDto.builder()
                .id(1L)
                .userId("default-user")
                .sensorySensitivity("high")
                .focusSupport("single-task")
                .onboardingCompleted(true)
                .build();

        when(service.completeOnboarding(eq("default-user"), any(OnboardingAnswersDto.class))).thenReturn(result);

        mockMvc.perform(post("/api/user/accessibility-profile/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(answers)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sensorySensitivity").value("high"))
                .andExpect(jsonPath("$.onboardingCompleted").value(true));
    }
}
