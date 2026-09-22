package com.adaptive.planner.repository;

import com.adaptive.planner.entity.NeurodivergenceProfileEntity;
import com.adaptive.planner.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NeurodivergenceProfileRepository extends JpaRepository<NeurodivergenceProfileEntity, Long> {
    Optional<NeurodivergenceProfileEntity> findByUser(UserEntity user);
    Optional<NeurodivergenceProfileEntity> findByUserId(Long userId);
}
