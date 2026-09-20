# Spec: Monthly Calendar Navigation, Weekly Routine Engine & Vietnamese Public Holidays

**Date:** 2026-09-19  
**Status:** Ready  
**Brainstorm Reference:** [260919-monthly-calendar-weekly-routine-brainstorm.md](file:///d:/6_OJT/adaptive-planner/plans/reports/260919-monthly-calendar-weekly-routine-brainstorm.md)

---

## Problem Statement
Users need a practical way to manage their timetable across the entire month without the chore of manually rebuilding their schedule every day. The application must support recurring weekly routines, single-day overrides, clean monthly calendar navigation, and context-aware Vietnamese national holiday cues while preserving user agency and low cognitive load.

---

## User Stories

<!-- P1 = MVP (must ship), P2 = nice-to-have, P3 = future/out-of-scope -->

- **[P1]** As a neurodivergent user, I want to define my default Weekly Routine (e.g. Mon–Fri Work 08:00–17:00, Tue/Thu Gym 17:30–18:30) once so that my monthly schedule is automatically structured without daily setup fatigue.  
  *Accepted when:* Weekly routine items can be created, updated, toggled, and automatically projected onto any date in the calendar matching those days of the week.

- **[P1]** As a user, I want to wipe all initial mock timetable data so that my database only contains my actual routines and real-world schedule.  
  *Accepted when:* Database is purged of mock seed blocks and ready for clean user entry.

- **[P1]** As a user, I want a clean Monthly Calendar View to navigate between days in any month and see workload density dots and Vietnamese holiday badges.  
  *Accepted when:* Calendar renders a full month grid, highlights Today, displays dots (`●`) indicating scheduled items, shows Vietnamese public holidays (e.g., 🇻🇳 02/09, 30/04, 01/05, Tết), and clicking any day switches to that day's Visual Timeline.

- **[P1]** As a user, I want to modify or cancel a specific task on a single date (e.g. "Cancel Gym on Oct 15" or "Add 14:00 Meeting on Oct 15") without mutating my weekly baseline template.  
  *Accepted when:* Edits to date `YYYY-MM-DD` persist as overrides (`overrideType = MODIFIED | CANCELLED | NONE`, `sourceType = ROUTINE | CUSTOM | AI_ADDED`), leaving other weeks untouched.

- **[P1]** As a user, when a date is a Vietnamese public holiday, I want the app to notify me with options (`[Keep schedule]`, `[Pause today's routine]`, `[Customize today]`) rather than silently deleting my work.  
  *Accepted when:* Holiday banner is displayed on that date's timeline; clicking "Pause routine" sets all routine items for that date to `PAUSED/CANCELLED` with one click.

- **[P2]** As a user, I want quick-add recurring tasks (e.g., "Add running on Mon, Wed, Fri at 18:00 for this month") directly from the calendar or natural language prompt.  
  *Accepted when:* AI or Quick Add dialog can append new weekly routine rules or multi-date blocks.

- **[P3]** _(Out of scope)_ Google Calendar / Apple Calendar 2-way sync, export to `.ics` files.

---

## Functional Requirements

1. **FR-01 (Data Model & Schema):**
   - Backend `WeeklyRoutine` entity: `id`, `dayOfWeek` (MONDAY..SUNDAY), `startTime`, `endTime`, `title`, `category`, `energyLevel`, `enabled`.
   - Backend `TimeBlock` entity updated: `date` (`LocalDate` YYYY-MM-DD), `sourceType` (`ROUTINE`, `CUSTOM`, `AI_ADDED`, `AI_RESCHEDULED`), `sourceRoutineId`, `overrideType` (`NONE`, `MODIFIED`, `CANCELLED`).
2. **FR-02 (Database Migration & Mock Purge):**
   - Clean out legacy mock seed blocks from startup runner; initialize empty timetable with standard default routine template (optional starter or empty).
3. **FR-03 (Vietnamese Public Holidays Service):**
   - Built-in utility detecting national holidays:
     - Dương lịch: Tết Dương Lịch (01/01), Giỗ Tổ Hùng Vương (10/03 Âm lịch), 30/04 (Giải phóng), 01/05 (Quốc tế Lao động), 02/09 (Quốc khánh).
     - Âm lịch: Tết Nguyên Đán (29/30 tháng Chạp đến mùng 3-5 tháng Giêng).
4. **FR-04 (Monthly Calendar Component):**
   - Month view with Month/Year picker, Previous/Next navigation, Day-of-week headers (Mon $\rightarrow$ Sun).
   - Each cell displays: Day number, Holiday badge (🇻🇳), Workload indicator dot count.
   - Click cell $\rightarrow$ Select date and view/edit that day's detailed timeline.
5. **FR-05 (Weekly Routine Manager UI):**
   - Dedicated Routine Drawer/Modal to configure recurring schedule for each day of the week (Thứ 2 đến Chủ Nhật).
6. **FR-06 (Single-day Override & Holiday Adaptation Actions):**
   - Ability to cancel or alter a routine block on a specific date.
   - Holiday banner prompt with 1-click `[Pause today's routine]` action.

---

## Non-Functional Requirements

- **Cognitive Load:** Calendar cells must stay minimal (no walls of text); details stay in the Visual Timeline.
- **Performance:** Month queries and routine projection must compute in $< 50\text{ms}$ on client or server.
- **Data Integrity:** Routine baseline must remain immutable when editing single-day instances.

---

## Success Criteria

- [ ] All mock timetable data purged from PostgreSQL backend.
- [ ] Users can create & edit Weekly Routines that project across all weeks of any month.
- [ ] Users can navigate through months and pick any date to inspect and edit.
- [ ] Single-day changes do not alter the baseline template on other weeks.
- [ ] Vietnamese public holidays display holiday badges and interactive routine pause prompts.

---

## Out of Scope
- External calendar synchronization (Google Calendar / Outlook API).
- Complex lunar astrological calculations beyond standard statutory Vietnamese holidays.

---

## Assumptions
- The application runs in client local timezone (Asia/Ho_Chi_Minh or user's system timezone).
- Dates are formatted as ISO-8601 (`YYYY-MM-DD`).
