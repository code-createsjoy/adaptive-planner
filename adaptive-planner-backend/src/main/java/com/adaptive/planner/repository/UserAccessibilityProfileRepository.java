package com.adaptive.planner.repository;

import com.adaptive.planner.entity.UserAccessibilityProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAccessibilityProfileRepository extends JpaRepository<UserAccessibilityProfileEntity, Long> {
    Optional<UserAccessibilityProfileEntity> findByUserId(String userId);
}
