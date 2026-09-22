package com.adaptive.planner.repository;

import com.adaptive.planner.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    List<NotificationEntity> findAllByOrderByCreatedAtDesc();

    long countByIsReadFalse();

    Optional<NotificationEntity> findByEventKey(String eventKey);

    List<NotificationEntity> findAllByIsReadFalseOrderByCreatedAtDesc();
}
