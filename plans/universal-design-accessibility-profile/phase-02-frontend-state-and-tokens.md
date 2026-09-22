# Phase 2: Frontend Two-Tier State Architecture, Theme Tokens & Dynamic Hooks

## Context & Objectives
Build the state management layer that seamlessly manages Tier 1 (Baseline Personal Profile) and Tier 2 (Live Mode Override: `calm` | `balanced` | `focus`) and exposes computed accessibility configuration to all components.

## File Ownership
- [MODIFY] `src/types/planner.ts`
- [MODIFY] `src/lib/api.ts`
- [NEW] `src/hooks/useAccessibilityProfile.ts`
- [NEW] `src/store/useAccessibilityStore.ts`

## Detailed Implementation Steps
1. **Define TypeScript Types in `planner.ts`:**
   - `SensoryMode` = `'calm' | 'balanced' | 'focus'`.
   - `AccessibilityProfile` interface (`visualDensity`, `sensorySensitivity`, `focusSupport`, `scheduleStructure`, `notificationStyle`, `communicationStyle`, `onboardingCompleted`).
   - `OnboardingAnswers` interface (`infoStyle`, `distractionLevel`, `reminderStyle`, `scheduleStyle`).
   - `ResolvedAccessibilityConfig` interface (`animationState`, `taskDisplayLimit`, `hideSecondaryWidgets`, `soundTheme`, `colorCueIntensity`).
2. **Add API Methods in `lib/api.ts`:**
   - `getAccessibilityProfile()`, `updateAccessibilityProfile(profile)`, `submitOnboarding(answers)`.
3. **Build `useAccessibilityStore.ts` (Zustand + LocalStorage):**
   - State: `profile: AccessibilityProfile`, `currentMode: SensoryMode`, `isModeOverridden: boolean`.
   - Actions: `setMode(mode: SensoryMode)`, `setProfile(profile)`, `resetToBaseline()`.
   - Computed getter `resolvedConfig`:
     - If `currentMode === 'calm'`: `animationState = 'reduced'`, `taskDisplayLimit = 2`, `hideSecondaryWidgets = true`, `soundTheme = 'gentle-432hz'`.
     - If `currentMode === 'focus'`: `animationState = 'minimal'`, `taskDisplayLimit = 1`, `hideSecondaryWidgets = true`, `soundTheme = 'muted'`.
     - If `currentMode === 'balanced'`: derives configuration strictly from `profile`.
4. **Theme / CSS Tokens Hook:**
   - Dynamically syncs `document.documentElement.dataset.sensoryMode = currentMode` and `document.documentElement.dataset.reducedMotion = ...` for zero-lag CSS styling.

## Verification
- Run frontend typecheck:
  ```bash
  npm run build
  ```
