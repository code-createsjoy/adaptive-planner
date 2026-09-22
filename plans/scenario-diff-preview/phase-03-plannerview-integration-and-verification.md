# Phase 3: PlannerView Integration & Verification

**Goal:** Integrate `ScenarioDiffPreviewCard` into `PlannerView` in `AdaptiveApp.tsx` and verify seamless end-to-end user experience.

---

## Technical Details

### File: `src/components/adaptive/AdaptiveApp.tsx`

1. **State Management in `PlannerView`:**
   - Add `selectedPreviewScenarioIndex` state (defaulting to 0 / recommended scenario).
   - When the user clicks an alternative scenario card, set `selectedPreviewScenarioIndex = idx`.

2. **Layout Adjustment:**
   - In desktop mode, arrange the proposed placement & scenarios into a 2-column or split layout when scenarios exist:
     - **Left / Adjacent Column:** `<ScenarioDiffPreviewCard ... />`
     - **Right Column:** Proposed Placement + Scenarios Selection Cards (Smart Default, Cascade Shift, Compress).
   - On compact screens, render the preview card inline right below the active scenario with smooth transition.

3. **Callback Wiring:**
   - `onApplyScenario` triggers seamless database update, toast feedback, and view refresh.

---

## Verification
- Run `npm run build` to verify 0 compile errors.
- Test interactive scenario switching and applying in browser.
