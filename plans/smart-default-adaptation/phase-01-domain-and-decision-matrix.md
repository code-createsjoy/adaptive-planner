# Phase 01: Domain Model & Multi-Factor Decision Matrix

**Parent Plan:** [plans/smart-default-adaptation/plan.md](file:///d:/6_OJT/adaptive-planner/plans/smart-default-adaptation/plan.md)  
**Spec Stories:** [P1], [P2]  

---

## 1. Goal
Extend domain entities in both backend (`TimeBlockEntity`, `TimeBlockDto`) and frontend TypeScript (`TimeBlock`, `PlannerTypes`) to support:
- `priority`: `PROTECTED | HIGH | NORMAL | FLEXIBLE`
- `deadline`: string (ISO date/time)
- `isMovable`: boolean (default `true`, `false` if fixed)
- `status`: `ACTIVE | DISRUPTED | DEFERRED | SCHEDULED`
- `inboxDate`: string (YYYY-MM-DD)

Implement the **Multi-Factor Decision Matrix** in `AiPlannerService.java` and local deterministic TypeScript engine.

---

## 2. Technical Tasks

### Backend (`adaptive-planner-backend`)
1. **`TimeBlockEntity.java` & `TimeBlockDto.java`:**
   - Add `@Column` for `deadline`, `isMovable`, `status`, `inboxDate`, `preferredTimeRange`.
   - Update `TimeBlockService.java` entity mapping.
2. **`AiPlannerService.java`:**
   - Update Groq system prompt to evaluate:
     1. Hard constraints (Urgent events, fixed meetings)
     2. Protected blocks (Keep inviolable)
     3. Deadline urgency (Nearest deadline takes precedence)
     4. Disruption minimization (Change fewest blocks)
     5. Shift flexible tasks or defer to tomorrow.
   - Return structured `SmartDefaultResponseDto`:
     - `recommendedScenario`: single best scenario option.
     - `alternativeScenarios`: 2-3 alternative options.
     - `explanation`: `{ whatChanged, whatWillHappen, reasons: string[], confidenceLevel }`.
   - Update `fallbackGenerateScenarios` with local multi-factor scoring matrix.

### Frontend (`adaptive-planner-frontend`)
1. **`types/planner.ts`:**
   - Update `TimeBlock` interface with new fields.
   - Define `SmartDefaultRecommendation`, `ExplanationDetails`.
2. **`lib/api.ts` & `hooks/useTimeBlocks.ts`:**
   - Update request/response types for `/planner/reschedule-scenarios`.

---

## 3. Verification Criteria
- [ ] Database schema migrations or update automatically maps new columns.
- [ ] Backend tests confirm: A task with `NORMAL` priority and a deadline tonight is preserved over a `HIGH` priority task with a 7-day deadline.
- [ ] `PROTECTED` blocks (e.g. Sleep, Family dinner) are never overwritten or invaded.
