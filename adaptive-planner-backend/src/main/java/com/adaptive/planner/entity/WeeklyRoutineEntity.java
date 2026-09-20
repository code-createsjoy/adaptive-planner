package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.DayOfWeek;
import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_routines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyRoutineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek; // MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(name = "start_time", nullable = false)
    private String startTime; // "08:00"

    @Column(name = "end_time", nullable = false)
    private String endTime; // "17:00"

    @Column(nullable = false)
    private String category; // "work", "social", "health", "rest", "urgent", "transition"

    @Column(name = "energy_level", nullable = false)
    private String energyLevel; // "high", "medium", "low"

    private String priority; // "High", "Normal", "Protected", "Flexible"

    @Column(name = "reminder_minutes")
    private String reminderMinutes; // "30,10,0"

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
