package com.adaptive.planner.controller;

import com.adaptive.planner.dto.ChatMessageDto;
import com.adaptive.planner.dto.CreateConversationRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ConversationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/ai/conversations returns 200 OK")
    void testGetConversations() throws Exception {
        mockMvc.perform(get("/api/ai/conversations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("POST /api/ai/conversations creates a conversation and retrieves it")
    void testCreateAndGetConversation() throws Exception {
        ChatMessageDto initialMsg = ChatMessageDto.builder()
                .role("user")
                .content("Lên lịch trình ngày mai")
                .build();

        CreateConversationRequest request = CreateConversationRequest.builder()
                .title("Kế hoạch ngày mai")
                .initialMessage(initialMsg)
                .build();

        String response = mockMvc.perform(post("/api/ai/conversations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Kế hoạch ngày mai"))
                .andExpect(jsonPath("$.messages[0].content").value("Lên lịch trình ngày mai"))
                .andReturn().getResponse().getContentAsString();

        Number id = com.jayway.jsonpath.JsonPath.read(response, "$.id");

        mockMvc.perform(get("/api/ai/conversations/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("Kế hoạch ngày mai"));
    }
}
