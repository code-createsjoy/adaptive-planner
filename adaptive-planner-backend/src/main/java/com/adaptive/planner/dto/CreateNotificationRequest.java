package com.adaptive.planner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationRequest {
    private String userId;

    @NotBlank(message = "Notification type is required")
    private String type;

    @Builder.Default
    private String priority = "NORMAL";

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private String relatedEntityType;
    private Long relatedEntityId;
    private String actionType;
    private String actionData;
    private String eventKey;
    private LocalDateTime scheduledFor;
    private LocalDateTime deliveredAt;
}
