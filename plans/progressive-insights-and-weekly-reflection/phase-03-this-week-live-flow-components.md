# Phase 3: "This Week" Live Flow & Daytime Rhythm Bar Components

## Context & Objectives
Implement the top half of the Progressive Insights page — **Tuần này (This Week — Live Flow)**. It displays real-time pacing without blocking empty states, renders the Daytime Rhythm Bar (Morning/Afternoon/Evening focus), and displays the confidence-graduated observation badge.

## File Ownership
- [NEW] `adaptive-planner-frontend/src/features/insights/components/ThisWeekProgressCard.tsx`
- [NEW] `adaptive-planner-frontend/src/features/insights/components/DaytimeRhythmBar.tsx`
- [NEW] `adaptive-planner-frontend/src/features/insights/components/ConfidencePatternBadge.tsx`
- [MODIFY] `adaptive-planner-frontend/src/features/insights/InsightsView.tsx`

## Detailed Implementation Steps

1. **Build `DaytimeRhythmBar.tsx`:**
   - Visual segmented horizontal bar representing:
     - Morning Focus (🌅 Sáng: 06:00 - 12:00) — gentle amber/gold tone
     - Afternoon Focus (☀️ Chiều: 12:00 - 18:00) — calm azure/blue tone
     - Evening Focus (🌙 Tối: 18:00 - 24:00) — deep indigo/violet tone
   - Proportional widths calculated from minutes with tooltip displaying exact focus hours/minutes.
   - Shows a subtle tag for the dominant period (e.g. `✨ Năng lượng tập trung cao nhất vào Buổi Sáng`).

2. **Build `ConfidencePatternBadge.tsx`:**
   - Renders pattern maturity status:
     - `EARLY` (Days 1–2): `🌱 Xu hướng ban đầu (Dựa trên N ngày)` with soft sage green outline and tooltip explaining Modo is observing without jumping to conclusions.
     - `CONFIRMED` (Days 3+): `✨ Mẫu hình định kỳ` with calm purple/teal badge.
   - Includes collapsible "Chi tiết bằng chứng" (Evidence breakdown) showing source completed blocks.

3. **Build `ThisWeekProgressCard.tsx`:**
   - Header with week date range (`Tuần này · 21/09 - 27/09`) and current day tracker (`Ngày 2 / 7 · Thứ Ba`).
   - 3 key metric chips:
     - 🎯 **Hoàn tất:** `6 / 11 tasks` (`54%`)
     - ⏱️ **Thời gian tập trung:** `3h 40m` across `4 phiên`
     - 🌅 **Nhịp điệu trong ngày:** dominant period indicator
   - Embeds `DaytimeRhythmBar` and `ConfidencePatternBadge`.
   - Empathetic note: *"Tiến độ tự nhiên theo nhịp sống của bạn, không phải áp lực hiệu suất."*

4. **Update `InsightsView.tsx`:**
   - Remove the blocking "Cần thêm ít nhất 3 ngày để nhận diện mẫu hình" empty state.
   - Render `ThisWeekProgressCard` at the top of the view.

## Verification
- Run build check:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend
  npm run build
  ```
