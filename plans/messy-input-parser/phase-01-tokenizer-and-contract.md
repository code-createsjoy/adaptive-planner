# Phase 1: Shorthand Tokenizer & Structured Contract

**Parent Plan:** [`plans/messy-input-parser/plan.md`](file:///d:/6_OJT/adaptive-planner/plans/messy-input-parser/plan.md)  
**Spec Story:** P1 (Ultra-short shorthand parser & gap detection)

---

## Scope & Changes

### 1. Backend (`adaptive-planner-backend`)
- Update `TimeBlockDto.java` to include:
  - `durationMinutes`: Integer
  - `missingFields`: List<String> (`"TIME"`, `"DURATION"`)
  - `confidence`: Double
- Update `AiPlannerService.java`:
  - Enhance Groq System Prompt with explicit JSON schema for `missingFields` and `durationMinutes`.
  - Enhance `fallbackParseIntent` with rich regex tokens:
    - **Activity shorthands**: `java`, `cafe`, `gym`, `hop`, `meeting`, `boi`, `chay bo`, `ngu`, `xem phim`, `an toi`, `dentist`, `nha si`, `doc sach`.
    - **Shorthand days**: `mai`, `mốt`, `t2`, `t3`, `t4`, `t5`, `t6`, `t7`, `cn`, `thứ X`, `ngày D`.
    - **Shorthand hours**: `8h`, `7pm`, `19h`, `8-10h`, `18h tới 20h`, `mai 3h dentist` (maps to 15:00 for dentist).
    - **Duration extraction**: `2 tiếng`, `2h`, `30p`, `45 phút`, `1.5h`, `1h30`.
    - **Missing info flag**: If prompt has no start time (e.g. `mai gym`), set `missingFields = ["TIME"]`; if has start time but no explicit duration or end time (e.g. `mai 7h cafe`), default duration = 60m with flag `missingFields = ["DURATION"]`.

### 2. Frontend (`adaptive-planner-frontend`)
- Update `TimeBlock` and `TimeBlockDto` types in `src/types/planner.ts`.
- Mirror shorthand tokenizer in `AdaptiveApp.tsx` catch fallback.
