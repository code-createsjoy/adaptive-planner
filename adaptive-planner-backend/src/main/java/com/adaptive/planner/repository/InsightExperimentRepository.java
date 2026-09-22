package com.adaptive.planner.repository;

import com.adaptive.planner.entity.InsightExperimentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsightExperimentRepository extends JpaRepository<InsightExperimentEntity, Long> {

    List<InsightExperimentEntity> findByCanonicalUserKeyAndSourceWeek(String canonicalUserKey, LocalDate sourceWeek);

    Optional<InsightExperimentEntity> findFirstByCanonicalUserKeyAndSourceWeekAndStatusNot(String canonicalUserKey, LocalDate sourceWeek, String status);

    Optional<InsightExperimentEntity> findByCanonicalUserKeyAndSourceWeekAndRuleKeyAndEvidenceFingerprint(
            String canonicalUserKey, LocalDate sourceWeek, String ruleKey, String evidenceFingerprint
    );
}
