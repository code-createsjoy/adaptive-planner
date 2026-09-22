# Phase 06: Verification, Performance, and Audit

**Stories:** S1–S5 (P1), S6–S7 (P2, deferrable), G1 (P3 guardrail)  
**FRs:** FR-01–20  
**Dependencies:** Phases 01–05

## Goal

Prove correctness, safety, honesty, performance, accessibility and mock removal before enabling the redesign.

## Concrete Files

- Backend/frontend tests and test-only fixtures
- Mock-audit allowlist/script and verification evidence
- Optional test-only performance profile; never production seed data

## Ordered Tasks

1. Run fixed-Clock backend suites for boundaries, metrics/rules, idempotency, stale fingerprints, rollback, zero schedule writes and due filtering.
2. Run frontend suites for all Insights states, navigation/actions/deep link and every removed fake-success failure.
3. Seed test-only 10,000 TimeBlocks + 5,000 AdaptationActions; record warm p95/query count. Add indexes/projections until below 800 ms without semantic shortcuts.
4. Instrument initial Insights open; require one weekly request plus at most one shell unread-count request, with all other view queries disabled until their view mounts.
5. Run the production mock audit and manually adjudicate every ambiguous `mock`, `sample`, `demo`, `fallback` match against the allowlist.
6. Perform keyboard/automated accessibility checks, including async live regions and contrast.
7. Run full backend tests and frontend tests/lint/build; inspect diff for seeds, secrets, unrelated changes or removed backend deterministic fallbacks.
8. Record P2 ship/defer choice. If deferred, verify explicit optional/ineligible fields and no P1 dependency.

## Verification Commands

```powershell
cd adaptive-planner-backend
mvn test

cd ..\adaptive-planner-frontend
npm test -- --run
npm run lint
npm run build

cd ..
rg -n -i "mock|sample|demo|fallback" adaptive-planner-frontend/src adaptive-planner-backend/src/main
```

The committed allowlist/audit script must explain harmless matches rather than silently ignore them.

## Rollback

Do not enable navigation if any P1 gate fails. Additive API/table/UI may be disabled; completion persistence, honest errors and due-only filtering remain.

## Acceptance Gate

- Exact fixture, safe-save and notification suites pass.
- Existing-database migration, experiment and routine-occurrence database uniqueness, concurrent occurrence materialization and concurrent experiment-save tests pass.
- p95 <800 ms and request budget passes.
- Zero unallowlisted production runtime mock/fake-success paths.
- Full tests/lint/build pass from fresh invocations.
- Accessibility/tone checks pass and P3 features/claims are absent.
