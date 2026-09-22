# Brainstorm: Daily Mood, Note & Period Cycle Tracker with Proactive AI Workload Adaptation

**Date:** 2026-09-21

## Ideas Explored
1. **Dedicated Journal / Health Tab:** Create a separate navigation tab for daily journaling and cycle tracking. (Dismissed: High friction; disconnected from daily planning and scheduling workflows).
2. **Calendar Cell Direct Input & Modal:** Interactive popover/modal triggered by clicking directly on calendar day cells or timeline day headers to log mood emoji, daily note text, and period status. (Chosen).
3. **Passive Logging vs Proactive AI Integration:**
   - *Option A (Passive):* Only display visual badges and personal journal notes on calendar cells.
   - *Option B (Proactive Adaptation - Chosen):* Visual personal tracking combined with proactive AI schedule adaptation — when low energy (🥱, 😣) or menstrual cycle (🩸) is logged, AI proactively suggests lighter workloads, inserting breaks, or deferring high-stress tasks to higher-energy days with 1-click application.
4. **Period Tracking Scope:**
   - *Option A (Simple manual flag):* Just mark period on/off per day.
   - *Option B (Cycle Calculation & Predictive Visuals - Chosen):* Calculate average cycle length from historical entries (default ~28 days) and show predicted future cycle windows with soft visual indicators on the calendar.

## User's Direction
- **Interaction:** Click directly on the day cell (Month Calendar & Timeline header) to open a quick check-in popover/dialog.
- **Data Logged:** Mood emoji, daily note text snippet, and period toggle (with flow intensity).
- **Cycle Intelligence:** Active period day logging + future cycle prediction indicators on the calendar view.
- **AI Adaptation:** Proactive trigger — immediately upon logging low energy / period, display an inline recommendation banner/prompt proposing 1-click schedule relief (deferring intense tasks, softening deadlines).

## Open Questions
- None. Requirements, UI triggers, and AI adaptation mechanisms are well-defined.

## Risks
- **Privacy & Sensitive Health Data:** Mood and menstrual cycle data are personal; ensure strict user-scoped isolation and no unwanted data leaks in public exports or shared views.
- **Cycle Irregularity:** Predictive cycle algorithms should gracefully handle irregular or missing logs without displaying erroneous warnings or confusing predictions.
- **AI Proposal Accuracy:** AI suggestions when user feels unwell must be helpful and non-intrusive (never auto-modifying schedule without explicit user 1-click confirmation).
