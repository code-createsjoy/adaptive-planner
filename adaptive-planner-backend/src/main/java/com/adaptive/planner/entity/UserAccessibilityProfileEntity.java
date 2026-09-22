package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_accessibility_profiles",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_accessibility_profile_user_id", columnNames = {"user_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccessibilityProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    @Builder.Default
    private String userId = "default-user";

    // Visual Density: "low" (airy, minimal clutter), "medium" (standard), "high" (compact/dense)
    @Column(name = "visual_density", nullable = false)
    @Builder.Default
    private String visualDensity = "medium";

    // Sensory Sensitivity: "high" (soft colors, reduced motion), "medium", "standard"
    @Column(name = "sensory_sensitivity", nullable = false)
    @Builder.Default
    private String sensorySensitivity = "high";

    // Focus Support: "single-task", "now-next", "full-timeline"
    @Column(name = "focus_support", nullable = false)
    @Builder.Default
    private String focusSupport = "now-next";

    // Schedule Structure: "flexible", "balanced", "structured"
    @Column(name = "schedule_structure", nullable = false)
    @Builder.Default
    private String scheduleStructure = "flexible";

    // Notification Style: "gentle" (432Hz/subtle), "standard", "persistent"
    @Column(name = "notification_style", nullable = false)
    @Builder.Default
    private String notificationStyle = "gentle";

    // Communication Style: "empathetic", "concise", "direct"
    @Column(name = "communication_style", nullable = false)
    @Builder.Default
    private String communicationStyle = "empathetic";

    @Column(name = "onboarding_completed", nullable = false)
    @Builder.Default
    private Boolean onboardingCompleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
