# Phase 05: Dedicated Insights UI and Deep Link

**Stories:** S1–S5 (P1), S6–S7 (P2, deferrable)  
**FRs:** FR-02, FR-06, FR-08–14, FR-19–20  
**Dependencies:** Phases 02, 03 and 04

## Goal

Build a calm dedicated Insights feature that renders only server facts, supports week navigation and safe experiment actions, and opens from due reminders.

## Concrete Files

- New `src/features/insights/{api,types,hooks,InsightsView}.ts(x)`, focused components/copy helpers/tests
- `src/components/adaptive/AdaptiveApp.tsx`
- `src/components/adaptive/NotificationsCenterView.tsx`, notification action types/routing

## Ordered Tasks

1. Add typed API calls and TanStack Query keys by Monday; keep weekly server state out of Zustand.
2. Make `AdaptiveApp` only mount `<InsightsView />` and pass navigation context; it owns no metric/rule logic. Add `enabled`/lazy-mount boundaries so timetable, holiday, conversation, adaptation, goal, subtask and notification-list queries run only in their owning views. Keep the shell unread-count query as the one allowed companion request.
3. Implement previous/current navigation, disable future weeks, label **Week so far**, and display timezone/data-through/persisted-occurrence coverage.
4. Implement the weekly GET with a 1,000 ms `AbortController` timeout and mutually exclusive loading, retryable error, insufficient and ready states; preserve selected week and never render stale/sample metrics in error/insufficient states.
5. Render **What happened** solely from response fields, using planned-duration wording; compose the gentle story from fixed neutral templates.
6. Render **Patterns worth noticing** and **What your adaptations protected** with sample count and expandable source dates/block/action refs.
7. Render at most three **Try next week** cards. Await save, show server reminder date/saved state, prevent duplicate submission, and never touch timetable/routine caches.
8. P2 (deferrable): show absolute deltas only when server says eligible; otherwise omit/explain. Add dismiss UI only when persistence/suppression is enabled.
9. Handle validated `OPEN_INSIGHTS`: navigate to source week, then mark notification read; never execute arbitrary action data.
10. Add semantic headings, keyboard order, focus visibility, live async feedback and WCAG 2.1 AA contrast.

## Verification

- RTL covers loading, error/retry, 0–2-day insufficient, ready, **Week so far**, previous navigation and disabled future navigation.
- Query-spy tests prove opening Insights triggers exactly one weekly request plus at most the shell unread-count request and does not fetch other view data.
- Fake timers prove a hung weekly request aborts and renders retry within the one-second requirement.
- Every rendered number maps to a fixture response field; every pattern exposes sample/evidence.
- Save success/failure/idempotent UI calls no schedule API and renders <=3 cards.
- `OPEN_INSIGHTS` selects the correct week and rejects malformed action data.
- P2 tests hide ineligible deltas and honor server suppression.

## Rollback

Unmount Insights while preserving backend data. Notification action may fall back to the notification center, never a schedule mutation.

## Acceptance Gate

- Feature boundary exists and `AdaptiveApp` contains no aggregation rules.
- All data/action/deep-link states pass RTL tests.
- UI invents no numbers and makes no causal, diagnostic or score claim.
- P2 may be omitted without degrading P1.
