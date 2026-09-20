# Spec: Smart Default Adaptation Engine

**Date:** 2026-09-20  
**Status:** Ready  
**Scope:** AI Multi-Factor Decision Engine, Priority vs Deadline Decoupling, Protected Inviolability, Smart Slotting, Tomorrow Inbox, 1-Click UI, Atomic Undo  

---

## Problem Statement
When unplanned schedule interruptions happen, neurodivergent individuals face intense executive dysfunction and decision paralysis. Traditional calendar tools either force tedious manual rescheduling or apply naive heuristics (e.g. assuming entertainment should always be deleted, or conflating importance with urgency). 

Smart Default Adaptation solves this by evaluating a **Multi-Factor Decision Matrix** (Priority, Deadline proximity, User-defined Protected status, Movability, and Energy context), generating a single AI-analyzed, best-default adaptation proposal with empathetic, transparent reasoning (*Why this option?*), 1-click execution, calm slotting into tomorrow (or Tomorrow Inbox), and atomic 10-second undo.

---

## Domain Model Extensions

### TimeBlock Schema
```typescript
export interface TimeBlock {
  id: string;
  title: string;
  detail?: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  date?: string;     // "YYYY-MM-DD"
  durationMinutes?: number;
  
  // Multi-Factor Decision Fields
  priority: 'PROTECTED' | 'HIGH' | 'NORMAL' | 'FLEXIBLE'; // User-defined importance
  deadline?: string;                                      // "YYYY-MM-DDTHH:mm:ss" - Hard cut-off
  isMovable: boolean;                                     // true by default; false if locked/fixed
  preferredTimeRange?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  category: 'work' | 'social' | 'health' | 'rest' | 'urgent' | 'transition';
  energyLevel: 'high' | 'medium' | 'low';
  
  // Status & Rescheduling Lifecycle
  status?: 'ACTIVE' | 'DISRUPTED' | 'DEFERRED' | 'SCHEDULED';
  inboxDate?: string;                                    // If staged in Tomorrow's Inbox
  sourceType?: 'ROUTINE' | 'CUSTOM' | 'AI_ADDED' | 'AI_RESCHEDULED';
  reminderMinutesBefore: number[];
  isCompleted: boolean;
  isBufferBlock?: boolean;
  microSteps?: MicroStep[];
}
```

---

## Multi-Factor Decision Hierarchy & Scoring

The adaptation engine evaluates candidate block adjustments against a 5-step evaluation pipeline:

```
                  NEW URGENT EVENT
                         ↓
                 Detect conflicts
                         ↓
             Check hard constraints
                         ↓
             Evaluate affected blocks
                         ↓
           ┌──────────────────────────┐
           │ • Priority (Protected/High/Normal/Flex)
           │ • Deadline proximity
           │ • isMovable flag
           │ • Preferred time / Energy
           │ • Buffer & Sleep boundary
           │ • Future workload
           └────────────┬─────────────┘
                        ↓
                 Generate plan
                        ↓
                 Validate plan
                        ↓
              Explain recommendation
                        ↓
                  [ Apply ]
```

### Key Principles:
1. **Priority $\neq$ Deadline:**
   - `Priority`: How important this activity is to the user's life/goals (`PROTECTED` > `HIGH` > `NORMAL` > `FLEXIBLE`).
   - `Deadline`: When this must be completed (closer deadline elevates immediate scheduling urgency, even for `NORMAL` tasks).
2. **"Free time $\neq$ Available time" (Protected Inviolability):**
   - User-marked `PROTECTED` blocks (Sleep `23:00–07:00`, Family Dinner `18:00–19:00`, Therapy) are **hard boundaries**.
   - AI is strictly prohibited from scheduling into, truncating, or invading `PROTECTED` blocks.
3. **Minimize Disruption:**
   - Change the fewest blocks possible to accommodate the urgent event.
   - Defer lowest-scoring flexible/distant-deadline tasks to tomorrow's Calm Opening or Tomorrow Inbox.

---

## User Stories

