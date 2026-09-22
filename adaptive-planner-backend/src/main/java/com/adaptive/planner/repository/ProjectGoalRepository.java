package com.adaptive.planner.repository;

import com.adaptive.planner.entity.ProjectGoalEntity;
import com.adaptive.planner.entity.ProjectGoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectGoalRepository extends JpaRepository<ProjectGoalEntity, Long> {
    List<ProjectGoalEntity> findAllByOrderByCreatedAtDesc();
    List<ProjectGoalEntity> findByStatus(ProjectGoalStatus status);
}
