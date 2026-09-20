# Plan: Schedule Preview Panel

**Mode:** hard
**Risk:** normal — pure frontend UI addition (new sub-component + AdaptivePanel refactor); no backend, no schema changes, fully reversible.
**Spec:** plans/schedule-preview-panel/spec.md
**Date:** 2026-09-20

---

## Overview

Refactor AdaptivePanel (inside AdaptiveApp.tsx) from a single-column list of scenario options with a shared Apply button, into a **split-panel layout**: scenario option cards on the left, and a persistent **SchedulePreviewPanel** on the right that swaps content when the user clicks an option.

All diff computation is pure client-side. No new API calls. No backend changes.

---

## Architecture Decision

### Data flow
- currentBlocks (before state) already flows into TodayView from AdaptiveApp.
- scenarios[i].blocks (after state) is already in ScenarioOption.
- A new computeDiff(before, after) utility produces BlockDiffItem[] — the set of changed blocks plus ≤2 unchanged anchor blocks with change metadata.
- SchedulePreviewPanel receives diff + scenario as props and renders the preview.

### Component hierarchy change
`
AdaptivePanel (refactored)
├── [left 40%] OptionList
│     └── OptionCard × N  (click → setSelectedPreviewIndex)
└── [right 60%] SchedulePreviewPanel
      ├── empty state (no option selected)
      ├── header: "Previewing Option B"
      ├── BlockDiffList (affected blocks only + 2 anchors)
      │     └── BlockDiffRow: before → after + reason bullets
      ├── FullDayToggle (chevron expand)
      └── Apply button (calls onAdapt)
`

### No new files
All new code lives within AdaptiveApp.tsx to keep the bundle footprint small (the file is already large but self-contained). New sub-functions: computeDiff, SchedulePreviewPanel, BlockDiffRow.

### Type extension (additive only)
Add currentBlocks?: TimeBlock[] prop to AdaptivePanel. No other type changes.

---

## Phase 01 — computeDiff utility + type scaffold

**Goal:** Pure function that produces BlockDiffItem[] from before/after block arrays.

### Files changed
- daptive-planner-frontend/src/components/adaptive/AdaptiveApp.tsx

### Changes
1. Define BlockChangeType = 'protected' | 'moved' | 'deferred' | 'new' | 'anchor'.
2. Define BlockDiffItem interface:
   `	s
   interface BlockDiffItem {
     before?: TimeBlock;   // undefined for new urgent blocks
     after?: TimeBlock;    // undefined for deferred-to-inbox blocks
     changeType: BlockChangeType;
     reasons: string[];    // 1–3 bullets
   }
   `
3. Implement computeDiff(before: TimeBlock[], after: TimeBlock[]): BlockDiffItem[]:
   - Match blocks by id (prefer) or 	itle (fallback for synthetic IDs).
   - Classify each as: protected (same time slot, no move), moved (time changed), deferred (present in before, absent or status=DEFERRED in after), 
ew (absent in before, present in after).
   - Generate reason bullets from block metadata: priority, deadline, energyLevel, isMovable.
   - Add up to 2 nchor (unchanged adjacent) blocks for context.
   - Return sorted by before.startTime.

### Acceptance
- Unit-testable pure function (no component dependency).
- computeDiff(sameBlocks, sameBlocks) returns empty array (no false positives).
- computeDiff(before, scenarioBlocks) correctly identifies moved/deferred blocks.

---

## Phase 02 — SchedulePreviewPanel component

**Goal:** New React sub-component that renders the right-side preview panel.

### Files changed
- daptive-planner-frontend/src/components/adaptive/AdaptiveApp.tsx

### Changes
1. BlockDiffRow — renders one BlockDiffItem:
   - Badge: 🛡️ Protected (green) | → Moved (amber) | 📤 Deferred (orange) | ⚡ New (red/urgent).
   - Time: efore.startTime–before.endTime → after.startTime–after.endTime (or → Tomorrow Inbox).
   - Title.
   - Reason bullets (collapsible if > 2).

2. SchedulePreviewPanel — the right panel:
   - Empty state: centered text + subtle dashed border, no Apply button.
   - Header: Previewing · {scenario.title} with option tag badge.
   - Diff list: BlockDiffRow for each diff item.
   - "N blocks affected" counter.
   - FullDayToggle: <ChevronDown> View full day accordion — shows full fter block list sorted by time.
   - Apply button: primary, full-width, disabled when selectedIndex === -1.
   - Dismiss button: outline variant.

### Acceptance
- Empty state renders correctly when no option is selected (selectedPreviewIndex === -1).
- Clicking Apply calls onAdapt().
- "View full day" toggle expands/collapses full block list.
- Panel max-height max-h-[70vh] with overflow-y-auto.

---

## Phase 03 — AdaptivePanel refactor (split layout)

**Goal:** Refactor existing AdaptivePanel to use the new split-panel layout.

### Files changed
- daptive-planner-frontend/src/components/adaptive/AdaptiveApp.tsx

### Changes
1. Add currentBlocks?: TimeBlock[] prop to AdaptivePanel.
2. Add local state selectedPreviewIndex: number (default -1) inside AdaptivePanel.
   - Reset to -1 whenever props.disruption changes to 'impact'.
