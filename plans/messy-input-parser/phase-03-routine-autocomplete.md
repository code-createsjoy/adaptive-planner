# Phase 3: Routine-Informed Smart Autocomplete

**Parent Plan:** [`plans/messy-input-parser/plan.md`](file:///d:/6_OJT/adaptive-planner/plans/messy-input-parser/plan.md)  
**Spec Story:** P2 (Habit-aware autocomplete suggestion bar)

---

## Scope & Changes

### 1. Frontend (`PlannerView` in `AdaptiveApp.tsx`)
- Read routines from `useRoutinesQuery()`.
- Listen to text input change in `PromptInputTextarea`.
- If input matches 1-3 words (e.g. `gym`, `hop`, `java`, `cafe`):
  - Filter active `WeeklyRoutine` entries by title matching.
  - Render a subtle floating suggestion bar above or below the textarea:
    - `🏋️ Gym · Lịch quen: Thứ 3 & Thứ 5 · 18:00 (1h) → [Dùng lịch này]`
  - Clicking auto-fills the proposal or sets prompt text for instant confirmation.
