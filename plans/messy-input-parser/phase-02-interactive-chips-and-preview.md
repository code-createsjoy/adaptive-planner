# Phase 2: Interactive Gap Filling Chips & Confirmation Preview

**Parent Plan:** [`plans/messy-input-parser/plan.md`](file:///d:/6_OJT/adaptive-planner/plans/messy-input-parser/plan.md)  
**Spec Story:** P1 (Interactive preview card with 1-click slot & duration chips)

---

## Scope & Changes

### 1. Frontend (`PlannerView` in `AdaptiveApp.tsx`)
- On `pendingActivity` card:
  - If `missingFields` includes `"DURATION"`:
    - Render duration chips: `[30 phút]`, `[45 phút]`, `[1 tiếng]`, `[1.5 tiếng]`, `[2 tiếng]`.
    - Clicking updates `pendingActivity.endTime` instantly (e.g. `startTime + 60m`) and marks duration resolved.
  - If `missingFields` includes `"TIME"`:
    - Render timeframe slot chips:
      - Sáng: `[08:00]`, `[09:30]`, `[10:30]`
      - Chiều: `[14:00]`, `[15:30]`, `[17:00]`
      - Tối: `[19:00]`, `[20:00]`, `[21:00]`
    - Clicking a slot chip populates `startTime` & `endTime` dynamically.
  - Render confirmation CTA:
    - Prominent `[Confirm & Add to Timetable]` (also mapped to `Enter` keystroke for fast power-user flow).
    - `[Cancel]` button.
