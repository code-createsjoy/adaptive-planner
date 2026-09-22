# Phase 4: Sensory Modes (Calm / Balanced / Focus) & Accessibility Engineering

## Goals
- Implement concrete behavioral differences across the 3 Sensory Modes:
  - 🌿 **CALM**: Reduces animations (`data-reduced-motion="true"`), hides secondary widgets, lowers visual density, minimizes decorative accents, suppresses non-urgent pings.
  - ⚖️ **BALANCED**: Standard accessibility profile defaults, standard density and transitions.
  - 🎯 **FOCUS**: Displays active task only + next step + timer, hides secondary sidebar items, mutes non-critical pings.
- Enforce technical accessibility:
  - Visible keyboard focus rings (`focus-visible:ring-2 ring-teal-500`).
  - No information conveyed by color alone (all badges have icons and text labels).
  - Minimum $44\times 44\text{ px}$ clickable area for all buttons and interactive controls.
  - `@media (prefers-reduced-motion: reduce)` support.

## Implementation Steps
1. Enhance `useAccessibilityStore.ts` and `SensoryModeSwitcher.tsx`:
   - Apply DOM attributes `data-sensory-mode="calm" | "balanced" | "focus"`.
   - In `AdaptiveApp.tsx`, conditionally render secondary widgets when in Focus or Calm mode.
2. Audit all interactive controls for keyboard accessibility and target size.

## Verification
- Switch to Focus Mode: Verify only the active task and timer are prominent.
- Switch to Calm Mode: Verify secondary badges and animations are suppressed.
- Navigate with Tab and Space/Enter: Verify full keyboard controllability.
