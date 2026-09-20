package com.adaptive.planner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "adaptation_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdaptationActionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_date")
    private LocalDate date;

    @Column(name = "reason")
    private String reason;

    @Column(name = "before_snapshot", columnDefinition = "TEXT")
    private String beforeSnapshotJson;

    @Column(name = "after_snapshot", columnDefinition = "TEXT")
    private String afterSnapshotJson;

    @Column(name = "status")
    @Builder.Default
    private String status = "APPLIED"; // "APPLIED", "ROLLED_BACK"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
