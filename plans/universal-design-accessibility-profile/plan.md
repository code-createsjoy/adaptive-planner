# Plan: Modo Universal Design Architecture & Personal Accessibility Profile Engine

**Date:** 2026-09-21
**Mode:** --hard
**Risk:** normal — Adds `user_accessibility_profiles` table, two-tier state store, 4-step onboarding modal, live header sensory switcher, and adaptive UI layouts.
**Spec:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/universal-design-accessibility-profile/spec.md)

---

## Executive Summary
This feature establishes the core design philosophy of Modo: a Universal Design architecture that adapts to diverse human cognitive rhythms and situational sensory states. It implements a Two-Tier model:
- **Tier 1 (Baseline Profile - "Who I usually am"):** Created via a friction-free 4-question onboarding wizard (< 30s) and fine-tuned in Settings.
- **Tier 2 (Live Mode Override - "What I need right now"):** 3-segment switcher in the Header (`🧘 Calm` | `⚖️ Balanced` | `🎯 Focus`) that instantly shifts animations, widget visibility, task density, and notification intensity.

---

## Phases

### [Phase 1: Backend Domain Model, Repository, Service & REST APIs](file:///d:/6_OJT/adaptive-planner/plans/universal-design-accessibility-profile/phase-01-backend-entity-and-apis.md) - [COMPLETED]
- Define `UserAccessibilityProfileEntity` with JPA annotations.
- Implement `UserAccessibilityProfileRepository` and `UserAccessibilityProfileService` with default profile seeding and validation.
- Implement `UserAccessibilityProfileController` exposing `/api/user/accessibility-profile` endpoints.
- Write unit and controller test suites (`UserAccessibilityProfileServiceTest`, `UserAccessibilityProfileControllerTest`).

### [Phase 2: Frontend Two-Tier State Architecture, Theme Tokens & Dynamic Hooks](file:///d:/6_OJT/adaptive-planner/plans/universal-design-accessibility-profile/phase-02-frontend-state-and-tokens.md) - [COMPLETED]
- Define accessibility data types in `src/types/planner.ts`.
- Implement `src/lib/api.ts` endpoints and `src/hooks/useAccessibilityProfile.ts`.
- Build `useAccessibilityStore.ts` supporting Tier 1 baseline profile + Tier 2 live mode override (`calm` | `balanced` | `focus`) and resolved styling attributes.

### [Phase 3: 4-Question Adaptive Onboarding Wizard Component](file:///d:/6_OJT/adaptive-planner/plans/universal-design-accessibility-profile/phase-03-adaptive-onboarding-wizard.md) - [COMPLETED]
- Build `AdaptiveOnboardingModal.tsx` with 4 simple questions (Information style, Distraction sensitivity, Reminder style, Schedule structure).
- Implement animated profile generation screen and automatic launch on first visit.

### [Phase 4: Live Header Mode Switcher, Profile Settings & Layout Reactivity](file:///d:/6_OJT/adaptive-planner/plans/universal-design-accessibility-profile/phase-04-header-switcher-and-layout-reactivity.md) - [COMPLETED]
- Build `SensoryModeSwitcher.tsx` with 3 segmented chips in the Header (`🧘 Calm` | `⚖️ Balanced` | `🎯 Focus`).
- Adapt `TodayView` and widget layouts to react to active sensory modes (e.g. limiting task clutter to Now + Next in Calm mode, single active task in Focus mode).
- Implement `AccessibilityProfileSettings.tsx` in Profile view for granular baseline customization.

---

## Verification Plan

### Automated Tests
- Backend Unit & Integration Tests:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-backend
  mvn test "-Dtest=UserAccessibilityProfileServiceTest,UserAccessibilityProfileControllerTest"
  ```
- Frontend Typecheck & Build:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend
  npm run build
  ```

### Manual Verification
1. Open app with a clean profile or trigger Onboarding: answer the 4 questions in under 30s and verify the generated profile badge.
2. Click `🧘 Calm Mode` on the Header: verify animations soften, secondary widgets collapse, and only Now + Next tasks are shown.
3. Click `🎯 Focus Mode`: verify calendar clutter is hidden and single active task focus view is rendered.
4. Click `⚖️ Balanced Mode`: verify full interface returns to baseline profile.
5. Open Profile / Settings view and adjust sliders, verifying live preview changes smoothly.
