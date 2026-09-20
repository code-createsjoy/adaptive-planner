# Spec: Messy & Ultra-Short Shorthand NLP Input Engine

**Date:** 2026-09-20  
**Status:** Ready  

---

## Problem Statement
Neurodivergent users experiencing cognitive overload or executive dysfunction struggle with rigid calendar forms and wordy conversational prompts. They need to rapidly dump messy, abbreviated thoughts (e.g. `mai 7h cafe`, `t2 8-10h hop`, `cn 14h gym`) and have the system parse intent accurately, resolve missing parameters via 1-click chips, and present a low-friction confirmation preview before placing it on the timetable.

---

## User Stories

<!-- P1 = MVP (must ship), P2 = nice-to-have, P3 = future/out-of-scope -->

- **[P1]** As a busy/neurodivergent user, I want to type ultra-short abbreviations (e.g., `8h java`, `mai 7h cafe 2h`, `t2 hop 9h`, `cn 14h gym`, `22h ngu`) so that I can schedule events in seconds without writing full sentences.  
  *Accepted when:* Single-input shorthand is parsed into correct `title`, `date`, `startTime`, `endTime`, `category`, and `energyLevel` with $>95\%$ test coverage across common Vietnamese/English patterns.

- **[P1]** As a user providing incomplete shorthand (e.g., `mai gym` with no time, or `mai 7h cafe` with unknown duration), I want the system to show a clean confirmation card with 1-click option chips (e.g., `[Sáng] [Chiều] [Tối]`, `[30p] [1h] [2h]`) so that I can complete the missing details without re-typing.  
  *Accepted when:* Missing time/duration triggers clickable chips directly on the preview card, updating the proposal in real-time.

- **[P1]** As a user who types casual natural language (e.g., `chiều mai đi bơi`, `tối nay rảnh ko set 8h xem phim`), I want the AI to parse the contextual timeframe without hallucinating or forcing arbitrary constraints.  
  *Accepted when:* Approximate timeframes (sáng/chiều/tối) prompt quick time suggestions (e.g. `14:00`, `16:00`, `18:00`), and exact times are slotted directly into the preview.

- **[P2]** As a user typing repeating habits (e.g. `gym`, `họp`), I want smart autocomplete suggestions to pop up based on my configured `WeeklyRoutine` entries so that I can fill common routines in a single keystroke.  
  *Accepted when:* Typing matching routine keywords displays dropdown suggestion chips showing `[Title · Day · Usual Time · Duration]`.

- **[P2]** As a power user dumping a compound day plan (e.g., `mai 7h cafe 2h, chiều gym, tối làm assignment nhưng 5h có meeting`), I want multi-event breakdown to split and propose a cohesive timetable.  
  *Accepted when:* Multi-clause prompts generate a batch adaptation preview with zero-guilt transition buffers.

- **[P3]** Voice-to-shorthand live audio stream parsing directly into preview cards.

---

## Functional Requirements

1. **FR-01 (Shorthand Tokenizer & Lexicon):**
   - Parse abbreviations:
     - Days: `mai`, `mốt`, `hôm nay`, `t2`, `t3`, `t4`, `t5`, `t6`, `t7`, `cn`, `thứ X`, `ngày D`, `D/M`, `D/M/YYYY`.
     - Time ranges: `8h-10h`, `8-10h`, `8h đến 10h`, `8:00 - 10:00`, `18h tới 20h`.
     - Single start times: `8h`, `7pm`, `19h`, `lúc 9h`.
     - Durations: `2 tiếng`, `2h`, `30p`, `45 phút`, `1.5h`, `1h30`.
     - Activity keywords: `cafe`, `gym`, `hop`, `meeting`, `hoc`, `study`, `boi`, `chay bo`, `ngu`, `xem phim`, `an toi`.
2. **FR-02 (Structured Output Contract):**
   Backend and LLM parser must adhere to the schema:
   ```json
   {
     "intent": "CREATE_EVENT",
     "title": "string",
     "date": "YYYY-MM-DD",
     "startTime": "HH:mm",
     "endTime": "HH:mm",
     "durationMinutes": 60,
     "category": "work" | "social" | "health" | "rest" | "urgent" | "transition",
     "energyLevel": "high" | "medium" | "low",
     "confidence": 0.95,
     "missingFields": ["TIME" | "DURATION"]
   }
   ```
3. **FR-03 (Interactive Gap Filling Chips):**
   - If `missingFields` contains `"DURATION"`, display quick buttons: `[30 phút]` `[1 tiếng]` `[2 tiếng]` `[Khác]`.
   - If `missingFields` contains `"TIME"`, display contextual slots:
     - If "sáng": `[08:00] [09:30] [10:30]`
     - If "chiều": `[14:00] [15:30] [17:00]`
     - If "tối": `[19:00] [20:00] [21:00]`
4. **FR-04 (Zero-Hallucination Validation Gate):**
   Backend validates that `endTime > startTime`, `date` is valid, and checks against statutory holidays and existing timetable blocks for the target date before generating TimeBlocks.
5. **FR-05 (Routine-Informed Smart Defaults):**
   If prompt lacks time/duration but user has an existing enabled `WeeklyRoutine` matching the title (e.g. `gym`), display: *"Based on your usual routine: 18:00–19:00 [Add] [Change]"*.

---

## Non-Functional Requirements

- **Latency:** Deterministic heuristic fallback parses in $<20\text{ms}$; Groq LLM parses in $<1.2\text{s}$.
- **Resilience:** If Groq API key is missing or network fails, 100% of shorthand test cases pass via local Java & TypeScript tokenizer.
- **Accuracy:** Zero false duplicate warnings when scheduling for empty dates.

---

## Success Criteria

- [ ] Parsing shorthand benchmark: 20/20 test cases (`8h java`, `mai 7h cafe 2 tiếng`, `cn 14h gym`, `t2 8-10h hop`, `chiều mai đi bơi`, `tối nay xem phim 2 tiếng`, `22h ngủ`, `mai 3h dentist`) resolve with 100% correct date, time, and title.
- [ ] Missing time/duration triggers interactive chips on confirmation card without requiring manual re-typing.
- [ ] One-click "Add to timetable" or pressing `Enter` seamlessly commits the block and navigates to the target date.

---

## Out of Scope

- Audio voice transcription streaming (handled via standard browser Web Speech API).
- Automatic external Google/Outlook Calendar two-way sync (reserved for dedicated integration spec).

---

## Assumptions

- Users prioritize speed and minimal cognitive strain over strict grammatical precision.
- Default duration is 60 minutes if unspecified and not prompted via chips.
