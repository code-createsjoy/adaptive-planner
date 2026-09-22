package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "time_blocks",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_time_blocks_routine_occurrence",
                columnNames = {"source_routine_id", "event_date"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeBlockEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(name = "start_time", nullable = false)
    private String startTime; // "09:00"

    @Column(name = "end_time", nullable = false)
    private String endTime; // "11:30"

    @Column(nullable = false)
    private String category; // "work", "social", "health", "rest", "urgent", "transition"

    @Column(name = "energy_level", nullable = false)
    private String energyLevel; // "high", "medium", "low"

    private String priority; // "HIGH", "NORMAL", "PROTECTED", "FLEXIBLE" (or "High", "Normal", "Protected", "Flexible")

    @Column(name = "deadline")
    private String deadline; // "2026-09-20T23:59:00" or "2026-09-20"

    @Column(name = "is_movable")
    @Builder.Default
    private Boolean isMovable = true;

    @Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE"; // "ACTIVE", "DISRUPTED", "DEFERRED", "SCHEDULED"

    @Column(name = "inbox_date")
    private java.time.LocalDate inboxDate; // For deferred tasks staged in Tomorrow's Inbox

    @Column(name = "preferred_time_range")
    private String preferredTimeRange; // "morning", "afternoon", "evening", "08:00-12:00"

    @Column(name = "reminder_minutes")
    private String reminderMinutes; // Comma-separated: "30,10,0"

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "is_buffer_block", nullable = false)
    @Builder.Default
    private Boolean isBufferBlock = false;

    @Column(name = "micro_steps", columnDefinition = "TEXT")
    private String microStepsJson; // JSON array string: [{"id":"1","text":"...","done":false}]

    @Column(name = "event_date")
    private java.time.LocalDate date; // "2026-09-19"

    @Column(name = "source_type")
    @Builder.Default
    private String sourceType = "CUSTOM"; // "ROUTINE", "CUSTOM", "AI_ADDED", "AI_RESCHEDULED"

    @Column(name = "source_routine_id")
    private Long sourceRoutineId;

    @Column(name = "project_goal_id")
    private Long projectGoalId;

    @Column(name = "override_type")
    @Builder.Default
    private String overrideType = "NONE"; // "NONE", "MODIFIED", "CANCELLED"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
