package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectGoalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "official_deadline", nullable = false)
    private LocalDate officialDeadline;

    @Column(name = "internal_target_date", nullable = false)
    private LocalDate internalTargetDate;

    @Column(name = "buffer_days", nullable = false)
    @Builder.Default
    private Integer bufferDays = 2;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ProjectGoalStatus status = ProjectGoalStatus.IN_PROGRESS;

    @Enumerated(EnumType.STRING)
    @Column(name = "feasibility_status", nullable = false)
    @Builder.Default
    private FeasibilityStatus feasibilityStatus = FeasibilityStatus.FEASIBLE;

    @Column(name = "conversation_id")
    private Long conversationId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
