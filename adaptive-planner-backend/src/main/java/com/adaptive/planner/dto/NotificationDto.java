package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String userId;
    private String type;
    private String priority;
    private String title;
    private String message;
    private String relatedEntityType;
    private Long relatedEntityId;
    private String actionType;
    private String actionData;
    private Boolean isRead;
    private LocalDateTime readAt;
    private String eventKey;
    private LocalDateTime scheduledFor;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
}
