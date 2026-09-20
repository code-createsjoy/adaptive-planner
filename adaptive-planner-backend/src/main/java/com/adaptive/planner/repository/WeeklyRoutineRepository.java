package com.adaptive.planner.repository;

import com.adaptive.planner.entity.WeeklyRoutineEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface WeeklyRoutineRepository extends JpaRepository<WeeklyRoutineEntity, Long> {

    List<WeeklyRoutineEntity> findByDayOfWeekAndEnabledTrueOrderByStartTimeAsc(DayOfWeek dayOfWeek);

    List<WeeklyRoutineEntity> findByDayOfWeekOrderByStartTimeAsc(DayOfWeek dayOfWeek);

    List<WeeklyRoutineEntity> findAllByOrderByDayOfWeekAscStartTimeAsc();

    List<WeeklyRoutineEntity> findByTitleIgnoreCase(String title);
}
