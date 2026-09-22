# Plan: Real-data Weekly Insights and Runtime Mock Removal

**Date:** 2026-09-21  
**Spec:** `plans/insights-real-data/spec.md`  
**Brainstorm:** `plans/reports/260921-insights-real-data-brainstorm.md`  
**Mode:** hard  
Risk: high-risk — adds persisted InsightExperiment state, changes notification delivery semantics, and removes client fallback behavior across existing user flows.

---

## Scope Challenge

- **Exists:** The navigation target exists, but `InsightsView` is hard-coded; timeline completion is local-only, and scheduled notifications are exposed before due.
- **Minimum:** Persist completion, aggregate persisted occurrences for a truthful P1 week, save one idempotent experiment/reminder without schedule writes, and remove the enumerated mocks/fake-success paths.
- **Complexity:** Hard: schema, time semantics, aggregation, notifications, frontend architecture, and failure behavior all change.
- **P2 deferral:** Previous-week deltas and dismiss suppression remain optional after P1 gates pass.
- **P3 guardrail:** No actual-time/subjective-energy tracking, long-term/AI analytics, auto-scheduling, or historical routine reconstruction.

## Story IDs

| ID | Priority | Story |
|---|---|---|
| S1 | P1 | Factual Monday–Sunday summary |
| S2 | P1 | Patterns show evidence and sample size |
| S3 | P1 | Honest insufficient/error states |
| S4 | P1 | Save one next-week experiment/reminder with zero schedule writes |
| S5 | P1 | Remove runtime mocks and fake-success behavior |
| S6 | P2, deferrable | Compare with previous eligible week |
| S7 | P2, deferrable | Persist dismissal and suppress unchanged recommendation |
| G1 | P3 guardrail | Exclude actual-time, subjective energy, long-term and AI analytics |

## Locked Architecture and Semantics

```text
src/features/insights (TanStack Query; no Zustand server state)
  -> GET /api/insights/weekly?weekStart=YYYY-MM-DD
  -> save/dismiss canonical recommendation
  -> OPEN_INSIGHTS notification action

InsightsController -> WeeklyInsightsService
  -> persisted TimeBlockEntity + AdaptationActionEntity range queries
  -> deterministic metric/rule evaluators -> SHA-256 evidence fingerprint
InsightExperimentService (transaction)
  -> InsightExperimentEntity + scheduled NotificationEntity
  -> zero TimeBlock/WeeklyRoutine writes
```

- Configure `app.insights.timezone` (default `Asia/Ho_Chi_Minh`) and inject `Clock`.
- Require Monday `weekStart`; query `[Monday, next Monday)`. For the current week, `dataThrough` is the Clock-derived local date and records stop before the following local midnight; reject future weeks and label current week **Week so far**.
- P1 is explicitly `PERSISTED_OCCURRENCES_ONLY`: do not synthesize historical occurrences from mutable `WeeklyRoutine` templates. Completing a virtual routine occurrence must first materialize a persisted `(sourceRoutineId, eventDate)` override through an occurrence-aware endpoint.
- Exclude `overrideType=CANCELLED`; completion is only `isCompleted=true`; `DEFERRED` comes from status. Never call planned duration actual time.
- Parse `HH:mm` strictly. Invalid, zero/negative, and cross-midnight intervals are excluded from duration/daypart/transition denominators and counted under malformed coverage.
- Dayparts by start time: morning `[05:00,12:00)`, afternoon `[12:00,17:00)`, evening `[17:00,24:00)` plus `[00:00,05:00)`.
- A transition opportunity is a valid adjacent non-buffer pair on one date. Coverage requires an intervening explicit buffer or gap >=10 minutes; overlaps are uncovered.
- Confidence by eligible sample: `LOW=3–4`, `MEDIUM=5–8`, `HIGH>=9`; never emit below the rule threshold.
- Fingerprint SHA-256 over rule key/version, source week, and a canonical sort of evidence references plus the metric-affecting values/statuses (completion, status, times, energy, buffer/override state and adaptation final status), so changed evidence cannot reuse a stale fingerprint.
- One response contains selected and previous-week summaries/eligibility, staying within the two-request budget.
- Save/dismiss accepts rule key + fingerprint. Server regenerates the canonical recommendation; stale evidence returns `409`.
- P1 is explicitly a single-user deployment using one configured canonical user key; TimeBlock and Adaptation queries are not described as user-isolated until ownership exists.
- Unique idempotency scope is canonical user key + source week + rule key + evidence fingerprint. Save experiment and reminder transactionally behind database-enforced uniqueness.
- Routine occurrence materialization is idempotent under concurrency through a database-enforced unique key on `(source_routine_id, event_date)` for non-null routine occurrences; a losing transaction rolls back before rereading the winner.
- Store scheduled instants in UTC and derive next Monday 09:00 from the configured IANA zone. Notifications are listable, countable, readable, read-all eligible, and deletable only when `scheduledFor IS NULL OR scheduledFor <= Clock.instant()`; reminder action is validated `OPEN_INSIGHTS` with source week.
- Add an explicit schema migration/baseline strategy for the experiment table, notification schedule conversion and unique indexes. `ddl-auto:update` alone is not an exactly-once guarantee.
- Opening Insights may trigger at most two requests before ready: the weekly endpoint plus the persistent shell unread-count request. View-specific timetable, holiday, conversations, adaptations, goals, subtasks and notification-list queries must be disabled outside their owning views.
- The Insights weekly GET uses a 1,000 ms client timeout/abort policy so a hung request reaches the required retryable error state.

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-21 20:11
**Phase in progress:** phase-03-experiments-and-due-notifications
**Status:** Phase 03 completed and 67/67 backend tests passing.

