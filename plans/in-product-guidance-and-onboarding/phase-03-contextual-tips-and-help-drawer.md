# Phase 3: Contextual First-Use Tips & In-Product Help Drawer

**Parent Plan:** [`plans/in-product-guidance-and-onboarding/plan.md`](file:///d:/6_OJT/adaptive-planner/plans/in-product-guidance-and-onboarding/plan.md)
**Status:** Not Started

---

## Objectives
1. Build `<FirstUseTip />` micro-guide component for deep feature introductions.
2. Insert contextual first-use tips into:
   - **Workload View**: *"How demanding is today? Modo looks at focus work, meetings, transitions, and available breaks."*
   - **Insights View**: *"Patterns, not grades. Modo looks for patterns that may help you plan future days."*
   - **Calm / Sensory Mode**: *"Calm Mode: Less motion and less visual noise."*
   - **Task Breakdown**: *"Too big to start? Modo can turn this into smaller steps."*
3. Build slide-over `<HelpDrawer />` with topic list, micro-walkthroughs, and quick tour replay.
4. Add `? Help` button to top-right navigation in `AdaptiveApp.tsx`.

---

## Detailed Steps

1. **Create `src/components/adaptive/guidance/FirstUseTip.tsx`**:
   - Compact banner with soft tint, icon, heading, single-sentence explanation, and `[Got it]` dismissal button.
   - Checks `useGuidanceStore.getState().seenTips[tipId]` before rendering.
   - When dismissed, calls `markTipSeen(tipId)`.

2. **Integrate `<FirstUseTip />` into Target Views**:
   - `TodayWorkloadCard.tsx` / Workload section: `tipId="workload"`
   - `WeeklyInsightsService` / Insights section: `tipId="insights"`
   - `SensoryModeSwitcher.tsx`: `tipId="sensoryMode"`

3. **Create `src/components/adaptive/guidance/HelpDrawer.tsx`**:
   - Slide-over drawer with smooth slide-in from right.
   - Contains:
     - Header: `Quick Help` with close button.
     - Section 1: `Guided Tours` with `[Replay Dashboard Tour]` and `[Reset all tips]`.
     - Section 2: Quick Topic Accordions / Micro-Guides:
       - 🎯 *What should I do now?* (Explains NOW card)
       - ⏭️ *What comes next?* (Explains NEXT buffer)
       - ➕ *How to add tasks* (Natural language examples: `mai 7h cafe 2h`)
       - ⚡ *How to use Focus Mode* (Timers, micro-breaks)
       - 💬 *How to ask Modo* (AI rebalancing and breakdown commands)
       - 📊 *Understanding Workload & Insights* (Patterns, not grades)
     - Clean, non-dense typography with quick action buttons.

4. **Add Navigation Trigger**:
   - Place a sleek `? Help` button in the top navigation bar of `AdaptiveApp.tsx` next to theme and sensory mode controls.

---

## Verification
- Test opening Help Drawer from top navigation.
- Verify dismissing first-use tips permanently marks them as seen.
- Verify clicking `Replay Dashboard Tour` from Help Drawer restarts the spotlight tour smoothly.
