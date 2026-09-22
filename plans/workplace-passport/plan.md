# Plan: Workplace Passport & AI Task Translation (My Work Mode)

Mode: --fast
Risk: normal — Multi-file UI components and client Zustand store with timeline auto-sync; no backend schema or auth modifications.

## Overview
Implement **My Work Mode (Workplace Passport)** and **AI Task Translation** for neurodivergent employees and their managers. The feature acts as a collaborative communication compatibility layer (`Employee ↔ Modo AI ↔ Manager`), allowing employees to define and privately control their work style preferences across 7 key categories, while giving managers a practical "How to Work With Me" guide and an AI Task Translator that translates raw assignments into executive-friendly, actionable micro-steps with 1-click timeline sync.

## Phase Breakdown

- [x] **Phase 1:** [phase-01-models-and-store.md](./phase-01-models-and-store.md) — Define TypeScript interfaces and Zustand store (`useWorkModeStore`) with seed passport data, privacy controls, AI suggestions, and translation mock engine.
- [x] **Phase 2:** [phase-02-employee-passport-ui.md](./phase-02-employee-passport-ui.md) — Build `WorkplacePassportView`, 7 categorized preference cards with chip toggles, per-card privacy dropdowns (`Private` | `Manager` | `Team`), and private AI insight popovers.
- [x] **Phase 3:** [phase-03-manager-view-and-task-translation.md](./phase-03-manager-view-and-task-translation.md) — Build `ManagerWorkWithMeView`, `TaskTranslationModal`, and `AdaptedTaskCard` with 1-click "Add to My Timeline" synchronization.
- [x] **Phase 4:** [phase-04-navigation-and-integration.md](./phase-04-navigation-and-integration.md) — Integrate `WorkModeView` into `AdaptiveApp.tsx` sidebar navigation (`🪪 Work Mode`), add interactive role toggle (`Thai (Employee)` ⇄ `Manager`), and verify complete presentation flow.

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-23 00:38
**Phase in progress:** Complete
**Status:** All 4 phases implemented and verified passing in browser subagent.

### Decisions made this session
- Created persistent client-side Zustand store `useWorkModeStore` with 7 Workplace Passport categories, granular per-card privacy controls, and AI task translator.
- Built Employee View ("My Work Mode") and Manager View ("How to Work with Thai").
- Implemented AI Task Translation modal and adapted task cards with 1-click timeline sync.
- Embedded live role switcher (`Thai (Employee View)` ⇄ `Manager View (Alex)`).

### Next immediate action
- Ready for user presentation and live walkthrough.
