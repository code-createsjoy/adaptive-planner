# Spec: Real Hybrid Notifications System

**Date:** 2026-09-21  
**Status:** Ready  
**Module:** `notifications-system`  

---

## 1. Problem Statement
Adaptive Planner previously relied on hardcoded mock notifications in `NotificationsView` and static sidebar badge counts (`badge: 2`). Users had no real-time transition prompts before focus blocks, no persistence of AI rebalance alerts or schedule conflicts, and no interactive CTAs to resolve project risks directly from notification items.

---

## 2. User Stories

### [P1] Core MVP Requirements
- **[P1-US1] Database Persistence & Real Badge**: As a user, I want my notifications and unread badge count to be persisted in PostgreSQL so that refreshing the browser or reopening the app never loses my notification history or shows incorrect numbers.
  *Accepted when*: Database table `notifications` stores records with `is_read`, `created_at`, `priority`, `action_type`, `action_data`, and the sidebar icon badge accurately reflects `COUNT(unread)`.
- **[P1-US2] Notification Center & History Grouping**: As a user, I want to open the Notifications view to see grouped alerts (Today, Yesterday, Earlier) with "Mark as read" and "Mark all as read" capabilities.
  *Accepted when*: Clicking "Mark as read" updates database state immediately; clicking "Mark all as read" resets the unread count to 0 while keeping the historical log intact.
- **[P1-US3] Client Timetable Reminder & Foreground Reconciliation**: As a user, I want to receive proactive in-app toast alerts before a scheduled session starts (e.g. 5m / 10m / 15m before) and when a session ends so that I can transition smoothly without watching the clock.
  *Accepted when*: `setTimeout(nextTriggerAt)` fires timely toasts; when resuming from tab sleep/laptop lid close, `visibilitychange` reconciles elapsed events and displays the appropriate current status.
- **[P1-US4] Deduplication Key Engine**: As a user, I want reminder alerts to fire at most once per session without duplicates on re-render, refresh, or network reconnect.
  *Accepted when*: Each event uses an idempotent `eventKey = {type}:{entityId}:{scheduledTime}:{offset}` tracked in session state and enforced on backend inserts.
- **[P1-US5] Actionable Notifications & AI Rebalance Flow**: As a user, I want notifications to have contextual CTA buttons (e.g. `[Open session]`, `[Review Progress]`, `[View options]`) so that I can immediately jump into AI rebalancing or review tasks with 1 click.
  *Accepted when*: Clicking a CTA routes directly to the relevant view, drawer, or rebalance preview modal. AI rebalance alerts trigger the 3-option preview flow rather than silently modifying the timetable.

### [P2] Enhanced Experience
- **[P2-US1] Web Notifications API**: As a user who is working in another browser tab or desktop application, I want browser push notifications for starting sessions when permission is granted.
  *Accepted when*: Notification permission is requested gently via Settings / toggle (not on initial site visit) and sends native browser notifications for `HIGH` and `NORMAL` events.
- **[P2-US2] User-Enabled Gentle Audio Alert**: As a user, I want an optional subtle audio chime when sessions start or end to alert me without visual interruption.
  *Accepted when*: Audio chime is toggled in Notification Settings and activated upon user gesture.
- **[P2-US3] Notification Preferences & Focus-Mode Suppression**: As a user, I want to configure my early reminder lead time (e.g., 5 min, 10 min, 15 min) and silence non-critical notifications during Deep Work, Break, and Sleep blocks.
  *Accepted when*: Changing reminder lead time updates scheduling offsets dynamically, and `LOW` priority alerts are queued until focus sessions end.

### [P3] Future Horizons (Out of Scope for MVP)
- Push notifications when browser is completely shut down (Service Worker WebPush with VAPID).
- Mobile push notifications & Email digest.
- Machine learning auto-tuning for personal sensory transition lead times.

---

## 3. Functional Requirements

