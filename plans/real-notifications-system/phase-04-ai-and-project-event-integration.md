# Phase 4: AI & Project Event Integration

**Goal**: Connect backend domain events (Goal progress, deadline risks, schedule conflicts, and rebalancing opportunities) into the notification system with actionable 1-click CTAs.

---

## 1. Scope & Deliverables

1. **Event Sources**:
   - `AiPlannerService` / `AdaptationService`: Creates `SCHEDULE_CONFLICT` or `REBALANCE_AVAILABLE` notification when an unexpected meeting or schedule shift creates unallocated work time.
   - `ProjectGoalService`:
     - Creates `DEADLINE_WARNING` when a goal is tight or overdue subtasks exist.
     - Creates `MILESTONE_COMPLETED` / `PROJECT_COMPLETED` upon ticking milestone subtasks to 100%.
2. **Contextual CTAs & Deep Routing**:
   - `REBALANCE_AVAILABLE` → Action CTA `[Xem phương án cân đối]` opens the AI Adaptation modal with 3 scenario options.
   - `BLOCK_STARTING` / `BLOCK_ENDED` → Action CTA `[Xem checklist ca làm]` navigates to Today View focus card.
   - `PROJECT_COMPLETED` → Action CTA `[Xem tổng kết dự án]`.
3. **Polling / Sync Cycle**:
   - Frontend syncs server notifications every 30–60s to capture newly generated backend events and shows corresponding in-app toasts.

---

## 2. Verification
- Applying an emergency schedule disruption triggers a `REBALANCE_AVAILABLE` notification in Notification Center.
- Clicking `[Xem phương án]` opens the 3-option adaptation modal directly.
