# Spec: Workload & Cognitive Load Detection Engine & Quick Rebalance Flow

## 1. Context & Objectives
Traditional calendars treat schedules uniformly by total hours, neglecting human cognitive fatigue caused by back-to-back meetings, fragmentation, domain context switches, and tight deadlines.

This feature adds a **Multi-Dimensional Cognitive Load Detection Engine** that evaluates a user's daily schedule against 10 cognitive load factors—including their Personal Accessibility Profile and Daily Check-in state—and provides a supportive, non-diagnostic **"Today's Workload" card** and **Quick Rebalance Modal** with 1-click preview and application.

---

## 2. Non-Diagnostic Boundary (Critical Rule)
- **Zero Medical Terminology**: The system MUST NEVER mention ADHD, Autism, Burnout, Depression, or any clinical diagnosis in code, API responses, tooltips, or UI copy.
- **Supportive Framing**: All explanations are phrased around cognitive workload and personal pacing: *"This schedule may be demanding for the way you prefer to work."*

---

## 3. User Stories

### Story 1: Transparent Daily Cognitive Load Assessment (P1)
**As a** user opening my daily timetable,  
**I want** to see an overview of my day's cognitive load in the right sidebar,  
**So that** I understand why my schedule might feel overwhelming (e.g. 4 meetings + 3 context switches + low buffer) without being judged by a fitness-style score.

### Story 2: Top-Bar Demanding Day Banner (P1)
**As a** user with an unusually heavy schedule ($\ge 75/100$),  
**I want** a gentle banner at the top of my timeline alerting me and offering breathing room,  
**So that** I don't overlook a potential overload before my day begins.

### Story 3: 3-Option Quick Rebalance Modal with Diff Preview (P1)
**As a** busy or overwhelmed user clicking `[ Review Schedule ]`,  
**I want** to see 3 pre-calculated, actionable adjustment options (Add Buffer, Move Flexible Task, Reduce Context Switches) with a side-by-side Diff Preview,  
**So that** I can fix my schedule with 1 click without having to formulate prompts in a chat window.

### Story 4: Fallback to AI Freeform Assistant (P2)
**As a** user wanting a custom rearrangement,  
**I want** a button `✨ Ask Modo for another approach` inside the Quick Rebalance Modal,  
**So that** I can seamlessly transition to the AI Chat planner with the workload context already loaded.

---

## 4. Multi-Factor Scoring Engine (10 Factors)

The backend service `CognitiveLoadEvaluationService` evaluates the following formula:

$$\text{Load Score} = \min(100, \sum_{i=1}^{10} W_i \cdot F_i) \times \text{CheckinModifier}$$

| Factor ($F_i$) | Metric Measured | Penalty Weight / Rules |
|---|---|---|
| $F_1$: Task Count | Total blocks scheduled for the day | +3 pts per task over 6 tasks |
| $F_2$: Meeting Density | Percentage of day occupied by meetings | +15 pts if $> 4$ meetings or $> 40\%$ day |
| $F_3$: Back-to-Back Events | Consecutive meetings/focus with 0 gap | +10 pts per back-to-back pair |
| $F_4$: Context Switches | Domain/category switching (Code $\leftrightarrow$ Meeting $\leftrightarrow$ Design) | +5 pts per distinct category transition |
| $F_5$: High-Focus Duration | Continuous blocks $> 90$ mins without break | +10 pts per block |
| $F_6$: Total Focus Hours | Total deep work hours $> 5$ hours | +4 pts per hour over 5h |
| $F_7$: Deadline Clustering | Deadlines within 3 hours of each other | +15 pts |
| $F_8$: Buffer Deficit | Total unscheduled gaps between 09:00–18:00 | +20 pts if total buffer $< 30$ mins |
| $F_9$: Priority Vigilance | Number of High/Urgent priority blocks | +8 pts per urgent block |
| $F_{10}$: Profile Sensitivity | User's Personal Profile (Sensory / Distraction) | +10% penalty if distraction/sensory is HIGH |

- **Checkin Modifier**: If energy level is $\le 2$ or active period day, score is boosted by $1.2\times$ (lowering threshold to reach `Heavy`).
- **Score Levels**:
  - `Light` (0 – 39 pts)
  - `Moderate` (40 – 74 pts)
  - `Heavy` (75 – 100 pts)

