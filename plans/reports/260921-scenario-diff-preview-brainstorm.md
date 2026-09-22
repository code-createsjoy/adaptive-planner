# Brainstorm: Scenario Schedule Impact Diff Preview Card

**Date:** 2026-09-21

## Ideas Explored
1. **Accordion/Expandable inside each Scenario card:** Expand changed items directly beneath Option A/B/C. (Dismissed: clutter within cards, causes vertical jumping when switching options).
2. **Full Mini-Timeline (2-column Before & After):** Show two complete 24-hour visual timetables side-by-side. (Dismissed: high cognitive overload, forces neurodivergent users to manually scan the entire day).
3. **Focused Diff List Preview in the adjacent workspace (Chosen):** Display a dedicated Diff Preview card on the left/adjacent column comparing old time vs new time (`19:00 → 20:00`), status badges (`[Dời giờ]`, `[Dời sớm]`, `[Rút ngắn]`, `[Hoãn]`, `[Mới thêm]`, `[Không đổi]`), and a quick "Apply changes" button with an optional full timeline modal expander.

## User's Direction
- Adopt **Option 3 (Danh sách thẻ Diff tập trung)**:
  - Users only see what changes, eliminating information overload.
  - Arrow transition (`19:00 → 20:00`) prevents time blindness.
  - Status badges provide immediate cognitive clarity on AI decisions.
  - Target Web UI first; mobile responsive adaptations documented for subsequent iterations.

## Open Questions
- None. Requirements and visual mental model are fully clarified.

## Risks
- **Diff matching precision:** Custom tasks with edited names or synthetic routine IDs must be matched reliably between `currentBlocks` and `scenario.blocks` by ID, title, or routine source ID to prevent false "Deleted + New" diffs instead of clean "Moved / Rescheduled" diffs.
- **Handling Deferrals to Tomorrow:** Tasks moved to tomorrow or inbox should clearly indicate "Hoãn sang Ngày mai (Tomorrow Inbox)" rather than disappearing.