### [P1] Smart Default Adaptation Flow & Explainability
- **[P1]** As a user with an urgent schedule disruption, I want the AI to propose a single recommended adaptation plan that respects my priorities and upcoming deadlines so that I can resolve the conflict with 1-click without decision fatigue.  
  *Accepted when:* AI displays a single card with:
  - **What changed:** Conflict summary.
  - **What will happen:** Concrete schedule adjustments.
  - **Why this adjustment:** Empathetic explanation stating why Protected blocks were kept, why high-deadline tasks took precedence, and why flexible tasks were shifted/deferred.
  - Primary button: `[ Apply this plan ]`.
- **[P1]** As a user wanting more control, I want alternative options accessible under an accordion so that my primary view remains clean and stress-free.  
  *Accepted when:* Clicking `▸ See alternatives` reveals Alternative 1, 2, 3 with respective 1-click apply buttons.
- **[P1]** As a user applying an adaptation plan, I want the system to immediately update the timetable and navigate to Day Timeline with a gentle chime and a 10-second Undo banner so that I have immediate peace of mind.  
  *Accepted when:* Clicking `[ Apply this plan ]` saves the transaction, plays the 432Hz chime, switches to Day Timeline, and displays a floating toast with `[ ↩ Undo ]` that can roll back all changes atomically.

### [P1] Smart Slotting & Tomorrow Inbox
- **[P1]** As a user with a deferred task, I want the AI to look for a Calm Opening tomorrow (adequate length, buffer, non-sleep, not sandwiched between high-focus tasks) instead of force-cramming.  
  *Accepted when:* If a calm slot exists, the block is scheduled into that slot.
- **[P1]** As a user when tomorrow is already full, I want the task staged in a "Tomorrow Inbox" drawer without pressure.  
  *Accepted when:* If no calm opening is found, status is set to `DEFERRED` with `inboxDate = tomorrow`, displayed in Tomorrow Inbox with a `[ Find a slot ]` action.

---

## Functional Requirements

1. **FR-01 (Multi-Factor Scoring Engine):**  
   `/api/planner/reschedule-scenarios` evaluates `Priority`, `Deadline`, `isMovable`, and `category`, producing:
   - `recommendedScenario` (Single best default).
   - `alternativeScenarios` (2-3 secondary options).
   - Structured `explanation` (`whatChanged`, `whatWillHappen`, `reasons[]`, `confidenceLevel`).
2. **FR-02 (Protected Inviolability Gate):**  
   Blocks marked `PROTECTED` cannot be overwritten or compressed by AI. If a conflict directly overlaps a `PROTECTED` block, AI moves around it or moves `PROTECTED` as a complete indivisible unit with user consent.
3. **FR-03 (Deadline-Aware Sorting):**  
   Tasks with nearer deadlines take higher scheduling precedence over distant-deadline tasks.
4. **FR-04 (Calm Slotting & Tomorrow Inbox):**  
   When deferring a task, scan target day for gaps $\ge \text{duration} + 30\text{m}$. If none found, assign `status = DEFERRED` to Tomorrow Inbox.
5. **FR-05 (Transactional Undo Engine):**  
   Save snapshot `AdaptationAction` on backend and support rollback via `POST /api/planner/adaptation/undo/{actionId}`.
6. **FR-06 (Smart Default UI):**  
   Render single primary recommendation with bulleted *Why?* explanation and secondary `▸ See alternatives` accordion in `PlannerView`.

---

## Non-Functional Requirements

- **Performance:** Decision matrix resolution $\le 800\text{ms}$ via Groq AI, $\le 5\text{ms}$ via Local Fallback Engine.
- **Sensory Safety:** 432Hz gentle audio chime; no harsh alerts; calm amber/primary palette.
- **Reliability:** Complete deterministic fallback available if network/API fails.

---

## Success Criteria

- [ ] Smart Default Card appears with 1-click `[ Apply this plan ]` for any schedule conflict.
- [ ] Reasoning bullets explain decisions based on Protected status, Deadline proximity, and disruption minimization.
- [ ] Protected blocks (e.g. Sleep 23:00–07:00, Dinner) are never invaded.
- [ ] Deferred tasks with calm slots are placed into tomorrow's timetable; tasks without calm slots appear in Tomorrow Inbox.
- [ ] Clicking `[ Apply this plan ]` updates the timetable, plays chime, opens Day Timeline, and shows 10s Undo toast.
- [ ] Clicking `[ Undo ]` restores the full prior timetable state atomically.
