# Plan: In-Product Guidance & Onboarding System (Neurodivergent-Friendly)

**Date:** 2026-09-22
**Mode:** --hard
**Risk:** normal — Multi-component frontend UI overlay & state management, fully client-side persistent, no backend auth/database risk.
**Spec:** `plans/in-product-guidance-and-onboarding/spec.md`

---

## 1. Overview & Architecture

This plan establishes an **In-Product Guidance & Spotlight Coach Mark System** tailored for neurodivergent cognitive accessibility. It implements the core rule: **SHOW → LET USER ACT → CONFIRM → REVEAL NEXT**.

```
┌────────────────────────────────────────────────────────┐
│                   useGuidanceStore                     │
│  (tourStep, activeTour, seenTips, guidanceStyle, etc.) │
└──────────┬─────────────────────────────────┬───────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│  <SpotlightOverlay>  │          │    <HelpDrawer>      │
│  • Dynamic SVG Mask  │          │  • Quick Guides      │
│  • Viewport Tracking │          │  • Replay Tour       │
│  • <CoachMark> Card  │          │  • Reset Tips        │
└──────────┬───────────┘          └──────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────┐
│                     Target Elements                    │
│   [data-tour="now-hero"]        [data-tour="next-preview"]
│   [data-tour="create-task"]     [data-tour="focus-mode"]
│   [data-tour="ask-modo"]        [data-tour="first-use-*"]
└────────────────────────────────────────────────────────┘
```

---

## 2. Implementation Phases

- [x] **Phase 1: Guidance Store & Spotlight Primitives** (`phase-01-guidance-store-and-primitives.md`)
- [x] **Phase 2: Live 5-Step Dashboard Tour Integration** (`phase-02-core-dashboard-tour.md`)
- [x] **Phase 3: Contextual First-Use Tips & In-Product Help Drawer** (`phase-03-contextual-tips-and-help-drawer.md`)
- [x] **Phase 4: Settings Replay Management, Accessibility & Verification** (`phase-04-settings-replay-and-verification.md`)

---

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-22 16:55
**Phase in progress:** All Phases Complete (100%)
**Status:** All 5 guidance features passing verification in browser & automated build

### Decisions made this session
- Implemented `useGuidanceStore` with Zustand + `persist` local storage so tour states, tip dismissals, and guidance style preferences persist seamlessly across browser reloads.
- Built `<SpotlightOverlay />` using dynamic SVG masking (`<mask id="spotlight-mask">`) with smooth CSS transitions and real-time bounding box tracking on window resize / scroll.
- Built `<CoachMark />` adhering strictly to cognitive minimalism (icon + short 2-4 word title + max 1 sentence description + action buttons + progress dots + Esc key support + mobile bottom sheet adaptation).
- Added `[data-tour]` attributes across `NowHeroCard`, `TodayView` quick add button, and `PlannerView` prompt input for live DOM spotlight targeting.
- Mounted `<HelpDrawer />` accessible from top bar `? Trợ giúp` button.
- Added `<HelpAndGuidanceSettingsCard />` to Settings view for tour replay and guidance density adjustments.
- Ran automated test suite and live browser subagent to verify all 5 steps and drawers visually.

### Next immediate action
Handoff to user for live exploration.
