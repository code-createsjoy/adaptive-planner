# Implementation Plan: AI Goal Scheduling Refinements & Anchor Time Engine

Mode: fast
Risk: normal — refining scheduling heuristic engine in GoalScheduleService & ProjectGoalService without DB migrations.

---

## Proposed Changes

### Backend: `adaptive-planner-backend`

#### `GoalScheduleService.java`
- Implement **Anchor Time Heuristic** for Dedicated High-Energy Focus blocks:
  - Establish a consistent high-energy target window (e.g. `08:30 – 11:30`).
  - Scan each day's existing calendar blocks: if the anchor slot is clear, allocate it; if occupied, intelligently shift to the next available non-overlapping opening.
  - Set block title with `⚡ Deep Work: {task} (High Energy)`.
- Refine **Embedded Routine (`EXISTING_WORK_FIT`)**:
  - Scan existing `work` category blocks, select the primary/longest block, and attach project subtasks without creating any overlapping slot.

#### `ProjectGoalService.java`
- Ensure idempotent execution:
  - For `EXISTING_WORK_FIT`: link subtasks to the existing Work block ID and sync `microStepsJson`.
  - For `DEDICATED_DEEP_WORK`: persist new dedicated High-Energy TimeBlock with `energyLevel = "high"`, `priority = "HIGH"`.

---

## Verification Plan

### Automated Tests
- Run `mvn test` in `adaptive-planner-backend` to ensure 100% pass across all unit and controller tests.
- Run `npm run build` in `adaptive-planner-frontend` to ensure clean TypeScript compilation.

### Manual Verification
- Test decomposing a new goal in the AI Chat.
- Verify that selecting "Fit into Current Schedule" embeds subtasks directly into the existing Work block on the timetable without duplicates.
- Verify that selecting "Dedicated Project Blocks" schedules consistent non-overlapping `⚡ Deep Work (High Energy)` blocks.
