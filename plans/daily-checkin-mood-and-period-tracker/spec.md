# Spec: Daily Mood, Note & Period Cycle Tracker with Proactive AI Workload Adaptation

**Date:** 2026-09-21
**Status:** Ready

---

## Problem Statement
Users (especially neurodivergent individuals, students, and professionals managing physical/mental fluctuations or menstrual cycles) often experience mismatched workloads against their daily physical and emotional capacity. Currently, there is no direct way in the planner to record mood emojis, daily reflections, and menstrual cycles directly on calendar days, nor does the AI Planner proactively adapt daily task intensity to prevent burnout on low-energy or period days.

---

## User Stories

<!-- P1 = MVP (must ship), P2 = nice-to-have, P3 = future/out-of-scope -->

- **[P1]** As a user, I want to click any day cell on the Calendar or Timeline header to open a quick check-in popover where I can select a mood emoji, enter a short note, and toggle period status (with optional flow intensity) so that I can track my daily state with minimal friction.
  - Accepted when: Clicking a day opens `DailyCheckinPopover`, saving sends data to backend API, and the calendar cell immediately displays the mood emoji, note preview tooltip/indicator, and period marker.

- **[P1]** As a user tracking my menstrual cycle, I want the calendar to display both logged period days (solid indicator) and predicted future period days (soft/dashed indicator based on ~28-day historical cycle intervals) so that I can anticipate upcoming cycle windows when planning tasks.
  - Accepted when: Calendar fetches active check-ins and predicted cycle intervals, rendering distinct visual states for confirmed vs. predicted cycle days.

- **[P1]** As a user who logs a low-energy mood (e.g. 🥱 Mệt mỏi, 😣 Kiệt sức) or active period day (🩸), I want the system to proactively display an adaptive workload relief prompt ("Hôm nay thể trạng thấp, bạn có muốn AI đề xuất dời các task nặng sang ngày khác?") so that I can adapt my day's schedule with a single click.
  - Accepted when: Saving a low-energy or heavy period check-in triggers an actionable suggestion card with "1-Click Apply" to reschedule intense focus blocks or insert buffer breaks.

- **[P2]** As a user, I want to edit or delete my daily check-in at any time, and have the calendar and AI recommendations update immediately.
  - Accepted when: Re-opening the popover loads existing entries with delete/update options that refresh the UI state seamlessly.

- **[P2]** As a user, I want to view mood and cycle trends in Weekly Insights so that I can see the correlation between my energy/cycle patterns and task completion rates over time.
  - Accepted when: Insights screen includes a visual summary card for mood distribution and period phase correlation with completed task blocks.

- **[P3]** _(out of scope — noted for future)_
  - Granular physical symptom tracking (headache, cramps, body temp, medication logs).
  - Multi-user cycle sharing or complex fertility/ovulation medical algorithms.

---

## Functional Requirements

1. **FR-01 (Backend Daily Check-in Entity & REST API):**
   - Model `DailyCheckin` with fields: `id`, `userId`, `checkinDate` (`LocalDate`), `moodEmoji` (`String`), `moodLabel` (`String`), `energyLevel` (`INTEGER 1-5`), `note` (`TEXT`), `isPeriodDay` (`BOOLEAN`), `flowIntensity` (`LIGHT`, `MEDIUM`, `HEAVY`, `SPOTTING`, `NONE`), `createdAt`, `updatedAt`.
   - Endpoints:
     - `GET /api/daily-checkins?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`: Retrieve check-ins in range.
     - `POST /api/daily-checkins`: Create or update check-in for a given date.
     - `DELETE /api/daily-checkins/{id}` or by date: Remove check-in entry.
     - `GET /api/daily-checkins/cycle-prediction`: Calculate and return next predicted cycle dates (start date, end date, confidence score).

2. **FR-02 (Cycle Prediction Calculation Engine):**
   - Calculate user's average cycle length based on consecutive period onset dates (fallback to default 28 days if < 2 cycles logged).
   - Project estimated period ranges for the next 2-3 cycles.

3. **FR-03 (Calendar & Timeline UI Integration):**
   - Add mood emoji badge and period indicator dot/band onto `MonthCalendarView` cells and daily/weekly Timeline headers.
   - Click handler on calendar cell / day header opens `DailyCheckinPopover` with:
     - Curated quick mood selector (😄 Vui vẻ, 😊 Ổn, 🥱 Mệt mỏi, 😣 Kiệt sức, 🧘 Bình yên, 🔥 Năng lượng cao, v.v.).
     - Energy slider (1 to 5).
     - Text area for daily reflection / notes.
     - Period toggle switch with flow selector (🩸 Nhẹ / Vừa / Nhiều / Đốm).
     - Save and Clear buttons.

4. **FR-04 (Proactive AI Workload Adaptation Trigger):**
   - On saving a check-in with `energyLevel <= 2` or `isPeriodDay == true`:
     - System evaluates the user's scheduled `TimeBlocks` for that date.
     - If deep-work or high-effort tasks exist, display proactive banner: *"Hôm nay bạn đang mệt mỏi / trong kỳ chu kỳ. AI gợi ý dời [X] task nặng sang ngày mai và dành thời gian nghỉ ngơi."*
     - Provides `[Xem gợi ý & Áp dụng]` button that generates and applies the non-destructive schedule adjustment.

---

## Non-Functional Requirements

- **Performance:** Check-in save and calendar metadata retrieval p95 latency < 150ms.
- **Privacy & Security:** Health and mood entries are private to the authenticated user and encrypted at rest; never exposed in shared or public views.
- **UX & Responsiveness:** Instant optimistic UI updates on calendar cells upon check-in save without full page reload.
- **Accessibility:** Color-blind safe period indicators (icon + color badge) and full keyboard navigation support for popovers.

---

## Success Criteria

- [ ] Users can log mood, note, and period on any calendar day in under 3 clicks / 5 seconds.
- [ ] Logged mood emojis, note badges, and period indicators render accurately across Month Calendar and Timeline headers.
- [ ] Predicted cycle dates for the next month display distinct soft-tint indicators with ≥ 95% algorithm consistency on regular logs.
- [ ] Low-energy check-ins reliably trigger the proactive AI workload adaptation prompt with 1-click schedule easing.

---

## Out of Scope

- Detailed medical symptom trackers, prescription medication tracking, or ovulation/fertility diagnostic tooling.
- Mandatory check-in popups that block user workflow.

---

## Assumptions

- Users enter period start days accurately for cycle predictions to remain meaningful; fallback defaults gracefully to 28 days when historical data is sparse.
- Task items have priority or intensity attributes (or can be identified by duration/tag) to identify candidate tasks for workload relief.

---

## [NEEDS CLARIFICATION]

_(None. All user requirements and behavioral choices are clarified.)_
