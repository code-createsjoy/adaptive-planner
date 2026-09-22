# Phase 4: Calendar & Timeline Integration, Cycle Highlights & Proactive AI Workload Adaptation Banner

## Context & Objectives
Integrate daily check-in indicators and period cycle prediction overlays into the calendar and timeline header, and present the proactive AI workload easing banner when low-energy or period check-ins are recorded.

## File Ownership
- [MODIFY] `src/components/adaptive/MonthCalendarView.tsx`
- [MODIFY] `src/components/adaptive/AdaptiveApp.tsx`
- [NEW] `src/components/adaptive/ProactiveWorkloadReliefBanner.tsx`
- [MODIFY] `src/features/insights/InsightsView.tsx`

## Detailed Implementation Steps
1. **Update `MonthCalendarView.tsx`:**
   - Fetch daily check-ins and cycle predictions for the current viewing month.
   - For each calendar day cell:
     - Render Mood Emoji badge next to date number or in an accessible corner with quick tooltip preview of notes.
     - Render Period Indicator:
       - **Confirmed Period Day:** Solid rose badge/indicator (`bg-rose-500 text-white` with 🩸 or flow symbol).
       - **Predicted Cycle Window:** Soft dashed/tinted background or badge (`border-rose-400/50 bg-rose-500/10 text-rose-500`) with indicator *"Dự kiến chu kỳ"*.
     - Allow clicking the check-in area/button on the cell to directly open `DailyCheckinPopover`.
2. **Update Timeline Header in `AdaptiveApp.tsx`:**
   - Add a quick Daily Check-in badge & button in the active day's timeline header displaying today's mood emoji & note, or a "+ Check-in ngày" prompt if not yet logged.
   - Clicking opens `DailyCheckinPopover` for the selected date.
3. **Build `ProactiveWorkloadReliefBanner.tsx`:**
   - Triggered upon saving check-in with `energyLevel <= 2` or `isPeriodDay == true` when heavy tasks are present.
   - Displays a warm, non-judgmental suggestion:
     - *"Thể trạng hôm nay đang ở mức cần nghỉ ngơi. AI gợi ý chuyển [X] task tiêu hao nhiều năng lượng sang ngày khác và thêm khoảng nghỉ."*
     - Contains button `[Xem & Áp dụng giảm tải]` (triggers scenario rescheduling / deferral) and `[Bỏ qua]`.
4. **Extend `InsightsView.tsx`:**
   - Display a Mood & Energy distribution breakdown widget.
   - Correlate period days with workload intensity to help users understand their personal rhythm.

## Verification
- Run full frontend build:
  ```bash
  npm run build
  ```
- End-to-end visual verification across Month Calendar, Day Timeline header, Checkin Popover, and Proactive Adaptation Banner.
