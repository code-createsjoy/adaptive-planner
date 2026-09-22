# Phase 03: Experiments and Due-only Notifications

**Stories:** S4 (P1), S7 (P2, deferrable)  
**FRs:** FR-02, FR-08, FR-11–14  
**Dependencies:** Phase 02

## Goal

Persist a canonical recommendation and next-Monday reminder exactly once, with no schedule writes, and hide future notifications until due.

## Concrete Files

- New `InsightExperimentEntity.java`, `InsightExperimentRepository.java`, experiment DTOs/service and explicit schema migration(s)
- `InsightsController.java`
- `NotificationEntity.java`, `NotificationRepository.java`, `NotificationService.java`
- Backend service/integration tests

## Ordered Tasks

1. Add experiment fields: canonical configured user key, source week, rule key/version, canonical title/rationale snapshot, evidence fingerprint, UTC reminder instant, status and timestamps.
2. Introduce an explicit migration/baseline strategy that creates the experiment table and database-enforced unique/index constraints and safely converts/adds UTC notification scheduling fields. Migration success on an existing non-empty PostgreSQL database is a release prerequisite; retain H2-compatible test schema handling.
3. Save transaction regenerates canonical candidates, matches rule key/fingerprint, returns `409` on stale evidence, derives next Monday 09:00 in the configured IANA zone, converts it to UTC, and writes experiment + one reminder.
4. Use deterministic notification event key/action `OPEN_INSIGHTS`. Put the insert in a transaction boundary that fully rolls back on unique violation; only then may an outer non-transactional handler reread and return the winning row. Never query inside a rollback-only transaction.
5. Prove with row counts/spies that save/dismiss/archive never call or change TimeBlock/WeeklyRoutine persistence.
6. Change notification list, unread-count, direct mark-read, read-all and delete operations to due rows only (`scheduledFor null or <= Clock.instant()`) and the canonical user key. Do not set `deliveredAt` when creating a future reminder; inject Clock into every creation/read path instead of calling wall-clock time directly.
7. P2 (deferrable): persist dismiss, suppress the same fingerprint until evidence changes or four calendar weeks pass; keep optional contract fields stable if deferred.
8. Validate source-week action data; reject arbitrary navigation payloads.

## Verification

- Duplicate/concurrent save produces one experiment and one notification.
- Migration tests verify the real unique constraints/indexes exist before concurrency tests run.
- Stale/unknown/suppressed candidate creates nothing; transaction failure rolls back both rows.
- Before due: reminder absent from list/count/direct read/read-all/delete. At due: visible with valid deep link; timezone conversion and the 09:00 local reminder are fixed-Clock tested.
- Before/after assertions prove zero TimeBlock/WeeklyRoutine writes.
- P2 tests cover unchanged, changed-fingerprint and four-week expiry behavior.

## Rollback

Disable save/dismiss/reminder creation but retain additive rows. Keep due-only notification filtering as an independent correctness fix.

## Acceptance Gate

- S4 exactly-once and zero-schedule-write tests pass.
- No scheduled notification is exposed early.
- P2 can be disabled without changing P1 save semantics.
