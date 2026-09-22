package com.adaptive.planner.repository;

import com.adaptive.planner.entity.AdaptationActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdaptationActionRepository extends JpaRepository<AdaptationActionEntity, Long> {

    Optional<AdaptationActionEntity> findTopByOrderByCreatedAtDesc();

    List<AdaptationActionEntity> findAllByOrderByCreatedAtDesc();

    List<AdaptationActionEntity> findByDateOrderByCreatedAtDesc(LocalDate date);

    List<AdaptationActionEntity> findByDateBetweenOrderByCreatedAtDesc(LocalDate startDate, LocalDate endDate);
}
