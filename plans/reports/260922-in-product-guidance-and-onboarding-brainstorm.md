# Brainstorm: In-Product Guidance & Onboarding System (Neurodivergent-Friendly)

**Date:** 2026-09-22
**Slug:** `in-product-guidance-and-onboarding`

---

## 1. Executive Summary & Challenge

Traditional onboarding patterns (such as 10-slide welcome carousels, text-dense documentation pages, or modal takeovers with 8 feature explanations) create cognitive overload and executive dysfunction paralysis for neurodivergent users.

The goal is to design and implement a **lightweight, action-driven In-Product Guidance & Spotlight Coach Mark System** for Modo that teaches the product through:
- **Learning by Doing**: SHOW → LET USER ACT → CONFIRM → REVEAL NEXT.
- **Progressive Disclosure**: Introducing only 1 concept at a time; revealing advanced tools (Insights, Workload, Sensory modes) only contextually on first visit.
- **Spotlight Coach Marks**: High-contrast, non-blocking spotlight callouts with concise copy (max 1 sentence) and clear text actions.
- **Full User Control**: Easy Skip, Back, Exit Tour, and subtle Resume without annoying traps or aggressive gamification.
- **Replayability & On-Demand Help**: A lightweight In-Product Help Drawer (? Help) and Settings → Help & Guidance center.

---

## 2. Ideas Explored

1. **Passive Tooltip Walkthrough vs. Interactive "Do-It-Now" Tour**:
   - *Passive*: Just click "Next" 5 times.
   - *Decision*: **Interactive Action-Driven Walkthrough**. Users learn best by doing: Step 3 prompts them to actually create a real micro-task or interact with the NOW card, building immediate muscle memory.

2. **Full Page Takeover vs. Dynamic Spotlight Overlay**:
   - *Full Page*: Disconnects user from real UI context.
   - *Decision*: **Dynamic Spotlight Overlay** with SVG cutout / spotlight ring around live DOM elements (`data-tour="now-hero"`, `data-tour="next-preview"`, `data-tour="create-task"`, etc.) with smooth transition and backdrop dimming.

3. **Global Static Help Page vs. In-Product Contextual Help Drawer**:
   - *Decision*: Provide a lightweight slide-over `HelpDrawer` with 1–3 step interactive walkthrough cards, micro-demos, and replayable guides.

4. **Diagnosis-Based Guidance vs. Functional Profile Personalization**:
   - *Decision*: Explicitly avoid diagnosis profiling (`if ADHD`). Instead, personalize guidance density (`minimal`, `guided`, `detailed`) based on the user's explicit Functional Profile preferences (communication density, sensory sensitivity, need for structure).

---

## 3. Core Dashboard Tour Sequence (5 Steps)

```
[Step 1: NOW Card] ──(Got it)──► [Step 2: NEXT Card] ──(Next)──► [Step 3: Create Task] (Act)
                                                                            │
[Done: "You're ready"] ◄──(Got it)── [Step 5: Ask Modo] ◄──(Next)── [Step 4: Focus Mode]
```

- **Step 1 (NOW)**: Spotlight `NowHeroCard` → *"Start here. This is what needs your attention now."* → [Got it]
- **Step 2 (NEXT)**: Spotlight Next queue → *"What's next. Modo keeps your next step visible."* → [Next]
- **Step 3 (Create Task)**: Highlight Quick Add Task → *"Add something you need to do."* → [Try it]
- **Step 4 (Focus)**: Highlight Focus Mode button → *"Ready? Focus on one thing at a time."* → [Start Focus / Show me later]
- **Step 5 (Ask Modo)**: Spotlight AI prompt bar → *"Need help? Ask Modo to plan, break down, or move work."* → [Try asking Modo]
- **Tour Completion**: Clean non-gamified banner *"You're ready. Modo will introduce other tools only when you need them."* → [Continue]

---

## 4. Contextual First-Use Guidance Triggers

1. **Workload Analysis (First Visit)**: *"How demanding is today? Modo looks at focus work, meetings, transitions, and available breaks."* [Got it]
2. **Weekly Insights (First Visit)**: *"Patterns, not grades. Modo looks for patterns that may help you plan future days."* [Got it]
3. **Calm / Sensory Mode (First Activation)**: *"Calm Mode: Less motion and less visual noise."* [Turn on / Keep Current]
4. **Task Breakdown (First Large Task)**: *"Too big to start? Modo can turn this into smaller steps."* [Break it down]

---

## 5. Architecture & Data Model

- **Zustand Store (`useGuidanceStore.ts`)** with `localStorage` persistence:
  ```ts
  interface UserGuidanceState {
    dashboardTourCompleted: boolean;
    dashboardTourStep: number;
    tourDismissed: boolean;
    guidanceStyle: 'minimal' | 'guided' | 'detailed';
    seenTips: {
      workload: boolean;
      insights: boolean;
      sensoryMode: boolean;
      taskBreakdown: boolean;
      focusMode: boolean;
      askModo: boolean;
    };
    // Actions: startTour, nextStep, prevStep, skipTour, resetTour, markTipSeen
  }
  ```
- **Component Hierarchy**:
  - `<TourController />`: Coordinates active step and calculates bounding box for spotlight.
  - `<SpotlightOverlay />`: Renders SVG mask / spotlight ring with smooth motion and click-through prevention.
  - `<CoachMark />`: Floating anchored card with icon, title, short sentence, primary action, skip, and back button.
  - `<HelpDrawer />`: Slide-out panel for quick guidance and tour replays.
  - `<FirstUseTip />`: Contextual micro-banner for deep feature pages.

---

## 6. Open Questions & Risks

- **Spotlight Positioning on Responsive/Mobile Layouts**: On small mobile screens (<640px), floating tooltips might overlap the target or screen edges. *Resolution*: Automatically snap `<CoachMark>` to an anchored bottom sheet on mobile viewports.
- **Target Element Availability**: If target element is not yet rendered in DOM or inside a closed accordion, TourController must gracefully handle element fallback or scroll into view.

---

## 7. Next Steps

- Generate formal `plans/in-product-guidance-and-onboarding/spec.md`.
- Transition to `$bb-plan` for comprehensive step-by-step implementation.
