# Phase 5: B2B Domain Foundation & Instant Dashboard Personalization Wiring

## Context & Objectives
1. Implement the B2B organization domain schema and entities (`OrganizationEntity`, `OrganizationMemberEntity`, `OrganizationInvitationEntity`) in the backend to establish clean multi-tenant authorization models for future enterprise features.
2. Connect the generated `FunctionalProfile` into the active dashboard experience so that UI density, focus modes, and task breakdown shortcuts immediately adapt to the user's cognitive profile upon completing onboarding.

## File Ownership
- [NEW] `com/adaptive/planner/entity/OrganizationEntity.java`
- [NEW] `com/adaptive/planner/entity/OrganizationMemberEntity.java`
- [NEW] `com/adaptive/planner/entity/OrganizationInvitationEntity.java`
- [NEW] `com/adaptive/planner/repository/OrganizationRepository.java`
- [NEW] `com/adaptive/planner/repository/OrganizationMemberRepository.java`
- [NEW] `com/adaptive/planner/repository/OrganizationInvitationRepository.java`
- [MODIFY] `adaptive-planner-frontend/src/components/adaptive/AdaptiveApp.tsx` (apply personalized dashboard defaults)
- [MODIFY] `adaptive-planner-frontend/src/store/useAccessibilityStore.ts` (sync with FunctionalProfile)

## Detailed Implementation Steps
1. **Define B2B Backend Entities**:
   - `OrganizationEntity`: `id`, `name`, `createdAt`.
   - `OrganizationMemberEntity`: `user`, `organization`, `role` (`EMPLOYEE`, `MANAGER`, `HR`, `ORG_ADMIN`), `status` (`ACTIVE`, `INACTIVE`), `joinedAt`.
   - `OrganizationInvitationEntity`: `email`, `organization`, `invitedRole`, `token` (unique), `expiresAt`, `status` (`PENDING`, `ACCEPTED`, `REVOKED`).
2. **Wire Dashboard Personalization in Frontend**:
   - When onboarding completes or `FunctionalProfile` loads:
     - If `sensorySensitivityScore >= 70` $\rightarrow$ set sensory mode to `Calm`.
     - If `taskInitiationScore >= 70` $\rightarrow$ highlight "Magic Task Breakdown" triggers on timeline cards.
     - If `needForStructureScore >= 70` $\rightarrow$ set default view to Structured Timeline with clear time boundaries.
3. **End-to-End Test Suite Execution**:
   - Run full backend tests: `mvn test` (must pass 100%).
   - Run full frontend build: `npm run build` (must pass with 0 errors).

## Verification
```bash
cd d:/6_OJT/adaptive-planner/adaptive-planner-backend && mvn test
cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend && npm run build
```
