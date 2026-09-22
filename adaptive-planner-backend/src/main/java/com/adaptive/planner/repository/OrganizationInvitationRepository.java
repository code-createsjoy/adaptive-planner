package com.adaptive.planner.repository;

import com.adaptive.planner.entity.OrganizationInvitationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationInvitationRepository extends JpaRepository<OrganizationInvitationEntity, Long> {
    Optional<OrganizationInvitationEntity> findByTokenAndStatus(String token, String status);
}
