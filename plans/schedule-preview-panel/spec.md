# Spec: Schedule Preview Panel

**Date:** 2026-09-20
**Status:** Ready

---

## Problem Statement

When AI presents 2-3 reschedule options, users must mentally simulate each option's impact on their day — high cognitive-load for neurodivergent users. A live Schedule Preview Panel shows the before/after impact of each option instantly on click, with per-change reasons, so users can decide without mental effort.

---

## User Stories

- **[P1]** As a user reviewing AI reschedule options, I want to click an option card and instantly see which blocks are affected and how, so that I can evaluate without mental simulation.
  Accepted when: Clicking any option card renders the preview panel within 150ms with the correct before/after diff.

- **[P1]** As a user, I want to see WHY each block was moved or deferred, not just WHERE it moved, so that I can trust the AI's reasoning.
  Accepted when: Each changed block shows >=1 reason bullet.

- **[P1]** As a user, I want the Apply button to live inside the preview panel, so I always know which option I'm applying.
  Accepted when: Exactly one Apply button, inside preview panel, disabled when no option selected.

- **[P1]** As a mobile user, I want to tap an option and see preview appear below (stacked layout).
  Accepted when: Viewport <768px uses single-column stacked layout.

- **[P2]** As a user, I want a "View full day" toggle inside preview to expand from affected-blocks-only to full day timeline.
  Accepted when: Toggle shows all blocks for that day ordered by time.

- **[P2]** As a desktop user hovering an option card, I want affected blocks in TodayView to subtly highlight.
  Accepted when: Hover adds Deferred/Moved badge to matching blocks in TodayView; removed on mouse-leave.

- **[P3]** (out of scope) — Animated morph transition between before/after states.

---

## Functional Requirements

1. FR-01: Split layout — Desktop >=768px: options list (40%) left, preview panel (60%) right.
2. FR-02: Empty state — No option selected shows "Select an option to preview the changes" placeholder.
3. FR-03: Click-to-preview — Clicking option card sets selectedPreview; diff computed client-side immediately.
4. FR-04: Selection indicator — Selected card gets border highlight + checkmark badge; preview header reads "Previewing [Option Title]".
5. FR-05: Affected blocks diff — Show only changed blocks + up to 2 unchanged adjacent context anchors. Status badges: Protected, Moved, Deferred, Tomorrow.
6. FR-06: Per-change reasons — Each changed block shows 1-3 reason bullets from: priority, deadline proximity, energy level, isMovable flag.
7. FR-07: Before/After format — Moved: "20:00-21:30 Study -> Tomorrow 09:00-10:30". Deferred: "20:00-21:30 Gaming -> Tomorrow Inbox".
8. FR-08: Apply button — Inside preview panel only. Calls onApplyScenario(selectedScenario). Hidden when no option selected.
9. FR-09: View full day toggle — Chevron button at bottom. Expands to all blocks, max-h-[70vh] with overflow-y scroll.
10. FR-10: Mobile stacked layout — <768px: options first, preview panel stacks below after selection (animate-in slide-down).

---

## Non-Functional Requirements

- Performance: Diff computation is pure client-side O(n); renders within 150ms of click.
- No new API calls: Preview computed from ScenarioOption.blocks + currentBlocks props already available.
- Zero breaking changes: DisruptionCard props interface is additive-only; currentBlocks is new optional prop defaulting to [].

---

## Success Criteria

- [ ] Clicking each of 3 scenario options renders a distinct, correct preview within 150ms.
- [ ] Each changed block shows >=1 reason bullet.
- [ ] Apply button is present only inside the preview panel.
- [ ] On mobile 375px, layout stacks correctly and preview is scrollable.
- [ ] No regression: Apply still calls onApplyScenario correctly.

---

## Out of Scope

- Animated morph transition between before/after states.
- Backend API changes (all diff computation is client-side).
- Editing individual blocks within the preview panel.

---

## Assumptions

- ScenarioOption.blocks = full after state; currentBlocks = before state. Both available client-side when disruption card renders.
- Block identity matched by id (DB blocks) or title+startTime (new urgent blocks without DB id).
- Reason bullets generated client-side from block metadata (priority, deadline, energyLevel, isMovable).
- ScenarioOption.highlightText is fallback summary reason if per-block metadata sparse.

---

## [NEEDS CLARIFICATION]

- [ ] Hover highlight scope: Does hovering highlight blocks on TodayView timeline (shared state) or only in preview panel? Recommend: TodayView as P2, preview panel diff as P1.
