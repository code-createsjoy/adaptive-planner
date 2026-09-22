# Spec: Workplace Passport & AI Task Translation (My Work Mode)

**Date:** 2026-09-23  
**Status:** Ready  

---

## 1. Problem Statement
Neurodivergent employees (ADHD, Autism, Dyslexia, Executive Dysfunction, Sensory Differences) frequently face misunderstandings, cognitive overload, and friction at work due to misaligned task assignments, sudden interruptions, and unclear communication. Modo acts as a collaborative communication compatibility layer (`Employee ↔ Modo AI ↔ Manager`) that empowers employees to define and share their working preferences with granular privacy, while translating manager tasks into structured, executive-friendly actionable formats without medical labels or surveillance.

---

## 2. User Stories

- **[P1] Workplace Passport Builder:** As an employee, I want to define my working preferences across 7 key categories (Focus, Communication, Task, Feedback, Meetings, Context Switching, Strengths) with per-category privacy controls so that I can set up my workplace passport.
  - *Accepted when:* Employee can select chips/options across all 7 categories and set individual visibility (`Private`, `Share with manager`, `Share with team`).
- **[P1] Manager "How to Work With Me" Guide:** As a manager, I want to view a clear, actionable summary of my team member's approved working preferences so that I can communicate and assign tasks effectively.
  - *Accepted when:* Manager view displays only employee-approved shared cards with actionable tips on best ways to assign work, optimal focus blocks, feedback style, and strengths.
- **[P1] AI Task Translation Engine:** As a manager or employee, I want Modo to transform raw task assignments into neuro-inclusive structured task cards based on the employee's approved passport preferences so that executive dysfunction is minimized.
  - *Accepted when:* Entering a prompt like *"Prepare competitor research and presentation by Friday"* generates a structured breakdown with Goal, Deadline, Priority, Sub-steps, Expected Output, Suggested First Action, and original text badge.
- **[P1] Private AI Insights Approval Loop:** As an employee, I want Modo to suggest discovered working patterns privately so that I can choose whether to add them to my passport.
  - *Accepted when:* An AI-discovered insight appears only in the employee's view with `[Add to Passport]`, `[Not now]`, and `[Don't suggest this again]` buttons, and is never exposed to managers without explicit consent.
- **[P2] 1-Click Task to Timeline Sync:** As an employee, I want to add an AI-translated task directly into my daily timeline as actionable TimeBlocks with 1 click.
  - *Accepted when:* Clicking "Add to My Timeline" creates the corresponding time blocks on the target date.
- **[P3] Multi-Team Workplace Directory & Advanced Analytics:** Organization-level work style matrix across entire departments *(future enterprise phase)*.

---

## 3. Functional Requirements

1. **FR-01 (Navigation Entry):** Add a "Work Mode" (🪪 / 💼) navigation item in Sidebar (Desktop & Mobile) and active persona/role toggle (`Employee View` ⇄ `Manager View`).
2. **FR-02 (Passport Categories):**
   - **Focus:** Best focus hours (e.g. 9:00 AM – 11:00 AM), preferred deep work block, meeting-free preferences, interruption sensitivity, environment.
   - **Communication:** Channels (Written, Verbal, Chat, Email, In-Person) and Format (Bullet points, Detailed, Visual, Step-by-step).
   - **Task Preferences:** Single priority, breakdown into milestones, clear deadline, clear expected output, visual progress, checklist format, time-blocking.
   - **Feedback Preferences:** Private feedback, direct tone, specific examples, written notes, clear next steps, processing buffer.
   - **Meeting Preferences:** Pre-meeting agenda required, written post-meeting summary, camera optional, short meetings, processing time before answering.
   - **Context Switching:** Minimize switching, transition buffer between tasks, batch similar tasks, avoid back-to-back meetings.
   - **Strengths:** Deep focus, pattern recognition, creative thinking, detail-oriented work, analytical thinking, problem solving, structured work, research.
3. **FR-03 (Granular Privacy & Sharing):**
   - Each card contains an independent visibility selector: `Private` (🔒), `Share with manager` (👔), `Share with team` (👥).
   - Card displays clear visual privacy status indicator.
4. **FR-04 (Manager View):**
   - Renders a clean "How to Work with [Employee]" dashboard displaying only items with `visibility !== 'private'`.
   - Sections: *Best ways to assign work*, *Communication preferences*, *Focus times & Meeting boundaries*, *Feedback guide*, *Core cognitive strengths*.
5. **FR-05 (AI Task Translator):**
   - Input: Raw task description, deadline, priority, assigned employee.
   - Output Structure:
     - `goal`: Clear concise objective
     - `deadline`: Target completion timestamp
     - `priority`: High / Medium / Low
     - `steps`: Array of 3-5 concrete micro-steps
     - `expectedOutput`: Tangible artifact description (e.g. "8-10 slides deck")
     - `suggestedFirstAction`: Low-barrier 5-minute kickstarter action
     - `originalRequest`: Verbatim manager input
     - `adaptedBadge`: "Adapted by Modo based on your Work Mode preferences"
6. **FR-06 (Private Insight Suggestions):**
   - System displays private suggestions in the employee passport view (e.g., *"Modo noticed you complete deep-work sessions most consistently between 9 AM and 11 AM"*).
   - Actions: `[Add to Passport]`, `[Not now]`, `[Don't suggest this again]`.
7. **FR-07 (Data Model & Store):**
   - TypeScript model `WorkplacePassport` with `userId`, `categories`, `privacySettings`, `approvedInsights`, and persistent Zustand store `useWorkModeStore`.

---

## 4. Non-Functional & Ethical AI Requirements

- **Language Guardrails:** Strictly no diagnostic or deficit-based labels (ADHD, autism, distracted, unstable, lazy, poor attention). Focus exclusively on constructive work accommodations and cognitive strengths.
- **Privacy First:** Zero automatic manager telemetry. No productivity surveillance or keystroke/idle scoring.
- **Neurodivergent UX:** Clean cards, chip toggles, progressive disclosure, low sensory stimulation, calm typography, and zero confusing walls of text.

---

## 5. Success Criteria

- [ ] Employee can customize and save all 7 Passport categories with individual privacy levels in under 3 minutes.
- [ ] Manager view accurately filters out private fields and renders clean "How to Work With Me" guide.
- [ ] AI Task Translator successfully restructures a raw task into the 6-part executive format respecting employee preferences.
- [ ] Private AI insight prompt correctly adds approved insight to passport on click.
- [ ] Clean build with 0 TypeScript/compilation errors.

---

## 6. Out of Scope for MVP

- Automated HR payroll / performance review integration.
- Company-wide Slack/Teams live bot webhook synchronization (planned for post-presentation phase).
