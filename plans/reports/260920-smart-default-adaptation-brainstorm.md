# Brainstorm: Smart Default Adaptation Engine

**Date:** 2026-09-20  
**Status:** Completed  
**Author/Stakeholder:** Thai & AI Assistant  

---

## 1. Challenge & Problem Statement
When schedules are interrupted (e.g. sudden meetings, unexpected delays), traditional calendar applications either:
1. Ask the user tedious open-ended questions (*"When do you want to move task X to?"*), causing severe decision fatigue and executive dysfunction paralysis.
2. Present complex multi-option matrices (A/B/C) on screen, forcing cognitive comparison when mental energy is already depleted.
3. Apply naive priority rules (e.g. assuming entertainment/gaming is always disposable, or conflating task priority with deadline urgency).

**Goal:** Build a **Smart Default Adaptation Engine** based on the philosophy:  
`AI Recommends → User Approves (1-Click) → Backend Validates & Applies → Instant Timeline View with Reversible Undo`.

---

## 2. Multi-Factor Decision Framework

### A. Decoupling Priority vs Deadline
- **`Priority` (User Importance):** `PROTECTED` > `HIGH` > `NORMAL` > `FLEXIBLE`. (User-defined importance to their life/health).
- **`Deadline` (Temporal Urgency):** Hard completion cut-off date/time. A `NORMAL` task with a deadline tonight takes immediate execution precedence over a `HIGH` task due in 7 days.

### B. "Free time $\neq$ Available time" (Protected Inviolability)
- User-marked `PROTECTED` blocks (Sleep `23:00–07:00`, Dinner, Therapy) are hard inviolable boundaries.
- AI is strictly prohibited from invading sleep or rest hours to cram in deferred tasks. If no suitable daytime slot exists, the task moves to **Tomorrow's Inbox**.

### C. Multi-Factor Pipeline:
$$\text{Decision Weight} = f(\text{Priority}, \text{Deadline Proximity}, \text{isMovable}, \text{Energy Preference}, \text{Disruption Impact})$$

---

## 3. UX Architecture: Smart Default Adaptation

### 1-Card Primary Recommendation + Secondary Alternatives
```
┌─────────────────────────────────────────┐
│ ⚡ Schedule changed                      │
│                                         │
│ Your 18:30 meeting overlaps with        │
│ Dinner and Study blocks.                │
│                                         │
│ ✦ Suggested adjustment                  │
│                                         │
│ • 18:30–20:30  Urgent Meeting           │
│ • 20:30–21:30  Dinner (Protected)       │
│ • 21:30–22:30  Assignment (High, due tm)│
│ • Move Study → Tomorrow 13:00           │
│ • Gaming     → Deferred                 │
│                                         │
│ Why?                                    │
│ • Dinner is protected by you            │
│ • Assignment has a near deadline        │
│ • Study fits tomorrow's calm opening    │
│                                         │
│        [ Apply this plan ]              │
│                                         │
│       ▸ See alternatives                │
└─────────────────────────────────────────┘
```

---

## 4. Post-Apply Flow: Instant Update + Atomic Undo
- **Flow:** `[ Apply this plan ]` ➔ Save Transaction (`AdaptationAction`) ➔ 432Hz Gentle Chime ➔ Switch to **Day Timeline** ➔ Show floating 10s toast `[ ↩ Undo ]`.
- **Atomic Undo:** Reverts all added, shifted, and deferred blocks back to their exact prior state.
