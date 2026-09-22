# Phase 2: Live 5-Step Dashboard Tour Integration

**Parent Plan:** [`plans/in-product-guidance-and-onboarding/plan.md`](file:///d:/6_OJT/adaptive-planner/plans/in-product-guidance-and-onboarding/plan.md)
**Status:** Not Started

---

## Objectives
1. Add `data-tour` attributes to the 5 core target elements in the actual product UI.
2. Build `<DashboardTourController />` to orchestrate the 5 steps:
   - **Step 1 (NOW)**: `[data-tour="now-hero"]`
   - **Step 2 (NEXT)**: `[data-tour="next-preview"]`
   - **Step 3 (Create Task)**: `[data-tour="quick-add-task"]`
   - **Step 4 (Focus Mode)**: `[data-tour="start-focus-btn"]`
   - **Step 5 (Ask Modo)**: `[data-tour="ask-modo-input"]`
3. Provide interactive step completion (e.g. creating a real task in Step 3 automatically advances or confirms step).
4. Implement the completion state: *"You're ready. Modo will introduce other tools only when you need them."*

---

## Detailed Steps

1. **Tag Target Elements in DOM**:
   - `NowHeroCard.tsx`: tag main container with `data-tour="now-hero"`, tag NEXT preview with `data-tour="next-preview"`, tag focus button with `data-tour="start-focus-btn"`.
   - `AdaptiveApp.tsx`: tag quick task input bar with `data-tour="quick-add-task"`, tag AI chat input with `data-tour="ask-modo-input"`.

2. **Build `src/components/adaptive/guidance/DashboardTourController.tsx`**:
   - Defines the step list with step metadata:
     - Step 0: `target: '[data-tour="now-hero"]'`, icon: `🎯`, title: `"Start here."`, body: `"This is what needs your attention now."`, cta: `"Got it"`
     - Step 1: `target: '[data-tour="next-preview"]'`, icon: `⏭️`, title: `"What's next."`, body: `"Modo keeps your next step visible."`, cta: `"Next"`
     - Step 2: `target: '[data-tour="quick-add-task"]'`, icon: `➕`, title: `"Add something you need to do."`, body: `"Type a task or click here to add."`, cta: `"Try it"`
     - Step 3: `target: '[data-tour="start-focus-btn"]'`, icon: `⚡`, title: `"Ready?"`, body: `"Focus on one thing at a time."`, cta: `"Got it"`
     - Step 4: `target: '[data-tour="ask-modo-input"]'`, icon: `💬`, title: `"Need help?"`, body: `"Ask Modo to plan, break down, or move work."`, cta: `"Try asking Modo"`
   - Completing Step 4 displays the completion card with `"Continue"` action.

3. **Handle Auto-Start & Subtle Resume**:
   - When a user first enters Dashboard (`!tourCompleted && !tourDismissed`), start tour after a brief 600ms settling delay.
   - If user clicked "Skip" (`tourDismissed && !tourCompleted`), show a subtle banner/chip in the header: *"Tour paused • [Resume] [Dismiss]"*.

---

## Verification
- Test all 5 steps in the browser.
- Verify clicking Skip saves state and removes overlay immediately without visual glitches.
