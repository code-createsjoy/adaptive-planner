# Brainstorm: Redesign Insights with real weekly data and remove mocks

**Date:** 2026-09-21

## Ideas Explored

1. **Weekly reflection dashboard** — summarize what happened from Monday through Sunday using completed, deferred, scheduled, adaptation, and buffer data. Useful for self-understanding, but insufficient alone because it does not help the next week.
2. **Recommendation-first coach** — immediately suggest schedule changes based on observed patterns. Actionable, but risks feeling judgmental or making weak recommendations when little data exists.
3. **Paired evidence-and-experiment cards** — each card states an observed pattern, shows the supporting records, then offers one small experiment for next week. This combines reflection and improvement without turning Insights into a productivity score.
4. **Frontend-only aggregation** — load raw TimeBlocks and AdaptationActions and compute the week in React. Fast initially, but requires multiple requests, mixes analytics into an already large UI component, and weakens consistency.
5. **Backend-generated analytics** — return a complete weekly insights response from one endpoint. Centralizes rules and tests, but risks coupling presentation language to the backend.
6. **Hybrid weekly insights** — backend owns date boundaries, factual aggregation, evidence, and saved experiments; frontend owns narrative presentation and simple display derivations. This is the selected direction.
7. **Event-stream analytics** — capture every schedule interaction as an event and precompute analytics. Powerful for long-term behavior analysis, but unnecessary for the current product scale.

## User's Direction

The user wants Insights to do both jobs: help people understand their behavior and offer gentle improvements for the following week. Weeks use a Monday–Sunday calendar boundary. Selecting **Try next week** only saves the suggestion and schedules a reminder; it must not modify routines or TimeBlocks.

The selected architecture is hybrid. The backend supplies truthful weekly metrics and persists accepted experiments. The frontend turns those facts into a calm weekly story, evidence-backed cards, and empty/error states.

“Remove all mocks” was narrowed to removing fabricated static runtime data and client-side fake-success behavior. Backend deterministic AI fallbacks remain because they are functional algorithms operating on real input, not mock records.

## Open Questions

- No blocking product questions remain for planning.
- Planning should choose whether weekly insight rules live in one service or separate metric/pattern evaluators without changing the response contract.
- Planning should decide how the existing notification service schedules the saved experiment reminder.

## Risks

1. Existing data records planned time and completion state, but not actual start/end time or subjective energy. Insights must not claim actual focus duration, actual productivity, or emotional outcomes.
2. Sparse data can create misleading patterns. Every pattern needs a minimum sample threshold and a visible evidence count.
3. `AdaptiveApp.tsx` is already very large. Embedding more analytics logic there would increase coupling; the redesign should use a dedicated Insights feature boundary.
4. Removing fake-success fallbacks changes offline behavior. API failure must become an explicit recoverable error rather than silently mutating local state.

