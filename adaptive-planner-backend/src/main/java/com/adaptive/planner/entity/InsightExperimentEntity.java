package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "insight_experiments",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_insight_experiments_user_week_rule_fp",
                columnNames = {"canonical_user_key", "source_week", "rule_key", "evidence_fingerprint"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsightExperimentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "canonical_user_key", nullable = false)
    @Builder.Default
    private String canonicalUserKey = "single-user";

    @Column(name = "source_week", nullable = false)
    private LocalDate sourceWeek;

    @Column(name = "rule_key", nullable = false)
    private String ruleKey;

    @Column(name = "evidence_fingerprint", nullable = false)
    private String evidenceFingerprint;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String rationale;

    @Column(name = "measurable_action", columnDefinition = "TEXT")
    private String measurableAction;

    @Column(name = "reminder_date", nullable = false)
    private LocalDate reminderDate;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "SAVED"; // "SAVED", "DISMISSED", "COMPLETED"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
