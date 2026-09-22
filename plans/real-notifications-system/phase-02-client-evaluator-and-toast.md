# Phase 2: Client Timetable Evaluator & In-app Toast System

**Goal**: Implement the client-side deterministic timetable alert evaluator and the floating toast alert component with action buttons.

---

## 1. Scope & Deliverables

1. **Client Timetable Evaluator Engine**:
   - Calculates `nextTriggerAt` for nearest upcoming timetable events:
     - `BLOCK_STARTING`: Triggered X minutes (e.g. 5m, 10m, 15m from settings) before `block.startTime`.
     - `BLOCK_ENDED`: Triggered at `block.endTime`, prompting user to verify their checklist.
   - Schedules timer using `setTimeout(nextTriggerAt - now)`.
   - Reconciles missed events on `document.addEventListener('visibilitychange')` when returning to foreground.
   - Employs session-based `eventKey` set to guarantee 0 duplicate alerts.
2. **In-App Toast Alert UI**:
   - Floating animated toast component rendered at the bottom-right or top-right.
   - Displays icon, title, message, time badge, priority indicator, and contextual CTA button.
   - Auto-dismiss after 6–8 seconds or on user interaction.
3. **Optional Web Notification & Audio Chime (P2)**:
   - If browser notification permission is granted and setting is ON, calls `new Notification(title, { body })`.
   - If audio alert setting is ON, plays gentle Web Audio chime on user-enabled session.

---

## 2. Verification
- Changing system time or viewing upcoming blocks triggers toasts at the exact scheduled lead time.
- Refreshing the browser does not re-trigger previously fired reminders in the same session.
