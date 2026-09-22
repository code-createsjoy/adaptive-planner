# Plan: Progressive Insights & Weekly Reflection Engine

**Date:** 2026-09-22
**Mode:** --hard
**Risk:** normal — Multi-file backend progressive calculation service, REST API endpoints, and redesigned two-tier Insights view.
**Spec:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/progressive-insights-and-weekly-reflection/spec.md)

---

## Executive Summary
This feature transforms Modo's **Insights** view into a **Progressive Insights & Weekly Reflection Engine** adhering to the philosophy *"Your patterns, not your performance"*:
1. **No More Blocking Empty States**: On Day 1 or Day 2 of the week, the page is immediately active with live progressive metrics (tasks completed, deep focus duration, daytime rhythm).
2. **Confidence-Graduated Phrasing**: Clearly tags initial observations as `🌱 Xu hướng ban đầu (Early pattern · Dựa trên 2 ngày)` for days 1–2, graduating to `✨ Mẫu hình định kỳ` once 3+ days of evidence accumulate.
3. **Two-Tier Layout on One Screen**:
   - **Top Half**: **Tuần này (This Week — Live Flow)** displaying real-time pacing and daypart rhythm bars (Morning / Afternoon / Evening).
   - **Bottom Half**: **Tuần trước (Last Week — Reflection & Learning)** highlighting retrospective insights with a 1-click `[ Áp dụng mẫu hình này → Xem trước ]` button opening the Adaptive Diff Preview.

---

## Phases

### [Phase 1: Backend Progressive & Retrospective Insights Calculation Service](file:///d:/6_OJT/adaptive-planner/plans/progressive-insights-and-weekly-reflection/phase-01-backend-progressive-insights-service.md)
- Define DTOs: `ProgressiveInsightsDto`, `CurrentWeekProgressDto`, `LastWeekReflectionDto`, `DaypartRhythmDto`, `PatternObservationDto`.
- Implement `ProgressiveInsightsService` that calculates both the current week's accumulated live metrics (with `EARLY` vs `CONFIRMED` data maturity) and the previous week's archived reflection.
- Expose REST endpoint `GET /api/insights/progressive?weekStart=YYYY-MM-DD` in `InsightsController`.
- Write unit and WebMvc tests (`ProgressiveInsightsServiceTest`, `InsightsControllerTest`).

### [Phase 2: Frontend Data Types, API Clients & React Query Hooks](file:///d:/6_OJT/adaptive-planner/plans/progressive-insights-and-weekly-reflection/phase-02-frontend-types-and-hooks.md)
- Define TypeScript types in `src/types/planner.ts` and `src/features/insights/types.ts`.
- Implement API method `api.getProgressiveInsights(weekStart)` in `src/lib/api.ts`.
- Create React Query hook `useProgressiveInsights(weekStart)` in `src/features/insights/hooks.ts`.

### [Phase 3: "This Week" Live Flow & Daytime Rhythm Bar Components](file:///d:/6_OJT/adaptive-planner/plans/progressive-insights-and-weekly-reflection/phase-03-this-week-live-flow-components.md)
- Build `ThisWeekProgressCard.tsx` displaying live metrics (tasks resolved, deep focus hours, sessions count).
- Build `DaytimeRhythmBar.tsx` rendering proportional visual bars for Morning, Afternoon, and Evening focus.
- Display confidence-aware pattern observation tag (`🌱 Xu hướng ban đầu (Dựa trên N ngày)` vs `✨ Mẫu hình định kỳ`).
- Remove the 3-day blocking empty screen.

### [Phase 4: "Last Week" Reflection Card & 1-Click Diff Preview Integration](file:///d:/6_OJT/adaptive-planner/plans/progressive-insights-and-weekly-reflection/phase-04-last-week-reflection-and-diff-preview.md)
- Build `LastWeekReflectionCard.tsx` summarizing completed tasks, focus duration, and key pattern noticed.
- Add `[ Áp dụng mẫu hình này → Xem trước ]` action button linking directly to the schedule diff preview.
- Integrate both cards into `InsightsView.tsx`.

---

## Verification Plan

### Automated Tests
- Backend Unit & Controller Tests:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-backend
  mvn test "-Dtest=ProgressiveInsightsServiceTest,InsightsControllerTest"
  ```
- Frontend Typecheck & Build:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend
  npm run build
  ```

### Manual Verification
1. **Early Week View (Day 1-2)**: Open Insights on Monday or Tuesday, verify live metrics and `🌱 Early pattern` tag are shown instead of the blocking empty state.
2. **Daytime Rhythm Bar**: Verify morning, afternoon, and evening proportional distribution bars render accurately.
3. **Last Week Reflection**: Verify the retrospective card displays last week's summary and pattern explanation.
4. **Actionable Diff Preview**: Click `[ Áp dụng mẫu hình này → Xem trước ]` and verify the schedule diff preview modal opens with proposed adjustments.
