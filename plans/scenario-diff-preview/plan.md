# Plan: Scenario Schedule Impact Diff Preview Card

**Spec:** `plans/scenario-diff-preview/spec.md`
**Mode:** `--fast`
**Risk:** normal — Frontend UI component & diff calculation utility; no backend/db schema changes or breaking auth.

---

## Architecture Overview

```mermaid
graph TD
  A["PlannerView (AdaptiveApp.tsx)"] -->|Passes baseline blocks & active scenario| B["calculateScheduleDiff.ts"]
  B -->|Returns structured ScheduleDiffItem[]| C["ScenarioDiffPreviewCard.tsx"]
  C -->|User clicks Apply| D["onApplyScenario(scenario)"]
  C -->|User clicks View full timeline| E["FullTimelineModal"]
  A -->|User clicks Option A / B / C| C
```

---

## Phases

- [x] **[Phase 1: Diff Calculation Engine (`calculateScheduleDiff.ts`)](file:///d:/6_OJT/adaptive-planner/plans/scenario-diff-preview/phase-01-diff-calculation-engine.md)**
- [x] **[Phase 2: Scenario Diff Preview Card Component (`ScenarioDiffPreviewCard.tsx`)](file:///d:/6_OJT/adaptive-planner/plans/scenario-diff-preview/phase-02-diff-preview-card-component.md)**
- [x] **[Phase 3: PlannerView Integration & Verification](file:///d:/6_OJT/adaptive-planner/plans/scenario-diff-preview/phase-03-plannerview-integration-and-verification.md)**

---

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-21 14:40
**Phase in progress:** phase-03-plannerview-integration-and-verification
**Status:** Completed and verified with npm run build 0 errors.

### Decisions made this session
- Built pure diff calculation engine `calculateScheduleDiff.ts` supporting NEW, SHIFT_LATER, SHIFT_EARLIER, COMPRESSED, DEFERRED, and UNCHANGED_PROTECTED states.
- Implemented `ScenarioDiffPreviewCard.tsx` with high visual clarity, badge pills, empathetic reasoning, and 1-click apply action.
- Configured interactive 2-column split layout in `PlannerView` so clicking any option card immediately refreshes the adjacent preview card.

### Next immediate action
- Ready for user testing on the live interface.
