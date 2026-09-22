# Phase 3: Right Sidebar "Today's Workload" Card & Demanding Day Banner

## Context & Objectives
Build the two-tier visual presentation: a compact, non-judgmental `TodayWorkloadCard` in the right sidebar (always available) and a gentle `DemandingDayBanner` (only on heavy/demanding days).

## File Ownership
- [NEW] `src/components/adaptive/TodayWorkloadCard.tsx`
- [NEW] `src/components/adaptive/DemandingDayBanner.tsx`
- [MODIFY] `src/components/adaptive/AdaptiveApp.tsx`

## Detailed Implementation Steps
1. **Build `TodayWorkloadCard.tsx`:**
   - **Header**: Title "Today's Workload" + Badge (`Light` [emerald] | `Moderate` [amber] | `Heavy` [rose/indigo]).
   - **Summary text**: Empathetic sentence (e.g. *"Your afternoon has several demanding blocks with little recovery time"*).
   - **Metric Badges**: 🧠 Focus blocks, 📅 Meetings, ⏱ Buffer time.
   - **Collapsible "Why?" section**: Expands to show bullet points (e.g. `• 4h 20m high-focus work`, `• 3 context switches`, `• 2 back-to-back meetings`).
   - **Discrete Score**: `Load estimate: 78/100` displayed unobtrusively at bottom-left.
   - **Action Button**: `[ Review Schedule → ]` triggering the Quick Rebalance Modal.
2. **Build `DemandingDayBanner.tsx`:**
   - Positioned above the timeline when `assessment.level === 'HEAVY'`.
   - Message: *"Today looks unusually demanding. Modo found a few ways to create more breathing room."*
   - Action: `[ Review ]` button.
3. **Mount in `AdaptiveApp.tsx`:**
   - Place `TodayWorkloadCard` in the right sidebar column of `TodayView`.
   - Place `DemandingDayBanner` right above `DateNavigator` when workload is heavy.

## Verification
- Test with varied schedules and verify responsive layout on desktop & mobile:
  ```bash
  npm run build
  ```
