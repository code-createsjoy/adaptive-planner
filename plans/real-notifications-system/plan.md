# Plan: Real Hybrid Notifications System

**Date:** 2026-09-21  
**Spec:** `plans/real-notifications-system/spec.md`  
**Brainstorm:** `plans/reports/260921-real-notifications-system-brainstorm.md`  
**Mode:** hard  
**Risk:** normal — multi-file full-stack implementation across Spring Boot backend and React/TanStack Start frontend with no destructive operations.  

---

## 1. Architecture Overview

```
               ┌─────────────────────────────────────────────────────────┐
               │                     CLIENT (React)                      │
               │                                                         │
               │   ┌──────────────────────────────────────────────────┐  │
               │   │      Client Timetable Scheduler & Evaluator      │  │
               │   │    (Calculates nextTriggerAt, reconciles on      │  │
               │   │    visibilitychange, deduplicates via eventKey)  │  │
               │   └──────────────────────┬───────────────────────────┘  │
               │                          │                              │
               │        BLOCK_STARTING /  │  In-app Toasts               │
               │        BLOCK_ENDED       ▼  & Audio Alert (P2)          │
               │   ┌──────────────────────────────────────────────────┐  │
               │   │               Floating Toast System              │  │
               │   └──────────────────────────────────────────────────┘  │
               │                          ▲                              │
               │        Poll (30–60s)     │ Synchronized Alerts          │
               │        + Action CTAs     │                              │
               │   ┌──────────────────────┴───────────────────────────┐  │
               │   │    In-app Notification Center (NotificationsView)│  │
               │   │    - Grouped by Today / Yesterday / Earlier      │  │
               │   │    - Real-time unread badge on sidebar           │  │
               │   │    - Mark as read / Mark all as read             │  │
               │   └──────────────────────┬───────────────────────────┘  │
               └──────────────────────────┼──────────────────────────────┘
                                          │ REST API
                                          ▼
               ┌─────────────────────────────────────────────────────────┐
               │                  BACKEND (Spring Boot)                  │
               │                                                         │
               │   ┌──────────────────────────────────────────────────┐  │
               │   │           NotificationController & DTOs          │  │
               │   │    GET /api/notifications                        │  │
               │   │    GET /api/notifications/unread-count           │  │
               │   │    PUT /api/notifications/{id}/read              │  │
               │   │    PUT /api/notifications/read-all               │  │
               │   └──────────────────────┬───────────────────────────┘  │
               │                          ▼                              │
               │   ┌──────────────────────────────────────────────────┐  │
               │   │               NotificationService                │  │
               │   │    (Handles deduplication, lifecycle,            │  │
               │   │     and emits AI / Project / Conflict events)    │  │
               │   └──────────────────────┬───────────────────────────┘  │
               │                          ▼                              │
               │   ┌──────────────────────────────────────────────────┐  │
               │   │          PostgreSQL: `notifications`             │  │
               │   └──────────────────────────────────────────────────┘  │
               └─────────────────────────────────────────────────────────┘
```

---

## 2. Phase Breakdown

| Phase | Description | Key Deliverables |
| :--- | :--- | :--- |
| **Phase 1: Backend Persistence & REST API** | Create `NotificationEntity`, repository, DTOs, service with idempotent event keys, and complete REST endpoints + unit tests. | `NotificationEntity.java`, `NotificationRepository.java`, `NotificationService.java`, `NotificationController.java`, `NotificationControllerTest.java` |
| **Phase 2: Client Timetable Evaluator & In-app Toast System** | Build client-side timer evaluator with `setTimeout(nextTriggerAt)`, `visibilitychange` foreground catch-up, `eventKey` deduplication, and animated in-app toast alerts with action buttons. | `useTimetableNotificationEvaluator.ts` / Evaluator hook, `NotificationToastContainer.tsx`, CTA routing |
| **Phase 3: Real Notification Center UI & Settings** | Replace mock data in `NotificationsView` with real query results, group by Today/Yesterday/Earlier, real badge count in sidebar, and Notification Settings (remind early selector: 5m, 10m, 15m). | `NotificationsView` in `AdaptiveApp.tsx`, sidebar badge query, settings early reminder state |
| **Phase 4: AI & Project Event Integration** | Wire backend event creation for `REBALANCE_AVAILABLE`, `SCHEDULE_CONFLICT`, `DEADLINE_WARNING`, and `PROJECT_COMPLETED` with interactive 1-click CTAs (`[View options]`, `[Review Progress]`). | `ProjectGoalService.java`, `GoalScheduleService.java`, `AiPlannerService.java`, `NotificationService.java` |
| **Phase 5: Verification & End-to-End Testing** | Verify zero duplicate alerts, page reload persistence, unread count accuracy, toast CTA navigation, and 100% backend test suite pass. | `mvn test` (all tests passing), frontend build verification (`npm run build`) |

---

## 3. Risks & Mitigations

- **Risk 1 (Timer Throttling during Laptop Sleep)**: Addressed via `document.addEventListener('visibilitychange')` that checks elapsed time delta and updates state instantly upon wake.
- **Risk 2 (Duplicate Alerts on Rerender / Multi-tab)**: Addressed via deterministic `eventKey` pattern (`{type}:{entityId}:{scheduledTime}:{offset}`) stored in session set and enforced in DB.
- **Risk 3 (Non-intrusive AI UX)**: AI notifications strictly emit suggestion alerts with `[View options]` CTA; never auto-modify user timetable without explicit user confirmation.
