package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "daily_checkins",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_checkin_date", columnNames = {"user_id", "checkin_date"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyCheckinEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    @Builder.Default
    private String userId = "default-user";

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @Column(name = "mood_emoji")
    private String moodEmoji;

    @Column(name = "mood_label")
    private String moodLabel;

    @Column(name = "energy_level")
    private Integer energyLevel; // 1 (Extremely low/exhausted) to 5 (Peak/energized)

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "is_period_day", nullable = false)
    @Builder.Default
    private Boolean isPeriodDay = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "flow_intensity")
    @Builder.Default
    private PeriodFlow flowIntensity = PeriodFlow.NONE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
