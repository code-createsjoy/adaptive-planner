# Phase 1: Backend Multi-Factor Cognitive Load Evaluation & Quick Rebalance Service

## Context & Objectives
Implement the backend calculation engine that evaluates 10 cognitive load factors for a given date, factoring in existing TimeBlocks, the user's Personal Accessibility Profile, and Daily Check-in status. Generate 3 smart quick-rebalance proposals.

## File Ownership
- [NEW] `com/adaptive/planner/dto/CognitiveLoadAssessmentDto.java`
- [NEW] `com/adaptive/planner/dto/QuickRebalanceProposalDto.java`
- [NEW] `com/adaptive/planner/dto/RebalanceOptionDto.java`
- [NEW] `com/adaptive/planner/service/CognitiveLoadEvaluationService.java`
- [NEW] `com/adaptive/planner/service/QuickRebalanceService.java`
- [NEW] `com/adaptive/planner/controller/CognitiveLoadController.java`
- [NEW] `com/adaptive/planner/service/CognitiveLoadEvaluationServiceTest.java`
- [NEW] `com/adaptive/planner/controller/CognitiveLoadControllerTest.java`

## Detailed Implementation Steps
1. **Define DTOs:**
   - `CognitiveLoadAssessmentDto`: fields `date`, `score` (0-100), `level` (`LIGHT` | `MODERATE` | `HEAVY`), `summary`, `bulletPoints` (`List<String>`), `metrics` (`CognitiveMetricsDto`), `isDemanding`.
   - `QuickRebalanceProposalDto` & `RebalanceOptionDto`: id, type (`ADD_BUFFER` | `MOVE_FLEXIBLE_TASK` | `REDUCE_CONTEXT_SWITCH`), title, description, estimatedLoadReduction, diff summary, proposedBlocks (`List<TimeBlockDto>`).
2. **Implement `CognitiveLoadEvaluationService`:**
   - Pull `TimeBlock` records for user and date.
   - Pull `UserAccessibilityProfile` and `DailyCheckin` for user.
   - Calculate metrics: total task count, meeting count, back-to-back blocks (0-minute gap between end and start), context switch count (transitions between categories), deep focus hours (>90m blocks), total buffer minutes between 09:00 and 18:00, deadline clustering.
   - Calculate weighted score: Apply base weights + Profile sensitivity multiplier + Daily Checkin low energy modifier.
   - Classify level: `< 40` -> `LIGHT`, `40..74` -> `MODERATE`, `75..100` -> `HEAVY`.
3. **Implement `QuickRebalanceService`:**
   - Generate Option A (Add 15m buffer after longest meeting or deep block).
   - Generate Option B (Move a non-urgent/flexible task to tomorrow morning).
   - Generate Option C (Reorder tasks to group similar categories/domains together).
4. **Implement `CognitiveLoadController`:**
   - `GET /api/workload/evaluate?date=YYYY-MM-DD`
   - `GET /api/workload/rebalance-options?date=YYYY-MM-DD`
5. **Unit Tests:**
   - Test scoring with low/medium/heavy schedules, profile sensitivity modifiers, and daily checkin mood/period effects.

## Verification
- Run tests:
  ```bash
  mvn test "-Dtest=CognitiveLoadEvaluationServiceTest,CognitiveLoadControllerTest"
  ```
