# Phase 01: Contracts, Semantics, and Completion Persistence

**Stories:** S1 (P1), S3 (P1), S5 (P1), G1 (P3 guardrail)  
**FRs:** FR-01, FR-03–06, FR-09, FR-17, FR-20  
**Dependencies:** None

## Goal

Make source data trustworthy before aggregation: freeze weekly semantics and persist completion instead of toggling only Zustand.

## Concrete Files

- Backend: `application.yml`, new `config/InsightsProperties.java`, `config/TimeConfig.java`, new `dto/insights/*`, `TimeBlockController.java`, `TimeBlockService.java`, schema migration for routine-occurrence uniqueness, tests.
- Frontend: new `src/types/insights.ts`; `src/lib/api.ts`, `src/hooks/useTimeBlocks.ts`, `src/store/usePlannerStore.ts`, `src/components/adaptive/AdaptiveApp.tsx`.

## Ordered Tasks

1. Define response/request DTOs: boundaries/timezone/data-through, coverage limitation/exclusions, metrics, patterns/evidence, recommendations, experiment state and previous-week eligibility.
2. Bind `app.insights.timezone` with default `Asia/Ho_Chi_Minh`; provide injectable `Clock` for Insights and notifications.
3. Encode Monday validation, current-week cutoff, strict times, dayparts, transition opportunities, confidence and fingerprint input as shared documented semantics.
4. Run a mandatory worktree preflight: capture diffs and file ownership for every modified/untracked entity, repository, notification, API and `AdaptiveApp` target; reconcile in-place and stop rather than overwrite unknown work.
5. For persisted custom blocks, confirm TimeBlock update persists `isCompleted` idempotently.
6. Add an occurrence-aware completion endpoint keyed by `(routineId, date)`. It materializes or updates a `sourceType=ROUTINE`, `sourceRoutineId`, `overrideType=MODIFIED` TimeBlock row copied from the template, supports complete and uncomplete idempotently, and rejects a cancelled occurrence rather than silently reviving it. Add a database-enforced composite unique key on non-null `(source_routine_id, event_date)` rows; on a racing first insert, let the loser transaction roll back before rereading the winner.
7. Replace `onToggleComplete={toggleComplete}` with an awaited server mutation that selects the custom-block or routine-occurrence path; invalidate/refetch only after success and show retryable error on rejection.
8. Remove local completion write responsibility from Zustand. Keep Zustand only for UI/draft state; TanStack Query owns persisted records.
9. Lock P1 to one configured canonical user key and describe TimeBlock/Adaptation aggregation as single-user rather than authenticated isolation.
10. Keep backend deterministic parse/scenario/task-breakdown fallbacks; prohibit LLM calls and routine reconstruction in Insights.

## Verification

- Backend: completion survives refetch; failed update leaves storage unchanged.
- Routine occurrence tests cover first materialization, repeat complete, concurrent double-submit, uncomplete, cancelled conflict, two different dates, database uniqueness and stable persisted evidence IDs.
- Frontend: click sends correct value; success invalidates; rejection shows error and no success state.
- Fixed-Clock tests cover Monday, Sunday, month/year crossing, leap day, current cutoff and future-week rejection.
- `rg` confirms the timeline no longer uses local-only `toggleComplete`.

## Rollback

The contract and completion endpoint are backward compatible. Retain persisted completion and honest errors even if Insights UI is rolled back.

## Acceptance Gate

- Completion is persisted/refetchable.
- Virtual routine completion materializes one date-scoped override that the aggregator can count without reconstructing history.
- Backend/frontend types agree on the weekly contract.
- Boundary tests pass and P3 claims/synthetic routine history are absent.
