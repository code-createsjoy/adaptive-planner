# Spec: Neurodivergent Anti-Overload & Adaptive UI Redesign (v2.0)

**Date:** 2026-09-22
**Status:** Approved

---

## 1. Problem Statement & Philosophy

Neurodivergent users (ADHD, Autism, Executive Dysfunction) do not simply "want less information" — rather, different users have varying cognitive, executive, and sensory processing needs across different times of the day. 

Standard planner interfaces induce acute cognitive fatigue and choice paralysis because they force dense multi-column grids, competing visual anchors, and long blocks of explanatory text. 

Modo's design philosophy is:
> **"Modo does not simplify the user; Modo simplifies the decisions the user needs to make at any given moment."**

---

## 2. Three-Tier Information Architecture (Progressive Disclosure)

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: GLANCE (2–3 seconds comprehension)                           │
│ • Current active task (NOW) & remaining visual time                   │
│ • Immediate upcoming commitment (NEXT) & buffer alert                 │
│ • Cognitive workload indicator & 1 primary CTA                        │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: UNDERSTAND (1-click intentional expansion)                   │
│ • 1–2 immediate actionable micro-steps                                │
│ • Task category, energy level badge, and schedule timeline             │
│ • Plain-language context ("Why this task was scheduled now")          │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: DEEP DETAIL (On-demand inspection)                           │
│ • Full AI rescheduling reasoning & cascade analysis                    │
│ • Full 10+ subtasks checklist & custom notes                           │
│ • Historical analytics & weekly cognitive trend graphs                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. User Stories & Priority Breakdown

### ⭐ P0: Core Hierarchy & Accessible Architecture (Must Have)
- **[P0-01]** As a user with time-blindness, I want a prominent **NOW / NEXT Hero Card** at the top of my day showing the active task, visual time progress, and at most the next 1–2 actionable micro-steps, so that I immediately know what to do without being overwhelmed by a huge checklist.
  *Accepted when:* Hero displays active task, visual countdown bar, current 1–2 micro-steps with "X of Y complete" badge, and `[View all steps]` expansion.
- **[P0-02]** As a user prone to sensory overload, I want a **Simplified Timeline** using calm, low-saturation surfaces and neutral de-emphasis for past tasks while strictly maintaining WCAG AA contrast.
  *Accepted when:* Past tasks use lighter borders, muted neutral backgrounds, and status icons without hard-coding low text opacity; no primary card has >2 lines of prose by default.
- **[P0-03]** As an assistive technology or keyboard-only user, I want full **Accessibility Engineering** across the workspace.
  *Accepted when:* All interactive elements support keyboard navigation, visible focus rings, ARIA labels, focus trapping/return on drawers/modals, and `prefers-reduced-motion`.
- **[P0-04]** As an anxious user, I want **Compassionate, Zero-Blame Empty/Error States** that assure me my schedule is safe when network or AI operations fail.
  *Accepted when:* Empty state says *"Nothing needs your attention right now. [Plan something]"*; failed AI requests state *"Modo couldn't create that change. Your current schedule hasn't been modified."*

### 🟡 P1: Non-intrusive AI & Adaptive Sensory Modes (Should Have)
- **[P1-01]** As a user who needs an open canvas, I want the **AI Assistant** available via a floating quick-prompt bar and a slide-over history drawer rather than consuming permanent screen space.
  *Accepted when:* The timeline occupies the full canvas; opening AI history slides out smoothly, traps focus, and closes with `Esc`.
- **[P1-02]** As a user whose sensory needs fluctuate, I want **Three Concrete Sensory Modes**:
  - **🌿 CALM**: Reduces motion, hides secondary widgets, lowers visual density, minimizes decorative accents, suppresses non-urgent pings.
  - **⚖️ BALANCED**: Standard profile defaults, standard density and transitions.
  - **🎯 FOCUS**: Displays current task only, next step, active timer; hides secondary navigation and mutes non-critical pings.
  *Accepted when:* Toggling modes in the top bar immediately updates data attributes and layout visibility without page reloads.

### 🔵 P2: Density Customization & Polish (Nice to Have)
- **[P2-01]** As a power user, I want manual density adjustments (Minimal, Balanced, Detailed) and smooth layout animations.

---

## 4. Functional Requirements

1. **FR-01 (NOW / NEXT Hero Card):**
   - Active task title (concise, clear 1-line label).
   - Visual elapsed/remaining progress bar.
   - Shows at most 1–2 actionable micro-steps. If task has >2 sub-steps, displays "2 of 6 complete" with `[View all steps]` modal/drawer trigger.
   - Preview of `NEXT` task with start time and transition buffer badge.
2. **FR-02 (Timeline Bento Cards & De-emphasis):**
   - Primary labels are concise and meaningful (not truncated solely for word counts).
   - Past tasks de-emphasized via neutral styling and check icons while keeping text contrast > 4.5:1.
   - Secondary explanations hidden behind collapsible triggers.
3. **FR-03 (AI Assistant Drawer):**
   - Quick natural language input bar docked at the bottom/floating.
   - Conversation history rendered in an accessible slide-over drawer (`aria-modal="true"`, focus-trapped, `Esc` dismissable).
4. **FR-04 (Tolerance for Error & State Messages):**
   - No tasks: *"Nothing needs your attention right now. [Plan something]"*
   - Save error: *"We couldn't save that response. Your previous answers are safe. [Try again]"*
   - AI rescheduling error: *"Modo couldn't create that change. Your current schedule hasn't been modified."*

---

## 5. Technical Accessibility Specification

- **Keyboard Navigation:** Tab / Shift+Tab order strictly follows visual hierarchy. Space / Enter triggers buttons and checkboxes.
- **Focus Management:** Modals and slide-over drawers trap focus inside and restore focus to the triggering element upon closing.
- **Color & Contrast:** No information conveyed solely by color (badges include both icon and text label). Contrast ratio $\ge 4.5:1$ for normal text, $\ge 3:1$ for large text and UI controls.
- **Motion:** Full support for `@media (prefers-reduced-motion: reduce)` and `SensoryMode === 'calm'`.
- **Target Sizes:** Minimum $44 \times 44\text{ px}$ clickable area for all interactive controls.

---

## 6. Success Criteria

- [ ] User can identify the active task (NOW) and next immediate action within 3 seconds.
- [ ] No primary dashboard card contains more than 2 lines of explanatory prose by default.
- [ ] NOW Hero card embeds at most 1–2 micro-steps with progressive expansion for remaining items.
- [ ] All interactive components pass keyboard navigation and focus trapping requirements.
- [ ] Sensory mode toggle transitions between Calm, Balanced, and Focus modes with functional behavioral changes.
- [ ] Zero build errors on `npm run build`.

---

## 7. Critical UX Guardrails

1. **Minimal does not mean removing useful information.**
2. **Never sacrifice readability for muted visual styling.**
3. **Calm colors must still meet WCAG accessibility contrast requirements.**
4. **Do not hard-code opacity values that reduce text legibility.**
5. **NOW card must show at most the next 1–2 actionable micro-steps.**
6. **Additional steps use progressive disclosure.**
7. **Important controls require visible text labels; icons alone are insufficient.**
8. **Support keyboard navigation and visible focus states.**
9. **Respect `prefers-reduced-motion`.**
10. **Drawers and modals must manage keyboard focus correctly (trap & restore).**
11. **No information may depend on color alone.**
12. **User-facing explanations default to short summaries with optional expansion.**
13. **Preserve detailed information for users who prefer it.**
14. **Interface density must be user-configurable.**
15. **Every major component requires compassionate loading, empty, error, and success states.**
