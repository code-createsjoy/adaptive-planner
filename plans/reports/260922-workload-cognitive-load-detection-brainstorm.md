# Brainstorm: Workload & Cognitive Load Detection

**Date:** 2026-09-22
**Project:** Modo (Adaptive Planner)

---

## 1. Core Philosophy & Value Proposition

Traditional productivity apps treat time management purely by total hours and task counts (e.g., "6 hours of work scheduled"). In reality, human cognitive fatigue is non-linear and deeply personal:
- 6 hours of repetitive light tasks is vastly different from **6 hours of fragmented back-to-back meetings and alternating deep code/design work** (constant context switching).
- **"Same Calendar → Different Person → Different Cognitive Load"**: A schedule with 4 meetings and 0 buffer time might be tolerable for someone who thrives on social pacing, but severely draining for someone with high sensory/context-switching sensitivity or low energy on a given day.
- **Non-Diagnostic, Supportive Framing**: Modo never uses clinical or medical terminology (ADHD, autism, burnout, depression). It frames all feedback around personal work patterns: *"This schedule may be demanding for the way you prefer to work."*

---

## 2. Multi-Dimensional Cognitive Load Algorithm (10 Factors)

The backend Cognitive Load Service evaluates 10 explicit factors to compute a transparent Load Score (0–100) and Level (`Light` [0-39], `Moderate` [40-74], `Demanding / Heavy` [75-100]):

1. **Task Complexity & Focus Effort**: Duration and count of high-effort / deep work blocks.
2. **Estimated Duration**: Total hours committed vs daily realistic focus capacity (e.g. > 6h deep focus increases penalty).
3. **Meeting Density**: Proportion of the day consumed by synchronous meetings.
4. **Back-to-Back Events**: Consecutive meetings or focus blocks without interstitial breaks.
5. **Context Switching Frequency**: Rapid switching between unrelated domains (e.g. Coding → Sales Call → Design → Finance).
6. **Deadline Clustering**: Multiple strict deadlines occurring within a narrow 2–3 hour window.
7. **Available Recovery Buffer**: Total unscheduled gap time between 09:00 and 18:00 (e.g. < 30m total buffer triggers penalty).
8. **Extended Unbroken Blocks**: Single continuous work periods > 90–120 minutes without a pause.
9. **Task Priority Weighting**: High-priority / anchor tasks requiring heightened vigilance.
10. **Personal Profile & Daily Check-in Modifiers**:
    - User's **Personal Accessibility Profile** (sensory sensitivity, buffer preference: 0m/10m/15m, focus support style).
    - User's **Daily Check-in** (low energy $\le 2/5$, period day, fatigue mood), which lowers tolerance thresholds dynamically.

---

## 3. User Experience & Dashboard Placement (Two-Tier Presentation)

### A. Right Sidebar (Always Available Context)
- Compact `Today's Workload` card:
  - Level badge: `Light` | `Moderate` | `Heavy` (with subtle score `Load estimate: 78/100`).
  - Primary metric bullets (e.g., `🧠 3 focus blocks`, `📅 4 meetings`, `⏱ 15 min buffer`).
  - Collapsible **"Why?"** explanation highlighting root causes (e.g. *"Your afternoon has several demanding blocks with little recovery time"*).
  - Primary Action: `[ Review Schedule → ]`.

### B. Top Timeline Warning Banner (Conditional / Only When Heavy $\ge 75$)
- Appears gently above the timeline when the day is detected as unusually demanding:
  > *"Today looks unusually demanding. Modo found a few ways to create more breathing room. [ Review ]"*
- Does not clutter the view on `Light` or `Moderate` days to avoid artificial anxiety.

---

## 4. Friction-Free Quick Rebalance Flow

When the user clicks `[ Review Schedule ]`:
1. **Quick Rebalance Modal opens** with 3 distinct, actionable pre-computed options:
   - **Option A (Add Breathing Room)**: Inserts a 15-minute recovery buffer after an intense meeting or deep work block.
   - **Option B (Move a Flexible Task)**: Defer a non-urgent / flexible task to tomorrow morning.
   - **Option C (Reduce Context Switching)**: Reorder or cluster related tasks into contiguous domain blocks.
   - **✨ Ask Modo for another option**: Opens the AI Chat interface with a pre-filled workload prompt for custom adjustments.
2. **Adaptive Diff Preview (`Current` vs `Proposed`)**:
   - Clicking `[ Preview ]` on any option renders a side-by-side visual timetable diff card with color-coded tags (`[moved]`, `[buffer added]`, `[deferred]`).
3. **User Confirmation**:
   - User clicks `[ Apply changes ]` or `[ Keep current ]`. AI never alters the calendar unilaterally.

---

## 5. Risks & Mitigation
- **Risk 1: Artificial Anxiety from Numbers**: Displaying a big red "78/100" can induce anxiety.
  - *Mitigation*: Emphasize descriptive text ("Heavy", "Moderate") and empathetic explanations; keep the numeric score small and secondary.
- **Risk 2: Algorithm Inflexibility**: User has a packed schedule that they intentionally planned and cannot change.
  - *Mitigation*: The UI never forces an adjustment; one-click dismiss and clean `[ Keep current ]` controls preserve user autonomy.
