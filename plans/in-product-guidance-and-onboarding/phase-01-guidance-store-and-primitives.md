# Phase 1: Guidance Store & Spotlight Primitives

**Parent Plan:** [`plans/in-product-guidance-and-onboarding/plan.md`](file:///d:/6_OJT/adaptive-planner/plans/in-product-guidance-and-onboarding/plan.md)
**Status:** Not Started

---

## Objectives
1. Create `useGuidanceStore` Zustand store with localStorage persistence for tour progress, tip dismissals, and guidance style.
2. Build `<SpotlightOverlay />` that dynamically computes the target element's bounding rect and renders an SVG mask cutout with smooth CSS/Framer Motion transitions.
3. Build `<CoachMark />` component that formats icons, short headings, single-sentence descriptions, action buttons, and step indicator dots (`● ● ○ ○ ○`), with desktop floating and mobile bottom-sheet styling.

---

## Detailed Steps

1. **Create `src/store/useGuidanceStore.ts`**:
   - State fields:
     - `isTourActive: boolean`
     - `currentTourStep: number` (0 to 4)
     - `tourDismissed: boolean`
     - `tourCompleted: boolean`
     - `guidanceStyle: 'minimal' | 'guided' | 'detailed'`
     - `seenTips: Record<string, boolean>` (workload, insights, calmMode, taskBreakdown, focusMode, askModo)
     - `isHelpDrawerOpen: boolean`
   - Actions:
     - `startTour(step?: number)`
     - `nextTourStep()`
     - `prevTourStep()`
     - `skipTour()`
     - `completeTour()`
     - `resetAllGuidance()`
     - `markTipSeen(tipId: string)`
     - `setHelpDrawerOpen(open: boolean)`

2. **Create `src/components/adaptive/guidance/SpotlightOverlay.tsx`**:
   - Uses `ResizeObserver` & `window.addEventListener('scroll')` to track target elements with `requestAnimationFrame`.
   - Renders an SVG path with an inverted rectangle cutout:
     `M 0 0 H ${windowWidth} V ${windowHeight} H 0 Z M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`
   - Handles padding around target element (e.g. 8px) with rounded corners (`rx="12"`).
   - Dimmed backdrop with smooth opacity transition.

3. **Create `src/components/adaptive/guidance/CoachMark.tsx`**:
   - Floats adjacent to target element (calculated top/bottom/left based on available viewport space).
   - Props:
     - `icon: React.ReactNode`
     - `title: string`
     - `description: string`
     - `currentStep: number`
     - `totalSteps: number`
     - `primaryActionLabel: string`
     - `onPrimaryAction: () => void`
     - `secondaryActionLabel?: string`
     - `onSecondaryAction?: () => void`
     - `onSkip: () => void`
   - Keyboard listener: `Escape` calls `onSkip()`.
   - WCAG AA compliant contrast and smooth entry animation.

---

## Verification
- Unit verify store actions in browser / unit tests.
- Verify spotlight renders properly over test coordinates without visual tearing.