---

## 5. API Specification

### 1. `GET /api/workload/evaluate?date=YYYY-MM-DD`
Calculates and returns the daily cognitive load breakdown.

**Response Body (`CognitiveLoadAssessmentDto`):**
```json
{
  "date": "2026-09-22",
  "score": 78,
  "level": "HEAVY",
  "summary": "Your afternoon has several demanding blocks with little recovery time.",
  "bulletPoints": [
    "3 high-focus blocks (4h 20m)",
    "4 meetings with 2 back-to-back",
    "7 domain context switches",
    "Only 15m unscheduled buffer"
  ],
  "metrics": {
    "totalTasks": 7,
    "meetingCount": 4,
    "backToBackCount": 2,
    "contextSwitchCount": 7,
    "highFocusHours": 4.3,
    "totalBufferMinutes": 15,
    "deadlineCount": 2
  },
  "isDemanding": true
}
```

### 2. `GET /api/workload/rebalance-options?date=YYYY-MM-DD`
Returns 3 pre-calculated quick rebalance proposals.

**Response Body (`QuickRebalanceProposalDto`):**
```json
{
  "date": "2026-09-22",
  "loadScore": 78,
  "options": [
    {
      "id": "option-a-buffer",
      "type": "ADD_BUFFER",
      "title": "☕ Add Breathing Room",
      "description": "Add a 15-minute recovery buffer after your 14:00 Team Meeting.",
      "estimatedLoadReduction": 15,
      "diff": {
        "movedBlockCount": 2,
        "bufferAddedMinutes": 15,
        "deferredBlockCount": 0
      },
      "proposedBlocks": [...]
    },
    {
      "id": "option-b-defer",
      "type": "MOVE_FLEXIBLE_TASK",
      "title": "→ Move Flexible Task",
      "description": "Move 'Finish research notes' to tomorrow at 09:00 AM.",
      "estimatedLoadReduction": 20,
      "diff": {
        "movedBlockCount": 0,
        "bufferAddedMinutes": 45,
        "deferredBlockCount": 1
      },
      "proposedBlocks": [...]
    },
    {
      "id": "option-c-group",
      "type": "REDUCE_CONTEXT_SWITCH",
      "title": "🔄 Group Similar Tasks",
      "description": "Group Design and Research blocks together to eliminate 2 context switches.",
      "estimatedLoadReduction": 12,
      "diff": {
        "movedBlockCount": 2,
        "bufferAddedMinutes": 0,
        "deferredBlockCount": 0
      },
      "proposedBlocks": [...]
    }
  ]
}
```

---

## 6. Frontend Architecture & Components

1. **`src/components/adaptive/TodayWorkloadCard.tsx`** (Right Sidebar widget):
   - Level indicator: `Light` (Emerald/Blue), `Moderate` (Amber), `Heavy` (Rose/Indigo).
   - Metrics summary: 🧠 focus blocks, 📅 meetings, ⏱ buffer time.
   - Collapsible **"Why?"** explanation.
   - Discrete load estimate: `Load estimate: 78/100`.
   - `[ Review Schedule → ]` button.

2. **`src/components/adaptive/DemandingDayBanner.tsx`** (Top timeline banner):
   - Rendered above the timeline only when `assessment.level === 'HEAVY'`.
   - Empathetic prompt: *"Today looks unusually demanding. Modo found a few ways to create more breathing room. [ Review ]"*.

3. **`src/components/adaptive/QuickRebalanceModal.tsx`**:
   - 3 option cards with `[ Preview ]` button.
   - Expandable side-by-side **Diff Preview** (`Current` vs `Proposed`).
   - `[ Apply changes ]` & `[ Keep current ]` action buttons.
   - `✨ Ask Modo for another approach` button that navigates to AI Chat.

---

## 7. Success Criteria & Verification
- Backend Unit Tests for `CognitiveLoadEvaluationServiceTest` covering all 10 factors and modifiers.
- Frontend build passes with 0 TypeScript/CSS errors (`npm run build`).
- Switching dates re-evaluates load dynamically.
- Applying any rebalance option updates the timetable with a 10s undo toast.