3. Remove the existing Apply/Dismiss button row from the bottom of AdaptivePanel.
4. Replace single-column <div className="mt-4 space-y-2"> with:
   `jsx
   <div className="mt-4 grid grid-cols-1 sm:grid-cols-[2fr_3fr] gap-4">
     <div className="space-y-2"> {/* option list, 40% */}
       {scenarios.map((s, i) => <OptionCard ... onClick={() => setSelectedPreviewIndex(i)} />)}
     </div>
     <SchedulePreviewPanel
       scenario={scenarios[selectedPreviewIndex]}
       diff={computeDiff(currentBlocks, scenarios[selectedPreviewIndex]?.blocks ?? [])}
       onAdapt={props.onAdapt}
       onReset={props.onReset}
     />
   </div>
   `
5. Keep props.onSelectOption in sync: when selectedPreviewIndex changes, call props.onSelectOption(selectedPreviewIndex).
6. Pass currentBlocks from TodayView → AdaptivePanel (add currentBlocks prop to TodayView too).

### Acceptance
- On desktop (≥640px): two-column layout renders correctly.
- On mobile (<640px): single-column stacked (grid-cols-1), preview panel appears below options.
- Clicking Option A → preview shows Option A's diff. Clicking Option B → panel swaps to Option B (no animation needed for MVP).
- Apply button in preview panel calls onAdapt().
- "Why am I seeing these options?" accordion retained below option list.

---

## Phase 04 — Wire currentBlocks + hover highlight (P2 optional)

**Goal:** Pass currentBlocks from AdaptiveApp → TodayView → AdaptivePanel. Implement P2 hover highlight on TodayView blocks (optional for hackathon demo).

### Files changed
- daptive-planner-frontend/src/components/adaptive/AdaptiveApp.tsx

### Changes
1. TodayView already receives locks prop (	imeBlocks). Pass it to AdaptivePanel as currentBlocks={props.blocks}.
2. Add currentBlocks to TodayView props interface and thread it to AdaptivePanel call-site.
3. **[P2 hover]**: Add hoveredScenarioIndex: number | null state in TodayView. Pass down to AdaptivePanel's onHoverOption callback. In EnhancedTimelineCard, accept optional highlightVariant?: 'moved' | 'deferred' | null' prop to add a subtle amber border/badge overlay.
   - Skip this if time-constrained for hackathon.

### Acceptance
- AdaptivePanel receives non-empty currentBlocks when disruption is triggered.
- computeDiff produces correct diff with real block data.
- **(P2)** Hovering an option card highlights affected blocks in the timeline with a subtle badge.

---

## Feature List Updates

New entries to add to eature_list.json:
- schedule-preview-panel-split-layout (P1)
- schedule-preview-block-diff-reasons (P1)
- schedule-preview-apply-in-panel (P1)
- schedule-preview-mobile-stacked (P1)
- schedule-preview-full-day-toggle (P2)
- schedule-preview-hover-highlight (P2)

---

## Risks

- **AdaptiveApp.tsx file size**: Already 2705 lines. Adding ~200 lines of new components is manageable but should be considered as a refactoring opportunity post-hackathon (extract to separate files).
- **computeDiff correctness**: Matching blocks by title as fallback can produce false positives if two blocks have the same title. Mitigate by preferring id match and falling back to title+startTime compound key.
- **selectedPreviewIndex vs selectedOption drift**: Two separate indices now exist (selectedPreviewIndex inside AdaptivePanel local state, props.selectedOption from parent). Must keep in sync via onSelectOption callback to avoid stale Apply target.

---

## Verification Plan

### Automated
- No new unit tests required for MVP (hackathon timeline). computeDiff is pure and testable post-demo.

### Manual
1. Trigger disruption demo → verify two-column layout renders.
2. Click each of 3 options → verify panel content swaps with correct diff.
3. Click Apply in preview panel → verify scenario is applied and undo toast appears.
4. On mobile (375px DevTools) → verify stacked layout.
5. "View full day" toggle → verify all blocks listed.
6. No-op: click same option twice → panel stays stable (no flicker).


## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-20 01:44
**Phase in progress:** Complete
**Status:** All 4 phases implemented and build verified (exit code 0)

### Decisions made this session
- computeDiff uses id-first then title+startTime compound key fallback to match blocks across before/after states
- SchedulePreviewPanel and BlockDiffRow live in AdaptiveApp.tsx (no new files) to match existing codebase pattern
- selectedPreviewIndex is local AdaptivePanel state, synced to parent via onSelectOption callback
- Non-null assertions replaced with ?? 0 fallback for array destructuring from .map(Number) to satisfy strict TS
- Full-day toggle uses max-h-[55vh] overflow-y-auto to prevent layout overflow on mobile
- Apply button moved entirely into SchedulePreviewPanel — removed from AdaptivePanel footer

### Next immediate action
None — all phases complete. Awaiting user verification of UI.

- [x] Phase 01: computeDiff utility + type scaffold
- [x] Phase 02: SchedulePreviewPanel component
- [x] Phase 03: AdaptivePanel split-layout refactor
- [x] Phase 04: Wire currentBlocks + hover highlight