1. **FR-01 (Data Model & REST Endpoints)**:
   - Create `NotificationEntity` in backend with fields: `id`, `user_id`, `type`, `priority` (`LOW`, `NORMAL`, `HIGH`), `title`, `message`, `related_entity_type`, `related_entity_id`, `action_type`, `action_data` (JSON), `is_read`, `read_at`, `event_key` (unique/idempotency), `created_at`.
   - Implement REST endpoints:
     - `GET /api/notifications` (list with pagination/filter)
     - `GET /api/notifications/unread-count`
     - `PUT /api/notifications/{id}/read`
     - `PUT /api/notifications/read-all`
     - `DELETE /api/notifications/{id}`
2. **FR-02 (Client-Side Real-Time Evaluator)**:
   - Compute `nextTriggerAt` for nearest upcoming timetable events:
     - `BLOCK_STARTING` (e.g. 10m before block start)
     - `BLOCK_STARTED` (at start time)
     - `BLOCK_ENDED` (at end time, prompting checklist review)
   - Store triggered `eventKey` set in session storage / memory.
   - Listen to `document.addEventListener('visibilitychange', ...)` to reconcile missed intervals upon tab wake.
3. **FR-03 (Backend AI / Project Event Emission)**:
   - Trigger backend notifications when:
     - Project has pending subtasks nearing deadline (`DEADLINE_WARNING` / `PROJECT_AT_RISK`).
     - AI identifies rebalancing opportunities (`REBALANCE_AVAILABLE`).
     - Milestone or Project is finished (`MILESTONE_COMPLETED` / `PROJECT_COMPLETED`).
     - Schedule conflict is detected (`SCHEDULE_CONFLICT`).
4. **FR-04 (In-App Notification Center UI)**:
   - Replace mock data in `NotificationsView` with real query results from `/api/notifications`.
   - Group items into `Hôm nay (Today)`, `Hôm qua (Yesterday)`, and `Cũ hơn (Earlier)`.
   - Render unread status indicator, timestamp, priority badge, and actionable CTA buttons.
5. **FR-05 (Toast System & CTA Routing)**:
   - Floating in-app toast notification upon trigger with sound (if enabled) and direct action button.
   - Deep navigation to `timetable`, `project_progress`, `ai_planner`, or `rebalance_modal`.
6. **FR-06 (Notification Settings)**:
   - Add early reminder selector (5 min, 10 min, 15 min).
   - Add toggles for In-app toasts, Browser notifications, and Audio chime (P2).

---

## 4. Non-Functional Requirements

- **Performance**:
  - Unread count API latency `< 30ms`.
  - Client timetable evaluator executes in `< 2ms` per evaluation tick without causing main thread jank or frame drops.
  - Background polling interval: 30–60s (lightweight, `< 2KB` payload).
- **Reliability & Idempotency**:
  - `eventKey` prevents duplicate notifications on multi-tab or page refreshes.
  - Zero duplicate toast alerts in a single user session.
- **Accessibility & Cognitive Ergonomics**:
  - Non-intrusive sound frequency and gentle animations adhering to neurodivergent-friendly design principles.

---

## 5. Success Criteria

- [ ] Unread notification count in sidebar matches exact database count across page reloads.
- [ ] Timetable blocks trigger real-time in-app toast reminders at the user-configured lead time (e.g., 10 minutes before start).
- [ ] No duplicate notifications appear when refreshing or opening multiple tabs.
- [ ] Clicking "Mark as read" or "Mark all as read" immediately updates database and badge state.
- [ ] Clicking notification CTAs (e.g., `[View options]`) opens the exact AI rebalance or task context.
- [ ] 100% backend unit and integration test suite pass (`mvn test`).

---

## 6. Out of Scope

- Native OS background push notifications when browser application is completely closed.
- SMS or Email notification delivery.
- Custom user-recorded sound uploads.

---

## 7. Assumptions

- TimeBlock start and end times format is standard `HH:mm` on dates formatted `YYYY-MM-DD`.
- Browser supports standard `Notification` API and `AudioContext` / HTML5 Audio API for P2 features.
