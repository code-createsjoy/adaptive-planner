package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_user_is_read", columnList = "user_id, is_read"),
        @Index(name = "idx_notifications_event_key", columnList = "event_key", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    @Builder.Default
    private String userId = "user-1";

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private String priority = "NORMAL";

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "related_entity_type")
    private String relatedEntityType;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "action_data", columnDefinition = "TEXT")
    private String actionData;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "event_key", unique = true)
    private String eventKey;

    @Column(name = "scheduled_for")
    private LocalDateTime scheduledFor;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
