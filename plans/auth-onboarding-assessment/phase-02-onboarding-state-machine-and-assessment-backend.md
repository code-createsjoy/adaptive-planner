# Phase 2: Onboarding State Machine, Functional Profile & Assessment Backend

## Context & Objectives
Implement the backend state machine for tracking user onboarding progress, saving private neurodivergence self-identification, processing the 12-question deterministic functional assessment, and generating scored `FunctionalProfile` records.

## File Ownership
- [NEW] `com/adaptive/planner/entity/NeurodivergenceProfileEntity.java`
- [NEW] `com/adaptive/planner/entity/FunctionalProfileEntity.java`
- [NEW] `com/adaptive/planner/entity/AssessmentAnswerEntity.java`
- [NEW] `com/adaptive/planner/repository/NeurodivergenceProfileRepository.java`
- [NEW] `com/adaptive/planner/repository/FunctionalProfileRepository.java`
- [NEW] `com/adaptive/planner/repository/AssessmentAnswerRepository.java`
- [NEW] `com/adaptive/planner/dto/onboarding/JourneyStageRequest.java`
- [NEW] `com/adaptive/planner/dto/onboarding/NeurodivergenceSelfIdRequest.java`
- [NEW] `com/adaptive/planner/dto/onboarding/AssessmentSubmissionRequest.java`
- [NEW] `com/adaptive/planner/dto/onboarding/FunctionalProfileDto.java`
- [NEW] `com/adaptive/planner/service/AssessmentScoringService.java`
- [NEW] `com/adaptive/planner/service/OnboardingService.java`
- [NEW] `com/adaptive/planner/controller/OnboardingController.java`
- [NEW] `com/adaptive/planner/service/AssessmentScoringServiceTest.java`
- [NEW] `com/adaptive/planner/controller/OnboardingControllerTest.java`

## Detailed Implementation Steps
1. **Define Domain Entities**:
   - `NeurodivergenceProfileEntity`: `user` (OneToOne), `identificationStatus` (e.g. `DIAGNOSED`, `SELF_IDENTIFIED`, `EXPLORING`, `NEUROTYPICAL`, `UNSURE`), `selectedConditionsJson`, `isPrivate` (default `true`).
   - `FunctionalProfileEntity`: `user` (OneToOne), 6 dimension scores (0–100): `attentionRegulationScore`, `taskInitiationScore`, `timeAwarenessScore`, `contextSwitchingScore`, `sensorySensitivityScore`, `needForStructureScore`, `communicationPreference`, `recommendedMode` (`CALM` | `BALANCED` | `FOCUS`), `assessmentCompleted` (boolean).
   - `AssessmentAnswerEntity`: `user`, `questionId`, `selectedOptionIndex`, `scoreWeight`.
2. **Implement `AssessmentScoringService`**:
   - Map 12 questions into 6 distinct dimensions.
   - Aggregate weights (0–3) normalized to 0–100 score per dimension.
   - Determine recommended baseline sensory mode:
     - If `sensorySensitivityScore >= 70` $\rightarrow$ `CALM`.
     - Else if `attentionRegulationScore >= 70` $\rightarrow$ `FOCUS`.
     - Else $\rightarrow$ `BALANCED`.
3. **Implement `OnboardingService` & `OnboardingController`**:
   - `POST /api/onboarding/journey-stage`: Updates `user.journeyStage`.
   - `POST /api/onboarding/neurodivergence-self-id`: Stores private self-id record.
   - `POST /api/onboarding/assessment/submit`: Stores individual answers and computes/saves `FunctionalProfile`.
   - `POST /api/onboarding/complete`: Sets `user.onboardingCompleted = true`.
   - `GET /api/onboarding/functional-profile`: Retrieves user's active functional profile.

## Verification
```bash
cd d:/6_OJT/adaptive-planner/adaptive-planner-backend
mvn test "-Dtest=AssessmentScoringServiceTest,OnboardingControllerTest"
```
