package com.adaptive.planner.repository;

import com.adaptive.planner.entity.OrganizationEntity;
import com.adaptive.planner.entity.OrganizationMemberEntity;
import com.adaptive.planner.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMemberEntity, Long> {
    List<OrganizationMemberEntity> findByUser(UserEntity user);
    List<OrganizationMemberEntity> findByOrganization(OrganizationEntity organization);
    Optional<OrganizationMemberEntity> findByUserAndOrganization(UserEntity user, OrganizationEntity organization);
}
