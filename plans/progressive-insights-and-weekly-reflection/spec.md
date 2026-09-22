# Spec: Progressive Insights & Weekly Reflection Engine

## 1. Context & Objectives
Traditional analytics dashboards suffer from two major flaws in neurodivergent-friendly applications:
1. **The Empty-State Block**: Blocking insights until 3–5 days of data are logged leaves users with a dead, discouraging screen on Mondays and Tuesdays.
2. **Judgmental Metrics & Dead-End Graphs**: Showing dropped percentages ("↓ 12%") without context or actionable next steps causes anxiety rather than support.

This feature transforms the **Insights** view into a **Progressive Insights & Reflection Engine**:
- **Progressive Tracking**: Immediately active from Day 1, displaying live progress (tasks completed, deep focus hours, morning/afternoon/evening rhythm).
- **Confidence-Graduated Phrasing**: Labels patterns as `🌱 Xu hướng ban đầu (Dựa trên N ngày)` for days 1–2, graduating to `✨ Mẫu hình định kỳ` on day 3+.
- **Two-Tier Layout**: Top section shows **This Week (Live Flow)**; Bottom section shows **Last Week (Reflection & Learning)**.
- **Actionable Product Loop**: Every pattern includes an explanation and an actionable 1-click button opening the **Adaptive Diff Preview** for schedule adjustments.

---

## 2. User Stories

### Story 1: Day 1+ Live Progressive Tracking (P1)
**As a** user opening Insights early in the week (e.g. Tuesday, Day 2),  
**I want** to see my live accumulated metrics, completion status, and daytime rhythm,  
**So that** I have immediate visibility into my current week without encountering a "Not enough data" roadblock.

### Story 2: Confidence-Aware Pattern Observation (P1)
**As a** user reviewing insights on early days,  
**I want** the observations to be framed with honest confidence tags (e.g. *"Early pattern: So far, mornings have fewer interruptions · Based on 2 days"*),  
**So that** Modo never pretends to know more than the available data supports.

### Story 3: Last Week Reflection & Retrospective Summary (P1)
**As a** user reflecting on my work rhythm,  
**I want** to see a retrospective card summarizing last week's completed tasks, key pattern, and learning,  
**So that** I can appreciate my efforts and understand my recurring rhythms without toxic productivity scoring.

### Story 4: Insight-to-Schedule Action with Diff Preview (P2)
**As a** user interested in a suggestion from last week's reflection,  
**I want** a 1-click button `[ Áp dụng mẫu hình này → Xem trước ]` that opens the side-by-side Adaptive Diff Preview,  
**So that** I can apply protective focus blocks or buffers directly into my upcoming timetable.

---

## 3. Data Models & API Specifications

### `GET /api/insights/progressive?weekStart=YYYY-MM-DD`

**Response Body (`ProgressiveInsightsDto`):**
```json
{
  "currentWeek": {
    "weekStart": "2026-09-21",
    "weekEnd": "2026-09-27",
    "dayIndex": 2,
    "totalDaysInWeek": 7,
    "completedTasks": 6,
    "scheduledTasks": 11,
    "completionRate": 54,
    "totalFocusMinutes": 220,
    "focusSessionsCount": 4,
    "daypartRhythm": {
      "morningFocusMinutes": 120,
      "afternoonFocusMinutes": 75,
      "eveningFocusMinutes": 25,
      "dominantPeriod": "MORNING"
    },
    "pattern": {
      "maturity": "EARLY",
      "tag": "🌱 Xu hướng ban đầu (Dựa trên 2 ngày)",
      "observation": "Cho đến nay, các phiên buổi sáng có xu hướng tập trung liền mạch và ít bị dời lịch nhất.",
      "evidenceDetail": "4 trong 6 ca làm việc buổi sáng được hoàn tất đúng giờ dự kiến."
    }
  },
  "lastWeek": {
    "weekStart": "2026-09-14",
    "weekEnd": "2026-09-20",
    "completedTasks": 18,
    "scheduledTasks": 22,
    "completionRate": 81,
    "totalFocusMinutes": 495,
    "dominantPattern": "Bạn hoàn thành các công việc phức tạp ổn định nhất trước 12:00 trưa.",
    "whyReason": "82% các ca làm việc trước 12h đạt trạng thái hoàn tất mà không cần dời lịch.",
    "suggestion": {
      "id": "protect-morning-focus",
      "title": "Bảo vệ 1 khung giờ tập trung buổi sáng tuần này",
      "description": "Đặt một khối Deep Work (09:00 - 10:30) vào các ngày làm việc để duy trì năng lượng cao nhất.",
      "actionLabel": "Xem trước lịch trình tuần tới"
    }
  }
}
```

---

## 4. Frontend Component Breakdown

1. **`src/features/insights/ProgressiveInsightsView.tsx`**:
   - Replaces the blocking empty state in `InsightsView.tsx`.
   - Header with week navigator and empathetic subtitle: *"Your patterns, not your performance"*.
2. **`src/features/insights/components/ThisWeekProgressCard.tsx`**:
   - Displays live metrics (Tasks completed, Focus hours, Session count).
   - Visual Daytime Rhythm Bar (`Morning` / `Afternoon` / `Evening` progress bars).
   - Confidence-graduated pattern badge (`🌱 Early pattern` vs `✨ Recurring pattern`).
3. **`src/features/insights/components/LastWeekReflectionCard.tsx`**:
   - Retrospective summary: Task completion ratio, Total focus duration.
   - Pattern noticed & "Why am I seeing this?" collapsible explanation.
   - Actionable proposal button `[ Áp dụng mẫu hình này → Xem trước ]`.

---

## 5. Acceptance Criteria & Success Verification
- Backend Unit Tests: `ProgressiveInsightsServiceTest` covering early-week (1-2 days) and full-week calculation.
- Frontend Typecheck & Build: `npm run build` passes with 0 errors.
- Viewing Insights on any day of the week immediately renders live progress without empty state blocks.
- Clicking the suggestion button triggers the schedule preview flow smoothly.
