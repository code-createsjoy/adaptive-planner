# Phase 04: Honest Client Semantics and Mock Cleanup

**Stories:** S3 (P1), S5 (P1), G1 (P3 guardrail)  
**FRs:** FR-03, FR-15–18  
**Dependencies:** Phase 01; may run alongside Phases 02–03

## Goal

Remove fabricated runtime records and client fake-success across existing flows while preserving explicit drafts, harmless placeholders and backend deterministic algorithms.

## Concrete Files

- `package.json`, Vitest config/setup and test helpers
- `src/hooks/useTimeBlocks.ts`, `src/store/usePlannerStore.ts`, `src/components/adaptive/AdaptiveApp.tsx`
- `src/components/adaptive/TomorrowInboxDrawer.tsx`, notification components, related hooks/types
- Focused frontend tests and a production-source mock-audit allowlist/script

## Ordered Tasks

1. Add Vitest, jsdom, React Testing Library, user-event and jest-dom; add deterministic QueryClient render helpers and `test` scripts.
2. Remove hard-coded `InsightsView` and obsolete static `NotificationsView`; keep the real `NotificationsCenterView` and an empty Insights mount boundary.
3. Delete Zustand `mockScenarios`; initialize scenarios empty. Remove demo trigger/replay and runtime seeded activity.
4. Delete fabricated calm slots. Preserve selected task/input on failure and show explicit retry with no slot rows.
5. Delete local scenario/parser generation, including `generateLocalAdaptiveScenarios`, and current-day substitution. All such failures remain visible; backend deterministic fallbacks remain.
6. Delete `applyAdaptation`/batch-apply local fallback; rejection cannot set `adapted` or replace blocks.
7. Delete local create/update/delete/completion fallback and success-before-await. Preserve unsent drafts; announce success only after resolved mutation and invalidate/refetch.
8. Audit related goal/routine/inbox paths for the enumerated fake-success forms. Clearly type explicit local drafts versus persisted records.
9. Commit an allowlist for placeholders, suggested prompts, empty-state illustration, test fixtures and design-system fallback components; add an `rg`-based audit.

## Verification

- Forced failures for query, CRUD, completion, batch apply, parse/scenario, adaptation and calm openings render retryable errors with zero fabricated records.
- No success message appears before its promise resolves; retryable inputs remain available.
- Backend fallback tests remain and production fallback algorithms are not deleted.
- Audit rejects hard-coded Insights/notifications, `mockScenarios`, calm-slot records, local parser/scenario generation, current-day substitution, fake apply/CRUD/batch/completion and demo trigger.

## Rollback

Never restore fabricated data or fake-success catches. If a UI refactor must roll back, disable the action and show an error instead.

## Acceptance Gate

- Enumerated mocks are absent outside the allowlist.
- Forced failures produce no fake data/state mutation/success.
- Frontend tests, lint and build pass.

