package com.adaptive.planner.controller;

import com.adaptive.planner.dto.CreateNotificationRequest;
import com.adaptive.planner.entity.NotificationEntity;
import com.adaptive.planner.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationRepository notificationRepository;

    @BeforeEach
    void setup() {
        notificationRepository.deleteAll();
    }

    @Test
    void shouldCreateAndRetrieveNotifications() throws Exception {
        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .type("BLOCK_STARTING")
                .priority("NORMAL")
                .title("Deep Work bắt đầu sau 10 phút")
                .message("Chuẩn bị hoàn tất giải lao để bước vào ca làm việc.")
                .eventKey("BLOCK_STARTING:1:14:00:10m")
                .actionType("OPEN_SESSION")
                .build();

        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Deep Work bắt đầu sau 10 phút"))
                .andExpect(jsonPath("$.isRead").value(false));

        mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(1));

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Deep Work bắt đầu sau 10 phút"));
    }

    @Test
    void shouldPreventDuplicateNotificationByEventKey() throws Exception {
        CreateNotificationRequest req1 = CreateNotificationRequest.builder()
                .type("BLOCK_STARTING")
                .title("Deep Work 14:00")
                .message("Starting in 10m")
                .eventKey("BLOCK_STARTING:1:14:00:10m")
                .build();

        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        // Duplicate POST
        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        // Total count should still be 1
        mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(1));
    }

    @Test
    void shouldMarkAsReadAndMarkAllAsRead() throws Exception {
        NotificationEntity n1 = notificationRepository.save(NotificationEntity.builder()
                .type("REBALANCE_AVAILABLE")
                .priority("HIGH")
                .title("Cần tái cân bằng lịch")
                .message("Trễ 70 phút")
                .isRead(false)
                .build());

        NotificationEntity n2 = notificationRepository.save(NotificationEntity.builder()
                .type("MILESTONE_COMPLETED")
                .priority("LOW")
                .title("Hoàn thành milestone")
                .message("Tuyệt vời!")
                .isRead(false)
                .build());

        mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(2));

        // Mark single as read
        mockMvc.perform(put("/api/notifications/" + n1.getId() + "/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));

        mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(1));

        // Mark all as read
        mockMvc.perform(put("/api/notifications/read-all"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(0));
    }

    @Test
    void shouldDeleteAllReadNotifications() throws Exception {
        NotificationEntity n1 = notificationRepository.save(NotificationEntity.builder()
                .type("REBALANCE_AVAILABLE")
                .priority("HIGH")
                .title("Thông báo đã đọc")
                .message("Nội dung")
                .isRead(true)
                .build());

        NotificationEntity n2 = notificationRepository.save(NotificationEntity.builder()
                .type("AI_SUGGESTION")
                .priority("NORMAL")
                .title("Thông báo chưa đọc")
                .message("Nội dung")
                .isRead(false)
                .build());

        mockMvc.perform(delete("/api/notifications/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("All read notifications deleted"));

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(n2.getId()));
    }
}
