# Brainstorm: Modo Universal Design Architecture & Personal Accessibility Profile Engine

**Date:** 2026-09-21

## Ideas Explored
1. **Diagnostic Medical Framing (ADHD/Autism labels):** Asking users during onboarding if they have ADHD or Autism. (Dismissed: Violates Universal Design Principle 1 - Equitable Use; creates stigma and excludes neurotypical users who experience situational burnout/overload).
2. **Single Global Toggle vs Layered Profile & Modes:**
   - *Option A (Single monolithic toggle):* Only provide a static "Accessibility Mode" checkbox. (Dismissed: Inflexible; human sensory & cognitive capacity fluctuates throughout the day).
   - *Option B (Two-Tier Architecture: Profile + Quick Mode - Chosen):*
     - **Profile ("Who I usually am"):** Baseline configuration established during a 4-question onboarding wizard and editable in Settings.
     - **Mode ("What I need right now"):** 3 live switches in Header (`🧘 Calm`, `⚖️ Balanced`, `🎯 Focus`) that apply temporary overrides to animations, widgets, notification volume, and task display limits.
3. **AI Behavioral Adaptation:** AI learns habits (e.g. switching to Calm Mode after 4 PM) and offers gentle, non-intrusive proactive suggestions without silent or unilateral schedule alterations.

## User's Direction
- **Philosophy:** *"Modo is not designed around a 'normal user' and then adapted for neurodivergent people. It is designed from the beginning using Universal Design principles, allowing the interface, scheduling system, and AI assistance to adapt to different cognitive and sensory needs."*
- **Two-Tier Engine:**
  - `User Accessibility Profile` (Baseline)
  - `Current Mode Override` (Live 3-state switcher: `🧘 Calm` | `⚖️ Balanced` | `🎯 Focus`)
- **Interaction Flow:**
  - **1. Onboarding Wizard:** 4 simple questions (Information style, Distraction level, Reminder style, Schedule structure) completed in < 30s.
  - **2. Header Quick Switcher:** Instant 1-click transition between Calm, Balanced, and Focus modes with zero reload.
  - **3. My Modo Profile in Settings:** Deep fine-tuning (Sensory, Focus, Communication, Notification).
  - **4. Proactive AI Habit Prompts:** Suggests mode activations based on recurring usage times with full user agency (Yes / Not now / Don't ask again).

## Open Questions
- None. Requirements, visual layers, and interaction hierarchies are exceptionally clear and well-structured.

## Risks
- **CSS Performance & Layout Jumps:** Transitioning between Calm/Focus/Balanced modes must be silky smooth without abrupt DOM flickering or broken container heights.
- **State Serialization:** Ensure the local Zustand state and backend persistence stay seamlessly synchronized, with instant offline fallback.
