# Brainstorm: Real Hybrid Notifications System

**Date:** 2026-09-21  
**Status:** Completed  
**Author:** AI Pair Programmer & Lead User  

---

## 1. Challenge & Context
Adaptive Planner previously had mock notification cards in `NotificationsView` and hardcoded badge counters. To transform Adaptive into a dependable daily companion—especially for neurodivergent individuals and focus-driven professionals—the notification system must be genuinely reactive, persistent, context-aware, and actionable without causing notification fatigue or distraction.

---

## 2. Ideas Explored

1. **Pure Server-Sent Events (SSE) / WebSocket Push**:
   - Backend scans timetable and project states every second and pushes events over an active SSE stream.
   - *Dismissed for MVP*: High complexity for managing stateful reconnections, overhead on local dev, risk of ghost connections.
2. **Pure Periodic Polling (Full Ticker)**:
   - Frontend polls backend API every 10 seconds for all pending alerts.
   - *Dismissed for MVP*: Inefficient; redundant HTTP calls when schedule is unchanged.
3. **Hybrid Client Scheduler + Backend Persisted Sync (Chosen)**:
   - Client calculates deterministic time-based alerts (`BLOCK_STARTING`, `BLOCK_ENDED`) from the active timetable using `setTimeout(nextTriggerAt)` + `visibilitychange` foreground reconciliation.
   - Backend persists business and AI alerts (`REBALANCE_AVAILABLE`, `SCHEDULE_CONFLICT`, `DEADLINE_WARNING`, `PROJECT_COMPLETED`) into PostgreSQL database.
   - Frontend syncs backend notifications every 30–60s and renders in-app Toasts and the Notification Center.

---

## 3. User's Direction & Architectural Decisions

- **3-Tier Hybrid Model**:
  1. *In-app Notification Center*: Persistent in database with real unread counts, categorized history (Today, Yesterday, Earlier), and actionable CTAs.
  2. *Real-time Delivery*: Client-side event evaluation for timetable triggers with deduplication keys (`eventKey`) and foreground wake-up reconciliation.
  3. *Smart AI / Schedule-triggered Decisions*: Non-intrusive AI recommendations (e.g. 70 min uncompleted work detected → prompts user with 3 options via `[View options]` CTA, never auto-editing calendar without consent).
- **Notification Lifecycle**:
  - `SCHEDULED` → `DUE` → `DELIVERED` → `READ` → `ACTIONED` (with `CANCELLED` when schedule modifications invalidate pending alerts).
- **Deduplication Key Engine**:
  - `eventKey = {type}:{entityId}:{scheduledTime}:{offset}` prevents duplicate toasts/alerts on re-renders, refresh, or reconnection.
- **Audio & Web Push (P2 Scope)**:
  - Subtle, gentle chime on session start/end (strictly enabled after user interaction due to browser autoplay policies).
  - Web Notifications API for background tabs when explicitly enabled in Notification Settings.
- **Focus Protection & Anti-Spam**:
  - Suppression during `SLEEP`, `BREAK`, and `DEEP_WORK` (only `HIGH` priority can bypass).

---

## 4. Open Questions & Future Horizons

- **P3 Future Extensions**:
  - Web Push via Service Worker when browser is completely closed.
  - Mobile Push & Email digest for major project milestones.
  - Machine learning personalized reminder lead times based on user transition habits.

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Browser Timer Throttling in Background** | Timers might delay if user closes laptop or switches tabs for hours. | `visibilitychange` event listener computes `lastCheckedAt → now` delta and fires catch-up or updated status immediately upon foreground resume. |
| **Notification Spam / Cognitive Overload** | User feels overwhelmed by repetitive alerts. | Strict event deduplication, priority tiers (LOW / NORMAL / HIGH), and focus-mode suppression. |
| **Outdated Actions** | User clicks CTA on an already resolved conflict or expired task. | Action handlers validate current state before navigating; notifications update status to `ACTIONED` or `CANCELLED`. |
