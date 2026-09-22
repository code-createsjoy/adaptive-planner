# Plan: Workload & Cognitive Load Detection Engine & Quick Rebalance Flow

**Date:** 2026-09-22
**Mode:** --hard
**Risk:** normal — Multi-file backend scoring services, REST endpoints, right sidebar widget, demanding day banner, and quick rebalance modal with diff preview.
**Spec:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/workload-cognitive-load-detection/spec.md)

---

## Executive Summary
This feature introduces Modo's **Personalized Cognitive Load Detection Engine** ("Same Calendar → Different Person → Different Cognitive Load") and **Friction-Free Quick Rebalance Flow**. It evaluates a user's daily timetable across 10 cognitive load factors (meetings, back-to-back blocks, context switches, buffer deficits, personal profile sensitivity, daily energy/mood) and presents:
1. **Right Sidebar**: Compact `Today's Workload` card with transparent root-cause breakdown and `[ Review Schedule → ]`.
2. **Conditional Top Banner**: Only shown on heavy/demanding days ($\ge 75/100$) offering breathing room.
3. **Quick Rebalance Modal**: 3 one-click adjustment options (Add Buffer, Move Flexible Task, Group Similar Tasks) with side-by-side Diff Preview and handoff to AI Assistant.

---

## Phases

### [Phase 1: Backend Multi-Factor Cognitive Load Evaluation & Quick Rebalance Service](file:///d:/6_OJT/adaptive-planner/plans/workload-cognitive-load-detection/phase-01-backend-cognitive-load-and-rebalance-service.md) - [COMPLETED]
- Define DTOs: `CognitiveLoadAssessmentDto`, `QuickRebalanceProposalDto`, `RebalanceOptionDto`.
- Implement `CognitiveLoadEvaluationService` evaluating the 10-factor algorithm with Profile & Checkin modifiers.
- Implement `QuickRebalanceService` generating 3 deterministic smart schedule adjustment scenarios with diffs.
- Implement `CognitiveLoadController` with REST endpoints `GET /api/workload/evaluate` and `GET /api/workload/rebalance-options`.
- Unit and WebMvc tests: `CognitiveLoadEvaluationServiceTest`, `CognitiveLoadControllerTest`.

### [Phase 2: Frontend Data Types, API Clients & React Query Hooks](file:///d:/6_OJT/adaptive-planner/plans/workload-cognitive-load-detection/phase-02-frontend-types-and-hooks.md) - [COMPLETED]
- Add TypeScript interfaces (`CognitiveLoadAssessment`, `QuickRebalanceOption`, `QuickRebalanceProposal`) to `src/types/planner.ts`.
- Implement API methods in `src/lib/api.ts`.
- Create `src/hooks/useCognitiveLoad.ts` with React Query hooks for fetching load assessment and rebalance options.

### [Phase 3: Right Sidebar "Today's Workload" Card & Demanding Day Banner](file:///d:/6_OJT/adaptive-planner/plans/workload-cognitive-load-detection/phase-03-workload-card-and-demanding-banner.md) - [COMPLETED]
- Implement `TodayWorkloadCard.tsx` for the right sidebar with Level badges (`Light` / `Moderate` / `Heavy`), metric badges, expandable "Why?" root-cause explanation, and discrete `Load estimate: 78/100`.
- Implement `DemandingDayBanner.tsx` displayed conditionally above the timeline when the schedule is `HEAVY` ($\ge 75$).
- Mount components into `TodayView` in `AdaptiveApp.tsx`.

### [Phase 4: Quick Rebalance Modal with Diff Preview & AI Chat Handoff](file:///d:/6_OJT/adaptive-planner/plans/workload-cognitive-load-detection/phase-04-quick-rebalance-modal-and-diff-preview.md) - [COMPLETED]
- Implement `QuickRebalanceModal.tsx` showing 3 adjustment options (Add Buffer, Move Task, Group Tasks).
- Embed side-by-side **Diff Preview** (`Current` vs `Proposed`) with color-coded tags.
- Wire `[ Apply changes ]` to batch-apply mutation with 10-second undo toast.
- Wire `✨ Ask Modo for another approach` to transition into AI Chat Planner with pre-filled context.

---

## Verification Plan

### Automated Tests
- Backend Unit & Integration Tests:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-backend
  mvn test "-Dtest=CognitiveLoadEvaluationServiceTest,CognitiveLoadControllerTest"
  ```
- Frontend Typecheck & Build:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend
  npm run build
  ```

### Manual Verification
1. **Right Sidebar Card**: Verify `Today's Workload` card updates dynamically when adding/removing tasks, showing correct levels and "Why?" bullets.
2. **Demanding Day Banner**: Create a dense day (e.g. 4 meetings + 3 focus blocks) and verify the gentle banner appears above the timeline.
3. **Quick Rebalance Flow**: Click `[ Review Schedule ]`, preview Option A/B/C in the Diff Preview, and apply changes. Verify the timetable updates and 10s undo toast is shown.
4. **AI Assistant Handoff**: Click `✨ Ask Modo for another approach` and verify AI Chat opens with pre-loaded workload context.
