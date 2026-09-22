# Spec: Modo Universal Design Architecture & Personal Accessibility Profile Engine

**Date:** 2026-09-21
**Status:** Ready

---

## Problem Statement
Traditional productivity tools assume a single, static "neurotypical standard user" and treat accessibility as an afterthought. Neurodivergent individuals, students, and professionals experiencing cognitive overload, sensory fatigue, or ADHD/time blindness struggle with rigid, widget-heavy, over-stimulating interfaces. Modo needs a Universal Design architecture where the interface, AI behavior, and scheduling system seamlessly adapt to individual cognitive profiles and live situational needs.

---

## Design Philosophy (The 7 Universal Design Principles)
1. **Equitable Use:** One cohesive system with custom information delivery (text + icon + color cue, sensory-friendly mode, adjustable notification volume). No separate "disabled" views.
2. **Flexibility in Use:** Choice of workflow (calendar / timeline / focus block / single task), AI suggests without enforcing.
3. **Simple & Intuitive Use:** Clutter-free cognitive hierarchy: `Now → Next → Later` over displaying 20 simultaneous tasks.
4. **Perceptible Information:** Multi-modal indicators (color + icons + typography), adjustable motion/contrast/animations.
5. **Tolerance for Error:** Empathetic language, 10s atomic Undo, confirmation on destructive actions, zero unilateral AI modifications.
6. **Low Physical Effort:** 1-line NLP parsing, minimum clicks, intelligent slotting.
7. **Size & Space for Approach and Use:** Tap targets ≥ 44px, generous sensory spacing, responsive keyboard navigation.

---

## User Stories

<!-- P1 = MVP (must ship), P2 = nice-to-have, P3 = future/out-of-scope -->

- **[P1]** As a new user opening Modo, I want a concise 4-step onboarding wizard (Information presentation, Distraction sensitivity, Reminder style, Schedule structure) so that the app establishes my baseline **Personal Accessibility Profile** in under 30 seconds without medical/diagnostic questions.
  - Accepted when: Completing the 4 questions computes and stores the profile (local storage + backend), and immediately renders the adapted baseline theme and layout.

- **[P1]** As a user experiencing sensory overload or high-focus demands during the day, I want a **Live Mode Switcher** in the Header (`🧘 Calm` | `⚖️ Balanced` | `🎯 Focus`) so that I can instantly override the UI state without opening Settings.
  - Accepted when:
    - Switching to `🧘 Calm` reduces animations (`reduced-motion`), soft tones, limits task views to Now + Next, mutes non-urgent notifications, and collapses secondary widgets.
    - Switching to `🎯 Focus` hides calendar clutter, displays only the active task with a visual focus timer, and mutes low-priority alerts.
    - Switching to `⚖️ Balanced` restores the baseline Personal Profile.

- **[P1]** As a user, I want to open **My Modo Profile** in Settings/Profile to review and fine-tune my baseline sensory preferences (Sensory, Focus, Communication Style, Notification Volume).
  - Accepted when: Changes saved in Settings immediately propagate to the active theme and persist in database/local storage.

- **[P2]** As a user with recurring usage patterns, I want Modo AI to recognize my habitual mode switching (e.g. switching to Calm Mode after 4 PM) and offer a polite, non-intrusive prompt ("You often switch to Calm Mode after 4 PM. Would you like to make Calm default at this time?") with full user agency (Yes / Not now / Don't ask again).
  - Accepted when: Repeated mode shifts generate a gentle inline toast/card with 1-click confirmation.

- **[P3]** _(out of scope — noted for future)_
  - Biometric wearable integration (smartwatch heart-rate stress triggers for auto-calm mode).
  - Voice-activated sensory profile switching.

---

## Functional Requirements

1. **FR-01 (Two-Tier Profile & Mode Engine State Architecture):**
   - Tier 1 (Baseline Profile): `visualDensity` (`low` | `medium` | `high`), `sensorySensitivity` (`high` | `medium` | `standard`), `focusSupport` (`single-task` | `now-next` | `full-timeline`), `scheduleStructure` (`flexible` | `balanced` | `structured`), `notificationStyle` (`gentle` | `standard` | `persistent`), `communicationStyle` (`empathetic` | `concise` | `direct`).
   - Tier 2 (Current Mode Override): `currentMode` (`calm` | `balanced` | `focus`).
   - Resolved UI config hook `useAccessibility()` dynamically computing:
     - `animationIntensity`: `none` | `reduced` | `full`
     - `taskVisibilityLimit`: `1` (Focus) | `2` (Calm) | `unlimited` (Balanced)
     - `hideSecondaryWidgets`: boolean
     - `themeColorPalette`: `sensory-calm` (muted pastel) | `standard` | `high-contrast`

2. **FR-02 (4-Question Onboarding Wizard):**
   - Step 1: "How do you prefer information to be shown?" → `🎨 Visual` / `📝 Text & Structure` / `✨ Balanced`
   - Step 2: "How easily do distractions disrupt your focus?" → `🍃 Low` / `⚖️ Medium` / `🌪️ High (Need calm focus)`
   - Step 3: "How do you prefer reminders & cues?" → `🕊️ Gentle (432Hz sine/soft)` / `🔔 Standard` / `⏰ Persistent`
   - Step 4: "How structured do you like your day?" → `🌊 Flexible & Adaptive` / `⚖️ Balanced` / `📐 Structured Timetable`
   - Finish: Visual completion card showing generated Personal Profile with `[Enter Modo]` button.

3. **FR-03 (Header Live Quick-Mode Switcher):**
   - 3-segmented chip bar in Header: `🧘 Calm` | `⚖️ Balanced` | `🎯 Focus`.
   - 1-click transition time < 30ms with smooth CSS class toggles (`data-sensory-mode="calm"`, `data-reduced-motion="true"`).

4. **FR-04 (My Modo Profile Settings Panel):**
   - Interactive sliders and visual preset selectors in Profile view.
   - Live preview card showing how task cards, timers, and notifications look under current settings.

5. **FR-05 (Backend Profile API & Entity Persistence):**
   - Entity `UserAccessibilityProfileEntity` with fields mapping to Tier 1 properties.
   - REST Endpoints:
     - `GET /api/user/accessibility-profile`
     - `PUT /api/user/accessibility-profile`
     - `POST /api/user/accessibility-profile/onboarding`

---

## Non-Functional Requirements

- **Latency:** Quick mode transition rendered in < 50ms with zero network blocking.
- **Accessibility:** Strict WCAG 2.1 AA contrast compliance across all 3 modes; all controls keyboard operable with clear visual focus rings.
- **Dignity & Non-Pathologizing Language:** Zero medical labeling in UI copy. All explanations focus on personal empowerment, calmness, and cognitive rhythm.

---

## Success Criteria

- [ ] 4-Question Onboarding Wizard can be completed in < 30 seconds with 100% responsive transitions.
- [ ] Live Quick Switcher (`🧘 Calm` | `⚖️ Balanced` | `🎯 Focus`) changes UI task density, animation state, and sound profile in < 50ms.
- [ ] Calm mode reliably restricts timeline clutter to Now + Next and reduces motion tokens.
- [ ] Personal Accessibility Profile persists accurately across browser sessions and backend database.

---

## Out of Scope

- Automatic eye-tracking or external EEG/biometric hardware connections.
- Strict diagnostic questionnaire or clinical ADHD assessment forms.

---

## Assumptions

- Users may change preferences frequently; mode overrides must always take precedence without erasing the stored baseline profile.

---

## [NEEDS CLARIFICATION]

_(None. Architecture, principles, and user flow are fully aligned.)_
