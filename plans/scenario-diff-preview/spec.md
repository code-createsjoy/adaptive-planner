# Spec: Scenario Schedule Impact Diff Preview Card

**Date:** 2026-09-21
**Status:** Ready

---

## Problem Statement
When the AI Planner suggests 2–3 adaptation scenarios (e.g., Smart Default, Cascade Shift, Prioritized Compress) in response to schedule disruptions or new tasks, users currently only see high-level text summaries. They cannot instantly visualize which specific activities will shift, compress, or defer to tomorrow. This creates cognitive load and uncertainty. A focused **Schedule Impact Diff Preview Card** displayed adjacent to the scenario list shows exact Before ➡️ After time deltas, empowering confident decisions.

---

## User Stories

- **[P1]** As a user reviewing AI schedule adaptation options, I want to see a dedicated Diff Preview Card in the adjacent space showing only the activities that change (Before Time ➡️ After Time) so that I can immediately evaluate the trade-offs without scanning the whole 24-hour day.
  Accepted when: Clicking any scenario option (Option A/B/C) instantly updates the Preview Card with clear diff badges (`[Dời giờ]`, `[Dời sớm]`, `[Rút ngắn]`, `[Hoãn sang ngày mai]`, `[Thêm mới]`, `[Bảo toàn]`).

- **[P1]** As a user looking at the Diff Preview Card, I want to click an "Áp dụng phương án này (Apply changes)" button directly from the Preview Card or Option card so that I can apply the plan with one click.
  Accepted when: Clicking the button triggers the adaptation apply flow, updates timeblocks, logs the action into Activity History with a 10s undo toast, and closes the pending state.

- **[P2]** As a user who wants to inspect the full timeline context, I want an optional "Xem toàn bộ timeline (View full timeline)" button/modal on the Diff Card so that I can inspect non-impacted tasks if needed.
  Accepted when: Clicking the button opens a clean visual timeline modal showing all blocks for the day under the proposed scenario.

- **[P3]** _(Out of scope for this milestone — mobile bottom sheet / drawer integration)_

---

## Functional Requirements

1. **FR-01: Diff Calculation Utility (`calculateScheduleDiff`)**:
   - Compare `currentBlocks` (baseline day schedule) against `scenario.blocks` (proposed schedule) and `pendingActivity` (new activity).
   - Accurately categorize each item into one of the diff states:
     - `NEW`: Newly added activity (e.g. `Cuộc họp đột xuất`).
     - `SHIFT_LATER`: Start time moved later (`19:30 → 20:15`, `+45m`).
     - `SHIFT_EARLIER`: Start time moved earlier (`20:30 → 20:00`, `-30m`).
     - `COMPRESSED`: Duration shortened (`120m → 90m`, `-30m`).
     - `DEFERRED`: Moved to Tomorrow / Inbox (`Hoãn sang ngày mai`).
     - `UNCHANGED_PROTECTED`: Fixed protected or sleep blocks preserved (`Không đổi / Bảo vệ`).

2. **FR-02: ScenarioDiffPreviewCard Component**:
   - Clean, modern, neurodivergent-friendly card with glassmorphism, subtle badges, and clear typography.
   - Header: Scenario Name + Badge (e.g., `⚡ Gợi ý điều chỉnh tối ưu (Smart Default)`).
   - Core list: Displays changed items with `[Old Start – Old End] ➡️ [New Start – New End]` and color-coded status pills.
   - AI Reasoning snippet: Brief bullet points explaining why this scenario made these changes.
   - Primary Action Button: `Áp dụng phương án này (Apply changes)`.
   - Secondary Action Button: `Xem toàn bộ timeline (View full timeline)`.

3. **FR-03: Reactive Selection in PlannerView**:
   - Default to the `recommendedScenario` on initial generation.
   - Clicking any scenario card (Option A, B, C) updates the active preview state smoothly without re-running backend queries.

---

## Non-Functional Requirements

- **Performance:** Diff calculation must execute synchronously in `< 5ms` with zero lag during option switching.
- **Aesthetics & Usability:** Neurodivergent-first UI (calm tones, high visual contrast for time deltas, no jarring visual noise).
- **Desktop First:** Tailored for desktop screen real estate (split view / adjacent placement).

---

## Success Criteria

- [ ] Selecting different scenarios updates the Preview Card with 100% accurate time delta comparisons (`Before ➡️ After`).
- [ ] Correctly flags newly added tasks, shifted tasks, shortened tasks, and deferred tasks.
- [ ] "Apply changes" button applies the selected scenario and syncs with backend and local store seamlessly.

---

## Out of Scope
- Mobile bottom sheet responsive adaptation (noted for Phase 2).
- Manual drag-and-drop editing within the diff preview (handled via existing Edit modal).

---

## Assumptions
- `ScenarioOption.blocks` contains the proposed timeblocks for the target date.
- `currentBlocks` contains the active baseline blocks for the target date.
