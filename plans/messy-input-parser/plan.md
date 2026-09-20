# Implementation Plan: Messy & Ultra-Short Shorthand NLP Input Engine

**Spec:** [`plans/messy-input-parser/spec.md`](file:///d:/6_OJT/adaptive-planner/plans/messy-input-parser/spec.md)  
**Mode:** Normal  
**Risk:** normal — Multi-file frontend and backend NLP expansion, strictly backward-compatible, no database schema changes.

---

## Architecture Overview

```
User Shorthand ("mai gym", "t2 8-10h hop", "8h java")
   │
   ▼
Frontend Tokenizer / Spring Boot AiPlannerService
   │
   ├── 1. NLP Shorthand Lexicon (Days, Times, Durations, Activities)
   ├── 2. Structured Contract (intent, title, date, startTime, endTime, durationMinutes, missingFields)
   └── 3. Gap Detection (missingFields: ["TIME" | "DURATION"])
   │
   ▼
Interactive Preview Card (Frontend)
   ├── Full Info  ──> Ready to Add with [Enter] / [Confirm]
   └── Missing Info ──> 1-Click Interactive Chips:
                          ├─ Duration: [30p] [1h] [2h]
                          └─ Time: [Sáng 08:00] [Chiều 14:00] [Tối 19:00]
   │
   ▼
Timetable Placement & Automatic Date Navigation
```

---

## Phases

- [x] **[Phase 1: Tokenizer & Contract Engine](file:///d:/6_OJT/adaptive-planner/plans/messy-input-parser/phase-01-tokenizer-and-contract.md)**
  - Expand Spring Boot `AiPlannerService.java` & Frontend local fallback with complete Vietnamese shorthand tokenizer (`8h java`, `mai 7h cafe 2h`, `t2 hop 9h`, `cn 14h gym`, `22h ngu`, `mai 3h dentist`).
  - Introduce `missingFields` detection (`TIME`, `DURATION`) and `durationMinutes` in `TimeBlockDto`.

- [x] **[Phase 2: Interactive Gap Filling Chips & Confirmation Preview](file:///d:/6_OJT/adaptive-planner/plans/messy-input-parser/phase-02-interactive-chips-and-preview.md)**
  - Enhance `PlannerView` in `AdaptiveApp.tsx` with interactive chip buttons for missing duration and contextual timeframes.
  - Clicking any chip updates `pendingActivity` in real-time with zero full-page reloads.

- [x] **[Phase 3: Routine-Informed Smart Autocomplete](file:///d:/6_OJT/adaptive-planner/plans/messy-input-parser/phase-03-routine-autocomplete.md)**
  - Connect `WeeklyRoutine` query into the prompt input box.
  - When user types matching routine keywords (e.g. `gym`), display a non-intrusive suggestion chip: *"🏋️ Gym · Thứ 3 & Thứ 5 · 18:00 · 1h"*.

- [x] **[Phase 4: Automated Tests & Verification](file:///d:/6_OJT/adaptive-planner/plans/messy-input-parser/phase-04-verification-and-tests.md)**
  - Add comprehensive JUnit integration tests covering 20/20 shorthand combinations.
  - End-to-end verification in browser.