### Decisions made this session
- Implemented `InsightExperimentEntity`, `InsightExperimentRepository`, and `InsightExperimentService`.
- Added idempotent save & dismiss endpoints (`POST /api/insights/experiments`, `POST /api/insights/experiments/dismiss`).
- Connected experiment saving to schedule next Monday 09:00 reminder via `NotificationService` exactly once.
- Stale fingerprint verification raises `ConflictException` (409).
- Populated `experimentState` in `WeeklyInsightsResponse`.

### Next immediate action
Proceed to Phase 04: Honest Client and Mock Cleanup & Phase 05: Dedicated Insights UI.

## Phases

| Phase | Stories / FRs | Outcome |
|---|---|---|
| [x] [01](phase-01-contracts-semantics-and-completion.md) | S1,S3,S5; FR-01,03–06,09,17,20; G1 | Freeze contract/time semantics and persist completion. |
| [x] [02](phase-02-backend-weekly-aggregation.md) | S1–S3,S6; FR-01–11,20; G1 | Deterministic weekly endpoint, evidence and recommendations. |
| [x] [03](phase-03-experiments-and-due-notifications.md) | S4,S7; FR-02,08,11–14 | Idempotent experiment/reminder and due-only notification delivery. |
| [ ] [04](phase-04-honest-client-and-mock-cleanup.md) | S3,S5; FR-03,15–18; G1 | Remove enumerated mocks and fake-success paths. |
| [ ] [05](phase-05-insights-ui-and-deep-link.md) | S1–S7; FR-02,06,08–14,19–20 | Dedicated Insights UI, actions and reminder deep link. |
| [ ] [06](phase-06-verification-performance-and-audit.md) | S1–S7; FR-01–20; G1 | Correctness, safety, accessibility, performance and audit gates. |

## Dependencies and Release

1. Phase 1 precedes metrics; Phase 2 produces canonical fingerprints for Phase 3.
2. Phase 4 may run after Phase 1 but must finish before Phase 5; Phase 5 depends on Phases 2–4.
3. Phase 6 gates release. P2 may be disabled with stable optional fields; P1 must stay coherent.
4. Rollback may unmount Insights/disable its endpoints without deleting experiment data. Never restore fake-success fallbacks. Keep completion persistence and due-only notification filtering.
5. Before implementation, capture the dirty-worktree diff and ownership of every planned edit target. Reconcile existing modified/untracked notification, entity, repository, API and `AdaptiveApp` work; never recreate or overwrite those files blindly.

## Global Acceptance Gates

- Exact weekly fixtures and timezone/date-boundary tests pass.
- Save retry creates one experiment/reminder and zero `time_blocks`/`weekly_routines` writes.
- Initial Insights load uses one weekly request and no more than two application requests.
- Weekly endpoint p95 is below 800 ms for 10,000 blocks + 5,000 adaptations.
- Production-source audit finds no unallowlisted runtime mock/demo/fake-success path.
- Backend tests and frontend tests/lint/build pass from fresh commands.

## Red-Team Adjudication

- **ACCEPTED:** materialize routine occurrences through an idempotent `(routineId,date)` completion API before counting them.
- **ACCEPTED:** lazy/conditionally enable view queries and define the two-request budget as weekly Insights + shell unread count.
- **ACCEPTED:** gate direct notification read/delete operations, store schedule instants in UTC, and use injected Clock.
- **ACCEPTED:** make database migrations and unique constraints release prerequisites; recover races only after the losing transaction rolls back.
- **ACCEPTED:** state single-user P1 honestly; user-scoped analytics require a separate ownership migration.
- **ACCEPTED:** require a dirty-worktree ownership/diff preflight before Phase 1 edits.
- **ACCEPTED:** implement a 1,000 ms Insights GET timeout to make the spec's error timing verifiable.
- **ACCEPTED:** protect first-time routine occurrence materialization with database uniqueness and a concurrent double-submit test.
