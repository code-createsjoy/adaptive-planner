# Phase 03: Smart Default UI, Alternatives & Atomic Undo

**Parent Plan:** [plans/smart-default-adaptation/plan.md](file:///d:/6_OJT/adaptive-planner/plans/smart-default-adaptation/plan.md)  
**Spec Stories:** [P1]  

---

## 1. Goal
Design and build the **Smart Default Adaptation Card** with transparent *Why?* explanation, collapsible alternatives accordion (`▸ See alternatives`), automatic navigation to Day Timeline on apply, and a 10-second atomic Undo toast with rollback capabilities.

---

## 2. Technical Tasks

### Backend: Transactional Adaptation & Undo
1. **`AdaptationActionEntity.java`:**
   - Fields: `id` (UUID), `createdAt`, `expiresAt`, `reason`, `beforeSnapshotJson`, `afterSnapshotJson`, `status` (`APPLIED` | `ROLLED_BACK`).
2. **`AdaptationService.java` & Controller:**
   - `POST /api/planner/adaptation/apply`: Saves snapshot of all affected blocks and commits the new schedule, returns `actionId`.
   - `POST /api/planner/adaptation/undo/{actionId}`: Restores the exact `beforeSnapshotJson` state in a single `@Transactional` database operation.

### Frontend: UI/UX Redesign
1. **Smart Default Adaptation Card (`PlannerView` in `AdaptiveApp.tsx`):**
   - Header: `⚡ Schedule changed` with clear conflict statement.
   - Section: `✦ Suggested adjustment` (What will happen).
   - Section: `Why this adjustment?` (3-4 bullet points grounded in user priorities, deadlines, and minimal disruption).
   - Primary CTA: `[ Apply this plan ]` (bold, 1-click, high sensory contrast).
   - Secondary Accordion: `▸ See alternatives` (Clicking expands Alternative 1: Shorten task, Alternative 2: Move Gym, etc., each with its own `[ Apply ]` button).
2. **Post-Apply Navigation & Undo Toast:**
   - On clicking `[ Apply this plan ]`:
     - Call `applyAdaptationMutation`.
     - Play gentle 432Hz sine chime.
     - Switch view to `Day Timeline` (`setView("today")` or target date).
     - Display floating bottom toast:
       ```
       ┌────────────────────────────────────────────────────────┐
       │ ✓ Schedule adjusted · Study moved to tomorrow at 13:00 │
       │                                            [ ↩ Undo ]  │
       └────────────────────────────────────────────────────────┘
       ```
     - Auto-dismiss after 10 seconds.
     - Clicking `[ ↩ Undo ]` calls `undoAdaptationMutation` and instantly restores previous blocks.

---

## 3. Verification Criteria
- [ ] 1-Click `[ Apply this plan ]` immediately applies changes and redirects to Day Timeline.
- [ ] The floating Undo banner appears for 10 seconds and successfully restores original blocks when clicked.
- [ ] `▸ See alternatives` toggles cleanly without cluttering the initial view.
