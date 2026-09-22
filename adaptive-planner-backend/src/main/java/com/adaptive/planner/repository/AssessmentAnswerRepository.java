package com.adaptive.planner.repository;

import com.adaptive.planner.entity.AssessmentAnswerEntity;
import com.adaptive.planner.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentAnswerRepository extends JpaRepository<AssessmentAnswerEntity, Long> {
    List<AssessmentAnswerEntity> findByUser(UserEntity user);
    void deleteByUser(UserEntity user);
}
