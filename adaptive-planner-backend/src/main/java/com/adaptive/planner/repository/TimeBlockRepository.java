package com.adaptive.planner.repository;

import com.adaptive.planner.entity.TimeBlockEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeBlockRepository extends JpaRepository<TimeBlockEntity, Long> {

    List<TimeBlockEntity> findAllByOrderByStartTimeAsc();

    List<TimeBlockEntity> findByDateOrderByStartTimeAsc(java.time.LocalDate date);

    List<TimeBlockEntity> findByDateBetweenOrderByStartTimeAsc(java.time.LocalDate startDate, java.time.LocalDate endDate);

    List<TimeBlockEntity> findByDateAndSourceRoutineId(java.time.LocalDate date, Long sourceRoutineId);

    List<TimeBlockEntity> findByInboxDateAndStatus(java.time.LocalDate inboxDate, String status);

    List<TimeBlockEntity> findByStatus(String status);

    void deleteByDate(java.time.LocalDate date);
}
