package com.adaptive.planner.repository;

import com.adaptive.planner.entity.WeeklyRoutineEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

@Repository
public interface WeeklyRoutineRepository extends JpaRepository<WeeklyRoutineEntity, Long> {

    List<WeeklyRoutineEntity> findByDayOfWeekAndEnabledTrueOrderByStartTimeAsc(DayOfWeek dayOfWeek);

    List<WeeklyRoutineEntity> findByDayOfWeekOrderByStartTimeAsc(DayOfWeek dayOfWeek);

    List<WeeklyRoutineEntity> findAllByOrderByDayOfWeekAscStartTimeAsc();

    List<WeeklyRoutineEntity> findByTitleIgnoreCase(String title);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select routine from WeeklyRoutineEntity routine where routine.id = :id")
    Optional<WeeklyRoutineEntity> findByIdForUpdate(@Param("id") Long id);
}
