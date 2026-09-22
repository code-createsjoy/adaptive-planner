# Plan: Neurodivergent Anti-Overload & Adaptive UI Redesign

**Mode:** Fast
**Risk:** normal — touches frontend layout architecture, timeline components, drawer focus trapping, and sensory modes

---

## Overview
Transform Modo's workspace into a calm, scannable, and truly adaptive neurodivergent-friendly experience following the 3-Tier Progressive Disclosure architecture (Glance -> Understand -> Deep Detail) and 15 Critical UX Guardrails.

---

## Phases

- [x] [Phase 1: NOW / NEXT Hero Focus Card with Chunked Steps](./phase-01-hero-focus-card.md)
  - Hero focus card at the top of the workspace showing active task & visual elapsed progress.
  - Embed at most 1–2 actionable micro-steps with "X of Y complete" badge and progressive `[View all steps]` modal/drawer trigger.
  - Upcoming `NEXT` task preview with start time and buffer reminder.

- [x] [Phase 2: Simplified Bento Timeline & Compassionate States](./phase-02-bento-timeline-simplification.md)
  - Refactor timeline cards into clean, low-saturation surfaces with high WCAG AA text contrast.
  - Neutral de-emphasis for past tasks (no hard-coded opacity that breaks legibility).
  - Trim verbose prose (≤ 2 lines of copy per card by default; deep explanations behind toggles).
  - Implement zero-blame, compassionate empty and error states.

- [x] [Phase 3: Floating AI Prompt Bar & Accessible History Drawer](./phase-03-ai-drawer-progressive-disclosure.md)
  - Move static AI chat panel off the main canvas into a clean quick-prompt bar at the bottom.
  - Conversation history in an accessible slide-over drawer with focus trapping and `Esc` dismissal.

- [x] [Phase 4: Sensory Modes (Calm / Balanced / Focus) & Accessibility Engineering](./phase-04-accessibility-sensory-modes.md)
  - Implement concrete behavioral differences for 🌿 Calm (reduced motion, hidden widgets), ⚖️ Balanced, and 🎯 Focus (current task only, timer, suppressed pings).
  - Verify keyboard navigation (`Tab`/`Shift+Tab`, `Space`/`Enter`), visible focus rings, ARIA labels, and minimum $44\times 44\text{ px}$ tap targets.

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-22 14:58
**Phase in progress:** Complete
**Status:** All 4 phases successfully implemented and verified with 0 build errors.

### Decisions made this session
- Mounted `NowHeroCard` directly in `TodayView` for instant 3-second glanceability (Level 1 Glance: active task + elapsed visual bar; Level 2: max 1–2 actionable steps + "X of Y complete" + `[View all steps]` modal; NEXT buffer preview; compassionate free-time state).
- Removed hard-coded `opacity-55` on past timeline tasks and replaced with neutral slate surface + checkmark to guarantee WCAG AA text contrast ($\ge 4.5:1$).
- Replaced empty schedule notice with zero-blame, empathetic copy.
- Confirmed full integration with 3 Sensory Modes (🌿 Calm, ⚖️ Balanced, 🎯 Focus).

### Next immediate action
Ready for user review and exploration on `http://localhost:5173/`.

---

## File Ownership & Changes

| File | Change Summary |
| --- | --- |
| `adaptive-planner-frontend/src/components/adaptive/AdaptiveApp.tsx` | Workspace layout restructure, Hero placement, AI drawer integration |
| `adaptive-planner-frontend/src/components/adaptive/NowHeroCard.tsx` | [NEW] Hero card with visual progress, 1–2 micro-steps, next preview |
| `adaptive-planner-frontend/src/components/adaptive/BentoTimelineCard.tsx` | [NEW/ENHANCE] Streamlined timeline card with 3-tier progressive disclosure |
| `adaptive-planner-frontend/src/components/adaptive/ChatHistorySidebar.tsx` | Accessible slide-over drawer with focus management and Esc dismiss |
| `adaptive-planner-frontend/src/store/useAccessibilityStore.ts` | Dynamic sensory mode behaviors (Calm/Balanced/Focus layout states) |
