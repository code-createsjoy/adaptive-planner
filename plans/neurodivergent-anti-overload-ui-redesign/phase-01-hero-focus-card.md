# Phase 1: NOW / NEXT Hero Focus Card with Chunked Steps

## Goals
- Create a prominent `NowHeroCard` component at the top of the Today view.
- Level 1 Glance: Active task name, remaining time, and visual countdown progress bar.
- Level 2 Chunked Steps: Render at most 1–2 immediate micro-steps with "X of Y complete" indicator and `[View all steps]` expansion trigger.
- Level 1 Preview: `NEXT` task title, start time, and transition buffer notice.

## Implementation Steps
1. Create `NowHeroCard.tsx`:
   - Calculate current active timeblock based on current time.
   - Display title, category badge, and remaining minutes.
   - Visual progress bar calculated from `(currentTime - startTime) / (endTime - startTime) * 100%`.
   - If task contains `microSteps`: show the first uncompleted step (or first 2), with checkbox toggle.
   - If total micro-steps > 2: render "2 of 6 complete" with `[View all steps]` modal/drawer trigger.
   - Render NEXT upcoming task preview beneath with transition buffer badge.
2. Mount `NowHeroCard` in `AdaptiveApp.tsx` right above the timeline grid.

## Verification
- Load dashboard: Verify `NowHeroCard` displays active task and updates progress smoothly.
- Check micro-step checkbox: Verify status updates immediately without whole-page refresh.
