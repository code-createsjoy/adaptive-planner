# Implementation Plan: Monthly Calendar, Weekly Routine Engine & Vietnamese Public Holidays

**Date:** 2026-09-19  
**Mode:** --hard  
**Risk:** normal — Schema additions (`WeeklyRoutineEntity`), `TimeBlockEntity` date-scoping enhancements, and clean mock data purge. Zero breaking changes to existing Groq AI prompts.  
**Spec Reference:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/monthly-calendar-weekly-routine/spec.md)  
**Brainstorm Reference:** [260919-monthly-calendar-weekly-routine-brainstorm.md](file:///d:/6_OJT/adaptive-planner/plans/reports/260919-monthly-calendar-weekly-routine-brainstorm.md)

---

## Architecture Principle
> **"Routine $\rightarrow$ Reality $\rightarrow$ Adaptation: WeeklyRoutine is the baseline template, TimeBlock on a specific date is reality, and Day Override / Holiday Pause is adaptation. The system informs, the user decides."**

---

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-19 22:36  
**Phase in progress:** Ready to Cook  
**Status:** Plan generated and awaiting execution.

---

## Phased Implementation Roadmap

| Phase | Title | Focus & Core Deliverables | Spec Stories Covered |
| :--- | :--- | :--- | :--- |
| **[x] Phase 01** | Backend Routine & Holiday Engine | Purge initial mock seeds. Create `WeeklyRoutineEntity`, CRUD repository & service. Enhance `TimeBlockEntity` with `date`, `sourceType`, `sourceRoutineId`, `overrideType`. Implement Vietnamese `HolidayService` (Solar & Lunar statutory holidays) & date-range query endpoints. | P1: Mock Purge, Weekly Routine Entity, Holiday Engine, Date Overrides |
| **[x] Phase 02** | Frontend Monthly Calendar View | Create `MonthCalendarView.tsx` with minimalist navigation, month switcher, workload density dots (`●`), national holiday badges (🇻🇳), and seamless date selection syncing with the Visual Timeline. | P1: Monthly Calendar Navigation & Holiday Badges |
| **[x] Phase 03** | Weekly Routine Drawer & Holiday Adaptation Actions | Build `WeeklyRoutineModal.tsx` for easy Mon–Sun routine setup. Implement Vietnamese holiday banner on Day Timeline with 1-click `[Pause today's routine]` and single-day override management without corrupting baseline routines. | P1 & P2: Routine Drawer, Holiday Pause Actions, Single-day Overrides |

---

## Detailed Phase Breakdown

* [Phase 01: Backend Routine & Holiday Engine](file:///d:/6_OJT/adaptive-planner/plans/monthly-calendar-weekly-routine/phase-01-backend-routine-holiday-date-apis.md)
* [Phase 02: Frontend Monthly Calendar View](file:///d:/6_OJT/adaptive-planner/plans/monthly-calendar-weekly-routine/phase-02-frontend-month-calendar-and-holidays.md)
* [Phase 03: Weekly Routine Drawer & Holiday Adaptation Actions](file:///d:/6_OJT/adaptive-planner/plans/monthly-calendar-weekly-routine/phase-03-weekly-routine-modal-and-override-actions.md)

---

## Verification & Safeguards
1. **Mock Data Cleanliness:** No mock timeblocks will be re-seeded on backend reboot; user routines and custom date entries form the sole ground truth.
2. **Cognitive Ergonomics:** Calendar cells stay uncluttered (date number + workload dots + holiday icon); all fine-grained task interactions remain in the Visual Timeline.
3. **Template Immutability:** Editing or cancelling a task on a single date generates a date-scoped override record and never mutates the underlying `WeeklyRoutine`.
