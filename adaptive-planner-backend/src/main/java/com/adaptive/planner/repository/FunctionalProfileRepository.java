package com.adaptive.planner.repository;

import com.adaptive.planner.entity.FunctionalProfileEntity;
import com.adaptive.planner.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FunctionalProfileRepository extends JpaRepository<FunctionalProfileEntity, Long> {
    Optional<FunctionalProfileEntity> findByUser(UserEntity user);
    Optional<FunctionalProfileEntity> findByUserId(Long userId);
}
