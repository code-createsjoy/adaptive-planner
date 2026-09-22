package com.adaptive.planner.repository;

import com.adaptive.planner.entity.ProjectSubtaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectSubtaskRepository extends JpaRepository<ProjectSubtaskEntity, Long> {
    List<ProjectSubtaskEntity> findByProjectIdOrderByOrderIndexAsc(Long projectId);
    List<ProjectSubtaskEntity> findByScheduledDateOrderByOrderIndexAsc(LocalDate scheduledDate);
    List<ProjectSubtaskEntity> findByTimeBlockId(Long timeBlockId);
    List<ProjectSubtaskEntity> findByProjectIdAndScheduledDate(Long projectId, LocalDate scheduledDate);
    void deleteByProjectId(Long projectId);
}
