# Phase 02: Calm Slotting & Tomorrow Inbox

**Parent Plan:** [plans/smart-default-adaptation/plan.md](file:///d:/6_OJT/adaptive-planner/plans/smart-default-adaptation/plan.md)  
**Spec Stories:** [P1]  

---

## 1. Goal
Implement the **Calm Opening Slotting Engine** for day $D+1$ and the **Tomorrow Inbox** mechanism when no comfortable slot is available.

---

## 2. Technical Tasks

### Backend & Algorithm
1. **Calm Opening Detection Algorithm (`TimeSlotService.java` / `AiPlannerService.java`):**
   - Query all blocks on target date (e.g. tomorrow).
   - Find gaps between blocks where $\text{gapDuration} \ge \text{taskDuration} + 30\text{min}$.
   - Filter out gaps:
     - Inside `PROTECTED` sleep windows (`23:00–07:00` or user-defined).
     - Directly between two `HIGH` energy focus sessions (prevent focus stacking).
     - Inside meal times (`12:00–13:00`, `18:00–19:00`).
   - If valid calm gap found $\rightarrow$ assign `startTime` and `endTime` on day $D+1$, set `status = 'SCHEDULED'`.
   - If no valid calm gap found $\rightarrow$ set `startTime = null, endTime = null, status = 'DEFERRED', inboxDate = targetDate`.
2. **Tomorrow Inbox API:**
   - Endpoint `GET /api/timeblocks/inbox?date={targetDate}` to fetch deferred tasks for that day.
   - Endpoint `POST /api/timeblocks/{id}/schedule-from-inbox` to manually or automatically assign a slot.

### Frontend
1. **Inbox State in Store (`usePlannerStore.ts`):**
   - Track `inboxBlocks: TimeBlock[]` for the selected date.
2. **Tomorrow Inbox Drawer Component:**
   - In `DayTimeline` and `MonthCalendarView`, show an elegant, calm collapsible drawer:  
     `📥 Tomorrow Inbox (1 deferred task) • [ 📚 Study (~60m) ] • [ Find a slot ]`.

---

## 3. Verification Criteria
- [ ] Deferring a 60m task to an open day automatically places it into a Calm Opening (e.g. 13:00–14:00).
- [ ] Deferring a task to a fully-booked day sets status `DEFERRED` and places it cleanly into Tomorrow Inbox without schedule collision.
