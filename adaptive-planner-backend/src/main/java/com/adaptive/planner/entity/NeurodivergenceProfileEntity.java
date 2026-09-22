package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "neurodivergence_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NeurodivergenceProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(name = "identification_status")
    private String identificationStatus; // DIAGNOSED, SELF_IDENTIFIED, EXPLORING, NEUROTYPICAL, UNSURE, PREFER_NOT_TO_SAY

    @Column(name = "selected_conditions_json", columnDefinition = "TEXT")
    private String selectedConditionsJson;

    @Builder.Default
    @Column(name = "is_private", nullable = false)
    private Boolean isPrivate = true;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
