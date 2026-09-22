# Phase 1: Backend Domain Model, Repository, Service & REST APIs

## Context & Objectives
Provide backend persistence and REST API endpoints for user accessibility profiles, onboarding question mappings, and preference updates.

## File Ownership
- [NEW] `src/main/java/com/adaptive/planner/entity/UserAccessibilityProfileEntity.java`
- [NEW] `src/main/java/com/adaptive/planner/repository/UserAccessibilityProfileRepository.java`
- [NEW] `src/main/java/com/adaptive/planner/dto/UserAccessibilityProfileDto.java`
- [NEW] `src/main/java/com/adaptive/planner/dto/OnboardingAnswersDto.java`
- [NEW] `src/main/java/com/adaptive/planner/service/UserAccessibilityProfileService.java`
- [NEW] `src/main/java/com/adaptive/planner/controller/UserAccessibilityProfileController.java`
- [NEW] `src/test/java/com/adaptive/planner/service/UserAccessibilityProfileServiceTest.java`
- [NEW] `src/test/java/com/adaptive/planner/controller/UserAccessibilityProfileControllerTest.java`

## Detailed Implementation Steps
1. **Create `UserAccessibilityProfileEntity`:**
   - Fields: `id`, `userId` (unique, default "default-user"), `visualDensity` ("low", "medium", "high"), `sensorySensitivity` ("high", "medium", "standard"), `focusSupport` ("single-task", "now-next", "full-timeline"), `scheduleStructure` ("flexible", "balanced", "structured"), `notificationStyle` ("gentle", "standard", "persistent"), `communicationStyle` ("empathetic", "concise", "direct"), `onboardingCompleted` (Boolean), `createdAt`, `updatedAt`.
2. **Create `UserAccessibilityProfileRepository`:**
   - `Optional<UserAccessibilityProfileEntity> findByUserId(String userId);`
3. **Implement `UserAccessibilityProfileService`:**
   - `getProfile(userId)`: returns existing or creates sensible default profile.
   - `updateProfile(userId, dto)`: updates baseline profile fields.
   - `completeOnboarding(userId, answersDto)`: maps 4 answers to baseline profile parameters and marks `onboardingCompleted = true`.
4. **Implement `UserAccessibilityProfileController`:**
   - `GET /api/user/accessibility-profile`
   - `PUT /api/user/accessibility-profile`
   - `POST /api/user/accessibility-profile/onboarding`
5. **Unit & Controller Tests:**
   - MockMvc tests for all endpoints and mapping logic tests in service.

## Verification
- Run backend tests:
  ```bash
  mvn test "-Dtest=UserAccessibilityProfileServiceTest,UserAccessibilityProfileControllerTest"
  ```
