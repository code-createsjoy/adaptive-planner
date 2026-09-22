# Spec: Real-data Weekly Insights

**Date:** 2026-09-21
**Status:** Ready

---

## Problem Statement

The current Insights screen displays fabricated daily numbers and narrative, so users cannot trust it to explain their real planning behavior. Replace it with a calm Monday–Sunday reflection that uses persisted schedule and adaptation data, offers evidence-backed experiments for the following week, and removes runtime mock/fake-success paths without turning the experience into a productivity score.

---

## User Stories

- **[P1]** As a planner user, I want a factual summary of my Monday–Sunday week so that I can understand what happened without being judged.
  Accepted when: selecting a week displays metrics derived only from persisted TimeBlocks and AdaptationActions for that exact local calendar week, and every displayed count matches the source records.

- **[P1]** As a planner user, I want each pattern to show its evidence so that I can decide whether the interpretation fits my experience.
  Accepted when: every pattern card displays its sample size and identifies the contributing days or blocks; no pattern is emitted below its configured minimum sample threshold.

- **[P1]** As a planner user, I want missing or failed data to be represented honestly so that I never mistake fabricated values for my history.
  Accepted when: insufficient data produces a coverage-aware empty state, API failure produces an error with retry, and neither condition renders sample metrics, scenarios, slots, or notifications.

- **[P1]** As a planner user, I want to save a small experiment for next week so that I can revisit it without allowing the system to change my timetable.
  Accepted when: pressing **Try next week** creates exactly one persisted experiment/reminder and causes zero TimeBlock or WeeklyRoutine writes.

- **[P1]** As a planner user, I want mock and fake-success behavior removed so that every visible schedule state corresponds to real persisted data or an explicit local draft.
  Accepted when: the enumerated mock sources are removed, failed mutations expose error/retry states, and backend deterministic AI fallback remains functional.

- **[P2]** As a planner user, I want to compare the selected week with the previous calendar week so that I can notice directional changes without receiving a score.
  Accepted when: comparison labels show absolute deltas only when both weeks meet minimum data coverage; otherwise the comparison is omitted with a reason.

- **[P2]** As a planner user, I want to dismiss an unsuitable experiment so that the same recommendation is not repeatedly presented without new evidence.
  Accepted when: dismissal is persisted and the recommendation stays suppressed until its evidence set materially changes or four calendar weeks pass.

- **[P3]** _(out of scope — actual-time tracking, subjective energy check-ins, long-term trend modeling, and AI-generated analytics.)_

---

## Functional Requirements

1. **FR-01 — Calendar week:** A reporting period starts Monday at 00:00 and ends immediately before the following Monday in the user's configured timezone. The response includes `weekStart`, `weekEnd`, and timezone.
2. **FR-02 — Weekly API:** Provide one backend endpoint that returns the weekly summary, coverage, factual metrics, patterns, evidence references, saved-experiment state, and previous-week comparison eligibility.
3. **FR-03 — Authoritative sources:** Compute factual metrics from persisted `TimeBlockEntity` and `AdaptationActionEntity` records. The frontend must not invent replacements when the endpoint is unavailable.
4. **FR-04 — Truthful metrics:** The P1 summary includes scheduled block count, completed block count, deferred block count, planned minutes, planned high-energy minutes, scheduled buffer minutes, and applied/undone adaptation counts. Do not label planned minutes as actual time spent.
5. **FR-05 — Completion semantics:** A block counts as completed only when `isCompleted = true`; cancelled routine overrides and deleted blocks do not count as completed. The implementation plan must define treatment of generated routine instances consistently for current and previous weeks.
6. **FR-06 — Data coverage:** Report the number of days containing at least one eligible block. Fewer than 3 covered days yields the insufficient-data state and no behavioral pattern or recommendation.
7. **FR-07 — Pattern rules:** Support at least these deterministic, explainable rules:
   - completion distribution by morning, afternoon, and evening, requiring at least 3 eligible blocks in the compared daypart;
   - planned high-energy load by day, flagging only when a day contains at least 3 high-energy blocks or 240 planned high-energy minutes;
   - scheduled transition coverage, based on explicit buffer blocks or gaps of at least 10 minutes between adjacent non-buffer blocks;
   - adaptation choice distribution, using persisted applied/undone actions without claiming the choice improved wellbeing.
