# Brainstorm Report: Workplace Passport & AI Task Translation (Modo Work Mode)

**Date:** 2026-09-23  
**Feature:** Workplace Passport & AI Task Translation for Neurodivergent Employees & Managers  
**Status:** Brainstorm Complete → Ready for Spec & Planning

---

## 1. Problem & Product Philosophy

### The Core Problem
Neurodivergent employees (ADHD, Autism, Dyslexia, Executive Dysfunction, Sensory Differences) face chronic cognitive friction and burnout in traditional workplace environments due to mismatched communication styles, vague task assignments, sudden context switches, and meeting overload. Explaining their cognitive needs repeatedly feels exhausting, stigmatizing, and risky.

### The Modo Solution
Modo acts as a **communication compatibility layer**:  
`Employee ↔ Modo AI ↔ Manager`

- **NOT** a diagnosis or medical tool.
- **NOT** a productivity surveillance or scoring engine.
- **IS** an empowering personal Workplace Passport ("My Work Mode") where employees define how they work best with granular privacy controls, while managers receive actionable guides and AI-assisted task translation to assign work effectively.

---

## 2. Core Features & Ideas Explored

### A. Workplace Passport ("My Work Mode")
Visual cards with chip selectors, custom notes, and per-card privacy toggles (`Private` | `Share with manager` | `Share with team`):
1. **Focus:** Best focus hours (e.g. 9–11 AM), deep-work duration, interruption sensitivity, environment.
2. **Communication:** Preferred channels (written, chat, face-to-face) and formats (bullet points, step-by-step, visual).
3. **Task Preferences:** Single priority, breakdown into milestones, clear output, checklist, time-blocking.
4. **Feedback:** Private delivery, specific examples, actionable next steps, processing buffer.
5. **Meeting Preferences:** Pre-meeting agendas, written summary notes, camera optional, shorter durations.
6. **Context Switching:** Minimizing switches, transition buffers, batching similar work.
7. **Strengths:** Highlighting cognitive strengths (deep focus, pattern recognition, problem solving, creative thinking).

### B. Manager View ("How to Work With Me" & Team Profiles)
- Clean, non-judgmental executive summary of employee-shared preferences.
- Practical guidance: "Best ways to assign work to [Name]", "Optimal focus times", "Feedback delivery", and "Key strengths".

### C. AI Task Translation Engine
- Manager inputs standard task: *"Prepare competitor research and presentation by Friday"*.
- Modo AI translates it using approved employee passport preferences into:
  - **Goal & Priority**
  - **Deadline**
  - **Step-by-step Micro-milestones**
  - **Concrete Expected Output**
  - **Suggested First Action** (eliminates blank-page executive paralysis)
  - Keeps original manager text with badge: *"Adapted by Modo based on your Work Mode preferences"*.

### D. Private AI Insights & Consent Loop
- AI detects working rhythms (e.g. higher task completion rate during morning focus blocks).
- Shows private suggestion card to the employee with `[Add to Passport]`, `[Not now]`, `[Dismiss]`.
- Absolutely zero manager exposure without explicit employee approval.

---

## 3. User Experience & Non-Diagnostic AI Ethics

- **Language Guardrails:** Strictly prohibits diagnostic labels (*"has ADHD"*, *"low attention"*, *"stressed"*). Uses constructive accommodation language (*"Long uninterrupted focus blocks help this employee work most effectively"*).
- **Sensory & Executive UX:** Calm palette, chip-based selectors, progressive disclosure, no wall-of-text forms.

---

## 4. MVP Target Scope & Execution

- **MVP Flow 1:** Employee fills Workplace Passport, selects preferences, sets privacy per category.
- **MVP Flow 2:** Manager assigns task → Modo AI restructures task based on employee preferences → Task ready to add to timeline.
- **MVP Flow 3:** Private AI insight prompt loop (`Add to Passport` / `Dismiss`).
- **Interactive Demo Switcher:** Toggle between Employee (`Thai`) and Manager view for live presentation.
