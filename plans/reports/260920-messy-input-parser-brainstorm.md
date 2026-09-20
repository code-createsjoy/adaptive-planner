# Brainstorm: Messy & Ultra-Short Shorthand NLP Input Engine

**Date:** 2026-09-20
**Status:** Complete

---

## Ideas Explored

1. **Quick Shorthand (`8h java`, `mai 7h cafe`, `t2 hop 9h`, `cn 14h gym`):**
   Ultra-terse token patterns without grammar or filler words, prioritized for low cognitive load and fast thought-dumping.
2. **Casual Text & Conversational Prompts (`chiều mai đi bơi`, `tối nay rảnh ko set 8h xem phim`):**
   Natural conversational queries that extract approximate intervals (afternoon, evening) with zero hallucinations.
3. **Interactive Missing Info Resolution (Slot/Chip Quick Picker):**
   Instead of hallucinating missing time/duration (e.g. `mai gym` with no time specified), system prompts minimal 1-click chips (`[Morning] [Afternoon] [Evening]`, `[30m] [1h] [2h]`).
4. **Smart Autocomplete & Routine Habit Suggestion:**
   Passive assist bar suggesting historical routines when typing keywords (e.g. typing `gym` shows `🏋️ Gym · Today · 18:00 · 1h`), non-intrusive.
5. **Multi-Event Thought-Dump Extraction (P2/P3):**
   Splitting compound statements (`mai 7h cafe 2h, chiều gym, tối làm assignment...`) into distinct proposals with conflict & energy management.
6. **Robust Validation Pipeline:**
   AI acts as an untrusted structured-output generator; Spring Boot backend strictly validates date/time, end > start, holiday conflicts, and energy buffer rules before placing.

---

## User's Direction

- **Core Priority Order:** `Quick Shorthand` → `Casual Text` → `Smart Autocomplete`.
- **Signature UX:** "AI understands messy input" — users dump thoughts naturally without needing to speak like a calendar form.
- **Strict No-Assumption Principle:** AI must parse without assuming missing key parameters; use quick clickable options (`[30 min] [1 hour] [2 hours]`) to fill gaps without forcing retyping.
- **Workflow:** `User types shorthand` $\rightarrow$ `Structured NLP parse` $\rightarrow$ `Confirmation preview card` $\rightarrow$ `One-click/Enter Add to timetable`.

---

## Open Questions

1. **Multi-Event Parsing in MVP:** Should multi-event parsing (multiple activities in one prompt) be part of P1 or deferred to P2 after single-event shorthand is fully refined? *(Proposed: P1 focused on robust single-event shorthand + missing info chips; P2 adds multi-event parser)*.
2. **Routine History Learning Storage:** Should routine frequency suggestions (e.g. `gym -> Tue/Thu 18:00`) be derived directly from existing `WeeklyRoutine` table or a dedicated usage log? *(Proposed: Read existing `WeeklyRoutine` entries for matching titles)*.

---

## Risks

1. **Ambiguity in 12h vs 24h Time (`mai 3h dentist`):**
   - *Risk:* `3h` could mean 03:00 AM or 15:00 PM.
   - *Mitigation:* Business/social activities (dentist, meeting, cafe) default to reasonable waking hours (15:00), or prompt a quick chip selector if ambiguous.
2. **Regex Fallback vs LLM Parity:**
   - *Risk:* When LLM API is unavailable, the deterministic regex parser must provide an identical, rich experience for common abbreviations (`mai`, `mốt`, `t2`..`t7`, `cn`, `hop`, `cafe`, `gym`).