8. **FR-08 — Evidence:** Each pattern returns a stable rule key, neutral title, factual observation, sample size, confidence label based on sample size, and references to the contributing dates/block IDs/action IDs.
9. **FR-09 — Weekly story:** The frontend composes the weekly story only from response metrics and predefined neutral language. It must not introduce new numbers, diagnoses, productivity scores, streaks, guilt language, or unsupported causal claims.
10. **FR-10 — Insight layout:** Render these states/sections: week selector, gentle weekly story, **What happened**, **Patterns worth noticing**, **What your adaptations protected**, **Try next week**, loading, insufficient-data, and recoverable error.
11. **FR-11 — Recommendation limit:** Return/display no more than 3 experiments per week. Each experiment maps to one observed rule and contains a measurable, reversible action rather than an automatic schedule mutation.
12. **FR-12 — Save experiment:** Persist a selected experiment with its source week, rule key, title, rationale, evidence fingerprint, reminder date, and status. Default reminder timing is the next Monday; planning may expose a reminder-time selector if it does not expand P1 materially.
13. **FR-13 — No automatic scheduling:** Saving, dismissing, archiving, or reminding about an experiment must never create, update, delete, or reorder TimeBlocks or WeeklyRoutines.
14. **FR-14 — Reminder integration:** A saved experiment appears through the real notification system at its scheduled reminder time and links back to Insights.
15. **FR-15 — Mock cleanup:** Audit all production source paths for runtime mock/sample/demo records and remove them. At minimum, remove the hard-coded `InsightsView` metrics/narrative, Zustand `mockScenarios`, fabricated calm-slot fallback, and obsolete hard-coded `NotificationsView`. Maintain an explicit allowlist for harmless input examples, placeholders, test fixtures, and design-system fallback components.
16. **FR-16 — Fake-success cleanup:** Remove client-side fallbacks that report create/update/delete/batch-apply or AI scenario generation as successful after backend failure. Display an explicit retryable error while preserving unsent form input where relevant.
17. **FR-17 — Backend AI resilience:** Retain deterministic backend parsing, scenario, and task-breakdown fallbacks because they process real requests and do not insert fabricated history. Their output remains subject to normal validation and user confirmation.
18. **FR-18 — Non-mock UI examples:** Input placeholders, suggested prompts, empty-state illustrations, and design-system fallback components are not runtime records and need not be removed unless they imply completed user activity.
19. **FR-19 — Feature isolation:** Implement Insights outside `AdaptiveApp.tsx` as a dedicated feature component/hook/API boundary. `AdaptiveApp` may select the view but must not own aggregation rules.
20. **FR-20 — Week navigation:** Users can view the current week and earlier weeks. Future weeks are unavailable; the current incomplete week is clearly labeled **Week so far**.

---

## Non-Functional Requirements

- **Performance:** Weekly Insights uses at most 2 application API requests on initial load and returns within 800 ms at p95 for up to 10,000 TimeBlocks and 5,000 adaptation records in a local/staging database.
- **Correctness:** Date-boundary and metric tests cover Monday start, Sunday end, month/year crossing, leap day, current partial week, cancelled routine overrides, and timezone conversion.
- **Transparency:** 100% of rendered numbers originate from named response fields; every behavioral pattern exposes evidence count and source references.
- **Reliability:** API errors render an error state within 1 second and never substitute fabricated data or mutate client schedule state.
- **Accessibility:** All insight cards, week navigation, actions, loading, empty, and error states are keyboard accessible and meet WCAG 2.1 AA contrast requirements.
- **Privacy:** Do not send weekly history to an LLM in P1. Return only the data required by the authenticated/active user boundary available in the application.
- **Tone:** User-facing copy contains no productivity score, ranking, streak penalty, diagnosis, or moralized success/failure label.

---

## Success Criteria

- [ ] Metric correctness: all weekly aggregation fixtures produce exact expected counts and durations across the defined edge cases.
- [ ] Mock removal: a repository-wide production-source audit finds no runtime mock/sample/demo records outside the explicit allowlist, including no `mockScenarios`, fabricated Insights numbers, calm-slot fallback records, or obsolete static notification records.
- [ ] Failure honesty: forced API failures show loading/error/retry behavior with zero fabricated metrics and zero fake-success schedule mutations.
- [ ] Data sufficiency: fixtures with 0–2 covered days emit no pattern/recommendation; fixtures with at least 3 covered days emit only rules whose individual sample thresholds pass.
- [ ] Evidence coverage: every emitted pattern and experiment has a non-empty rule key, sample size, evidence fingerprint, and at least one source reference.
- [ ] Safe experiment: integration tests prove **Try next week** creates one experiment/reminder record and zero TimeBlock/WeeklyRoutine mutations.
- [ ] Bounded output: a weekly response contains at most 3 proposed experiments and the frontend renders at most 3.
- [ ] Request budget: opening Insights performs no more than 2 application API requests.
- [ ] Frontend quality: production build and lint complete with zero errors, and dedicated tests cover all Insights UI states.
- [ ] Backend quality: weekly aggregation, experiment persistence, and reminder integration tests pass with zero failures.

---

## Out of Scope

- Automatically applying a recommendation to the timetable or routine template.
- Productivity scores, streaks, leaderboards, or comparisons with other users.
- Claiming actual focus time, actual energy, mood, stress, or health outcomes without explicit tracking data.
- LLM-authored metrics or recommendations in P1.
- Real-time event streaming, analytics warehouses, and precomputed multi-month trend tables.
- Rebuilding unrelated settings, calendar, planner, project-goal, or notification-center UI beyond removing identified mock/dead paths and integrating experiment reminders.

---

## Assumptions

- `TimeBlockEntity.date`, status, completion, energy level, category, buffer flag, start time, and end time are sufficiently populated for factual weekly aggregation.
- `AdaptationActionEntity` records applied and undone adaptations with usable date and before/after snapshot data.
- The application continues to use its current single-user/active-user context during this feature; introducing authentication is a separate project.
- The existing notification persistence and delivery path can accept a new experiment-reminder type.
- Backend deterministic AI fallbacks remain supported, while client-side fake-success fallbacks are removed.
