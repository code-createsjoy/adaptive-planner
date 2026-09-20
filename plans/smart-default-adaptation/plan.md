# Implementation Plan: Smart Default Adaptation Engine

**Spec:** [plans/smart-default-adaptation/spec.md](file:///d:/6_OJT/adaptive-planner/plans/smart-default-adaptation/spec.md)  
**Date:** 2026-09-20  
**Mode:** --hard  
**Risk:** normal — multi-file backend/frontend feature with non-destructive schema additions and reversible undo mechanism.  

---

## 1. Architecture Overview

```
                      USER DISRUPTION INPUT
                      ("họp gấp 18:30–20:30")
                                │
                                ▼
        ┌────────────────────────────────────────────────┐
        │   AiPlannerService / Local Scoring Engine      │
        │   1. Hard Constraints (Urgent event, Protected) │
        │   2. Multi-Factor Matrix (Priority vs Deadline)│
        │   3. Protected Inviolability (Sleep/Rest hard) │
        │   4. Calm Slotting (Tomorrow) / Tomorrow Inbox │
        └───────────────────────┬────────────────────────┘
                                │
                                ▼
                   SMART DEFAULT RECOMMENDATION
             ┌──────────────────────────────────────┐
             │ • What changed                       │
             │ • Recommended schedule adjustment    │
             │ • Transparent "Why?" explanation     │
             │                                      │
             │        [ Apply this plan ]           │
             │       ▸ See alternatives             │
             └──────────────────┬───────────────────┘
                                │ (User 1-Clicks Apply)
                                ▼
        ┌────────────────────────────────────────────────┐
        │   AdaptationAction Service (Atomic Rollback)   │
        │   1. Save snapshot of pre-adaptation state     │
        │   2. Apply new blocks & deferred statuses      │
        │   3. Return actionId for Undo                  │
        └───────────────────────┬────────────────────────┘
                                │
                                ▼
        ┌────────────────────────────────────────────────┐
        │   Day Timeline + 10s Floating Undo Toast       │
        │   • Play 432Hz calming chime                   │
        │   • Update schedule view instantly             │
        │   • Show [ ↩ Undo ] banner (10s expiry)        │
        └────────────────────────────────────────────────┘
```

---

## 2. Implementation Phases

| Phase | Title | Scope & Objectives | Covered Stories |
| :--- | :--- | :--- | :--- |
| **Phase 01** [x] | [Domain Model & Multi-Factor Decision Matrix](file:///d:/6_OJT/adaptive-planner/plans/smart-default-adaptation/phase-01-domain-and-decision-matrix.md) | Extend `TimeBlock` domain (Priority, Deadline, isMovable, status lifecycle), upgrade backend/local scoring matrix. | [P1], [P2] |
| **Phase 02** [x] | [Calm Slotting & Tomorrow Inbox](file:///d:/6_OJT/adaptive-planner/plans/smart-default-adaptation/phase-02-calm-slotting-and-inbox.md) | Implement Calm Opening detection on day D+1 and Tomorrow Inbox drawer for unscheduled deferred tasks. | [P1] |
| **Phase 03** [x] | [Smart Default UI, Alternatives & Atomic Undo](file:///d:/6_OJT/adaptive-planner/plans/smart-default-adaptation/phase-03-smart-default-ui-and-undo.md) | Build 1-Click Smart Default card with bulleted *Why?*, collapsible alternatives, timeline auto-navigation, and 10s transactional Undo toast. | [P1] |
| **Phase 04** [x] | [End-to-End Verification & Edge Cases](file:///d:/6_OJT/adaptive-planner/plans/smart-default-adaptation/phase-04-verification-and-e2e.md) | Test complex disruption scenarios, bedtime boundary defense, deadline vs priority weighting, and full rollback. | [P1], [P2] |

---

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-20 01:13
**Phase in progress:** Completed
**Status:** All 4 phases completed and verified (20/20 backend unit tests passing, frontend build 0 errors, Smart Default Adaptation Card, Collapsible Alternatives Accordion, Tomorrow Inbox Drawer, and 10-Second Atomic Undo Toast operational).

### Decisions made this session
- Implemented `AdaptationActionEntity`, `AdaptationActionRepository`, and `AdaptationService` for transactional before/after snapshotting and atomic 10s rollback (`POST /api/planner/adaptation/apply` and `POST /api/planner/adaptation/undo/{id}`).
- Redesigned AI Planner View in `AdaptiveApp.tsx` with a single **Smart Default Adaptation Card** featuring transparent *Why this adjustment?* bullet points and primary 1-click CTA `[ Apply this plan ]`.
- Built collapsible `▸ Xem các phương án thay thế khác` accordion allowing users to inspect and apply alternative trade-offs without initial visual clutter.
- Integrated `TomorrowInboxDrawer` at the top of `TodayView` for 1-click scheduling into Calm Openings.
- Implemented 10-second floating bottom undo toast with `[ ↩ Hoàn tác (Undo) ]` button and gentle 432Hz sine chime feedback.

---

## 3. Risks & Mitigations
- **Bedtime Invasion Risk:** Hard boundary gate enforces that no task can be scheduled into `PROTECTED` Sleep blocks (`23:00–07:00`) or within 30 minutes of bedtime.
- **Rollback Consistency Risk:** `AdaptationAction` stores full block payload snapshots (`beforeState` and `afterState`) in database to ensure 100% deterministic rollback.

