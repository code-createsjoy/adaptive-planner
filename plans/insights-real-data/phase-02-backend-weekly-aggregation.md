# Phase 02: Backend Weekly Aggregation and Rules

**Stories:** S1 (P1), S2 (P1), S3 (P1), S6 (P2, deferrable), G1 (P3 guardrail)  
**FRs:** FR-01–11, FR-20  
**Dependencies:** Phase 01

## Goal

Return one authoritative response based only on persisted TimeBlocks and AdaptationActions, with transparent coverage and deterministic evidence.

## Concrete Files

- `TimeBlockRepository.java`, `AdaptationActionRepository.java`
- New `controller/InsightsController.java`, `service/WeeklyInsightsService.java`
- Focused metric/rule/fingerprint collaborators and `dto/insights/*`
- New service/controller/repository tests

## Ordered Tasks

1. Add date-range queries and expected indexes for `time_blocks(event_date)` and `adaptation_actions(event_date)`; never load all rows or synthesize routines.
2. Resolve requested Monday/next-Monday/current cutoff using configured zone and Clock; reject non-Monday/future input.
3. Canonicalize rows: exclude cancelled overrides, classify completion/deferred, strictly parse times, report malformed exclusions, sort stable references.
4. Calculate scheduled/completed/deferred counts, planned minutes, planned high-energy minutes, scheduled buffer minutes and APPLIED versus UNDONE/ROLLED_BACK adaptation counts.
5. Calculate covered days. Below three days, return coverage/metrics but zero behavioral patterns/recommendations.
6. Implement independent rules: daypart completion (>=3 eligible blocks); high-energy load (>=3 blocks or >=240 minutes/day); transition coverage; adaptation choice distribution without wellbeing claims.
7. Attach neutral predefined observation tokens, sample size, confidence, dates/block/action refs, rule version and SHA-256 fingerprint. Canonical fingerprint input includes the referenced IDs plus every metric-affecting value/status so completion, time, energy, buffer, override or adaptation-status changes invalidate stale evidence.
8. Map eligible rules to a server-owned recommendation catalog. Return at most three, deterministically ordered, measurable and reversible.
9. Include selected and previous-week summaries in one response. P2 emits absolute deltas only when both meet coverage; otherwise an ineligibility reason. Implementation is deferrable while preserving the field.
10. Return stable validation/problem responses for client handling.

## Verification

- Exact fixtures cover calendar boundaries, configured zone, current partial week, persisted routine occurrences and cancelled overrides.
- Malformed/overnight/negative times are reported and excluded only from time-derived denominators.
- 0–2 covered days and per-rule thresholds emit no unsupported pattern.
- Golden tests assert ordering, confidence, refs, stable fingerprint, <=3 recommendations, and neutral/planned wording.
- Fingerprint tests prove identical canonical evidence is stable while changing completion/status/time/energy/buffer/override/adaptation final status changes the digest.
- Query count and large-fixture baseline are captured.

## Rollback

The endpoint is additive and read-only; disable route exposure without modifying schedule data.

## Acceptance Gate

- All P1 fixture metrics are exact.
- One response covers selected and previous week.
- Every emitted pattern/recommendation has rule key, sample, refs and fingerprint.
- Response declares `PERSISTED_OCCURRENCES_ONLY`.
