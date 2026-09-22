package com.adaptive.planner.repository;

import com.adaptive.planner.entity.DailyCheckinEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyCheckinRepository extends JpaRepository<DailyCheckinEntity, Long> {

    Optional<DailyCheckinEntity> findByUserIdAndCheckinDate(String userId, LocalDate checkinDate);

    List<DailyCheckinEntity> findByUserIdAndCheckinDateBetweenOrderByCheckinDateAsc(
        String userId, LocalDate startDate, LocalDate endDate
    );

    List<DailyCheckinEntity> findByUserIdAndIsPeriodDayTrueOrderByCheckinDateAsc(String userId);

    void deleteByUserIdAndCheckinDate(String userId, LocalDate checkinDate);
}
