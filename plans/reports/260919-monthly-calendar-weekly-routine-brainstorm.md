# Brainstorm: Monthly Calendar Navigation & Weekly Routine Engine with Vietnamese Holidays

**Date:** 2026-09-19  
**Topic:** Transition from single-day mock timetable to real-world monthly calendar, recurring weekly templates, single-day overrides, and Vietnamese public holidays.

---

## Ideas Explored

1. **Option A (Pure Template + Day Overrides - Chosen Core):** Define recurring Weekly Routines (e.g. Mon–Fri Work, Tue/Thu Gym), auto-materialize/project onto the active month. Editing a specific date marks that block with `overrideType = MODIFIED` or `CANCELLED` without affecting the weekly template.
2. **Option B (Direct Calendar Add & Multi-Day Selector):** Manually pick dates on a calendar and assign blocks. High cognitive load if repeated daily, but valuable as a Quick Add / recurring shortcut.
3. **Automatic Holiday Purging vs. Badge & Informs (Chosen: Informs & Decides):** System detects Vietnamese public holidays (Lunar & Solar), displays festive badge 🇻🇳 and prompts user ("Would you like to pause today's routine?"). Respects the core principle: *"The system informs. The user decides."*
4. **Calendar UI Philosophy:** Monthly calendar serves as a minimalist high-level navigator with load dots & holiday flags rather than cramming 15 micro-tasks into small date boxes. Clicking a day navigates to the rich Visual Timeline of that specific date.

---

## User's Direction & Architectural Insights

> *"Routine $\rightarrow$ Reality $\rightarrow$ Adaptation. Kiến trúc này làm cho 'Adaptive' trở thành một phần của data model, chứ không chỉ là một tính năng AI: Routine là baseline, từng ngày là reality, override là adaptation."*

### Key Tenets:
1. **Wipe Mock Data:** Remove hardcoded initial mock blocks so the database stores real date-based schedules and user-defined routines.
2. **Data Model Separation:**
   - `WeeklyRoutine`: Baseline template rules (`dayOfWeek`, `startTime`, `endTime`, `title`, `category`, `energyLevel`, `enabled`).
   - `TimeBlock`: Concrete date-specific occurrences (`date`, `startTime`, `endTime`, `title`, `category`, `energyLevel`, `sourceType`, `sourceRoutineId`, `overrideType`).
3. **User Agency on Public Holidays:** Public holidays (Tết, 30/4, 1/5, 2/9, etc.) are highlighted. User can 1-click `[Keep schedule]`, `[Pause today's routine]`, or `[Customize today]`.
4. **Low Cognitive Load Calendar:** Clean monthly grid showing active days, load indicators, holiday tags, and instant drill-down into that day's timeline.

---

## Open Questions & Technical Considerations

1. **Materialization Strategy:** Should daily blocks be generated on-demand when a user views a date/month, or pre-generated in database batches for the active month? (Recommendation: On-demand generation/query with persistence of overrides for optimal storage and agility).
2. **Vietnamese Holiday Engine:** Built-in calculation for Solar holidays (1/1, 30/4, 1/5, 2/9) and Lunar holidays (Tết Nguyên Đán, Giỗ Tổ Hùng Vương 10/3 Âm lịch).

---

## Risks & Mitigations

- **Risk:** Cluttered calendar grid causing sensory overwhelm.
  - **Mitigation:** Strict navigation-first calendar: only display date numbers, subtle workload indicator dots (`●` low, `●●` medium, `●●●` high), and festive badges (`🇻🇳 Holiday`).
- **Risk:** Accidental routine corruption when user modifies a single day.
  - **Mitigation:** Database schema enforces immutable routine baseline; single-day edits create an explicit `TimeBlock` override row with `sourceRoutineId` and `overrideType`.
