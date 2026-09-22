# Spec: In-Product Guidance & Onboarding System (Neurodivergent-Friendly)

**Date:** 2026-09-22
**Status:** Ready
**Slug:** `in-product-guidance-and-onboarding`

---

## Problem Statement
New users (especially those who are neurodivergent or dealing with executive dysfunction) face cognitive overload when confronted with multi-step static tutorials, dense walls of documentation, or apps with multiple complex features introduced all at once. Modo needs a lightweight, action-driven, spotlight coach mark system that teaches through *learning by doing* and *progressive disclosure*, introducing only 1 concept at a time with full user control and zero pressure.

---

## User Stories

<!-- P1 = MVP (must ship), P2 = nice-to-have, P3 = future/out-of-scope -->

- **[P1]** As a new Modo user, I want a concise 5-step live dashboard tour (NOW → NEXT → Create Task → Focus → Ask Modo) so that I understand what to do immediately without reading long instructions.
  *Accepted when*: Tour highlights each target element sequentially with dimmed backdrop and coach mark, allows creating a task on Step 3, and finishes in under 60 seconds.

- **[P1]** As a user with limited attention or in a hurry, I want to skip, exit, or resume the tour at any time without being trapped in modal blockers.
  *Accepted when*: Pressing "Skip" or "Escape" dismisses the tour cleanly, saves progress in local storage, and shows a subtle "Resume tour" chip or Help Center option.

- **[P1]** As a user navigating deeper features for the first time (Workload, Insights, Sensory Mode, Task Breakdown), I want contextual 1-sentence tips so that I learn advanced features only when I visit them.
  *Accepted when*: First visit displays a dismissible `<FirstUseTip>` card with clear explanation and "Got it" action, and never annoys the user again once dismissed.

- **[P1]** As a returning user, I want an in-product Help Drawer (? Help) and Settings → Help & Guidance page where I can replay tours or inspect micro-guides on demand.
  *Accepted when*: Clicking "? Help" in the top bar opens a slide-over panel with quick topic cards and a "Replay Dashboard Tour" button.

- **[P2]** As a keyboard and screen-reader user, I want all guidance elements to be accessible (Tab navigation, Esc to close, ARIA live announcements, focus restoration).
  *Accepted when*: Focus trap works inside active coach mark, Esc closes it and returns focus to the trigger, and WCAG AA contrast ($\ge 4.5:1$) is satisfied.

- **[P2]** As a mobile user, I want coach marks to adapt gracefully to small viewports without obscuring the interactive target.
  *Accepted when*: On viewports $<640\text{px}$, coach mark appears as an anchored bottom sheet with single-hand reachable buttons.

- **[P3]** Contextual AI proactive suggestions based on repetitive user behavior (e.g. suggesting schedule rebalance after 3 manual reschedules). *(Noted for future iteration)*

---

## Functional Requirements

1. **FR-01 (Guidance State Management)**: Provide a persistent Zustand store `useGuidanceStore` storing tour completion, current step, dismissed state, guidance style (`minimal`, `guided`, `detailed`), and per-feature `seenTips` dictionary.
2. **FR-02 (Spotlight & Backdrop Overlay)**: Render an accessible overlay `<SpotlightOverlay />` that calculates target bounding client rects, creates an SVG cutout around the active element, and dims surrounding content.
3. **FR-03 (Coach Mark Component)**: Standardized `<CoachMark />` UI containing:
   - Icon (e.g. 🎯, 📋, ⚡, 💬)
   - Short heading (2–4 words)
   - Supporting sentence (max 1 sentence)
   - Primary action button (e.g., "Got it", "Next", "Try it")
   - Secondary action button (e.g., "Skip", "Back")
   - Step indicator dots (`● ● ○ ○ ○`)
4. **FR-04 (5-Step Dashboard Tour Definition)**:
   - **Step 1**: Target `[data-tour="now-hero"]` → *"Start here. This is what needs your attention now."*
   - **Step 2**: Target `[data-tour="next-preview"]` → *"What's next. Modo keeps your next step visible."*
   - **Step 3**: Target `[data-tour="create-task-trigger"]` → *"Add something you need to do."* (Supports interactive task entry)
   - **Step 4**: Target `[data-tour="focus-mode-trigger"]` → *"Ready? Focus on one thing at a time."*
   - **Step 5**: Target `[data-tour="ask-modo-input"]` → *"Need help? Ask Modo to plan, break down, or move work."*
   - **Completion**: Clean confirmation banner *"You're ready. Modo will introduce other tools only when you need them."*
5. **FR-05 (Contextual First-Use Tips)**:
   - Workload View: *"How demanding is today? Modo looks at focus work, meetings, transitions, and available breaks."*
   - Insights View: *"Patterns, not grades. Modo looks for patterns that may help you plan future days."*
   - Sensory Mode: *"Calm Mode: Less motion and less visual noise."*
   - Task Breakdown: *"Too big to start? Modo can turn this into smaller steps."*
6. **FR-06 (Help Center Drawer)**: A slide-over `<HelpDrawer />` accessible via `? Help` in the main navigation with 6 quick guide topics and a "Replay Dashboard Tour" button.
7. **FR-07 (Settings Guidance Panel)**: In Settings view, add a "Help & Guidance" section with reset triggers and replay buttons.

---

## Non-Functional Requirements

- **Performance**: Overlay mounting and target bounding-box computation must take $<16\text{ms}$ (60 FPS) with smooth Framer Motion transitions.
- **Cognitive Load**: Zero paragraphs in coach marks; strictly $\le 20$ words per coach mark body.
- **Accessibility**: Support keyboard navigation (Tab, Enter, Escape), ARIA dialog role (`role="dialog"`, `aria-modal="true"`), and `prefers-reduced-motion` compliance.
- **Mobile Usability**: Touch targets $\ge 44\times 44\text{px}$, bottom-sheet fallback on viewport width $<640\text{px}$.

---

## Success Criteria

- [ ] Complete dashboard tour can be finished in $\le 45$ seconds by a first-time user.
- [ ] Users can skip at any step with 1 click without errors or blocking overlays remaining.
- [ ] Bounding box spotlight accurately tracks target elements during window resize or scroll.
- [ ] First-use tips for Workload, Insights, Sensory Mode, and Task Breakdown appear exactly once per user session lifetime unless manually reset.
- [ ] Zero lint/TypeScript errors in `npm run build` and 100% tests passing.

---

## Out of Scope

- Video tutorials hosted externally on YouTube/Vimeo.
- Heavy gamification mechanics (XP points, streak badges, level-ups).
- Hardcoded medical diagnosis logic (`if ADHD`, `if Autism`).

---

## Assumptions

- The app operates in MVP direct-access mode with local storage persistence.
- Key interactive elements can be tagged with `data-tour="..."` attributes for robust selector binding.
