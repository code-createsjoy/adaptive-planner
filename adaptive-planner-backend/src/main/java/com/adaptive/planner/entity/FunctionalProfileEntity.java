package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "functional_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FunctionalProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Builder.Default
    @Column(name = "attention_regulation_score", nullable = false)
    private Integer attentionRegulationScore = 50;

    @Builder.Default
    @Column(name = "task_initiation_score", nullable = false)
    private Integer taskInitiationScore = 50;

    @Builder.Default
    @Column(name = "time_awareness_score", nullable = false)
    private Integer timeAwarenessScore = 50;

    @Builder.Default
    @Column(name = "context_switching_score", nullable = false)
    private Integer contextSwitchingScore = 50;

    @Builder.Default
    @Column(name = "sensory_sensitivity_score", nullable = false)
    private Integer sensorySensitivityScore = 50;

    @Builder.Default
    @Column(name = "need_for_structure_score", nullable = false)
    private Integer needForStructureScore = 50;

    @Builder.Default
    @Column(name = "communication_preference")
    private String communicationPreference = "WRITTEN_STEP_BY_STEP";

    @Builder.Default
    @Column(name = "recommended_mode")
    private String recommendedMode = "BALANCED"; // CALM, BALANCED, FOCUS

    @Builder.Default
    @Column(name = "assessment_completed", nullable = false)
    private Boolean assessmentCompleted = false;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
