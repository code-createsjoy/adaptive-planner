# Phase 4: Frontend Activity History Timeline & Instant Undo

## Goal
Build the Activity & Decision History timeline drawer, displaying transparent AI reasons, before/after diffs, and an interactive 10-second multi-block Undo toast.

---

## Technical Specifications

### 1. API Client & Hooks for Adaptation Audits
- Hooks:
  - `useAdaptationsQuery(date)`
  - `useUndoAdaptationMutation()`

### 2. Activity & Decision Timeline Component
- Component: `ActivityHistoryDrawer.tsx` / `ActivityHistoryTimeline.tsx`
- Features:
  - Timeline Cards displaying:
    - **Header**: Timestamp (e.g. `17:05`) + Trigger Event Badge (e.g. `⚠️ Cuộc họp đột xuất 17:00–18:30`) + Status (`Đã áp dụng` | `Đã hoàn tác`).
    - **Selected Plan Tag**: e.g. `✦ Điều chỉnh thông minh (Khuyến nghị)`.
    - **Why Section (Empathetic Reasons)**:
      - `• Bảo vệ tuyệt đối giờ ngủ (23:00–07:00)`
      - `• Tự động dời Học Java (19:00–21:00) kèm 15m đệm`
      - `• Hoãn Gaming sang Tomorrow Inbox`
    - **Before/After Changes Diff**:
      - Visual chips showing what shifted:
        - `Học Java`: `15:00 → 19:00` (Moved)
        - `Gaming`: `21:00 → Hộp thư Ngày mai` (Deferred)
        - `Cuộc họp đột xuất`: `17:00–18:30` (New Block)
    - **Footer Action**:
      - `[Xem cuộc trò chuyện (View Conversation)]` button jumping directly to the linked Chat Session in AI Planner.

### 3. Multi-Block Instant Undo Toast
- In `AdaptiveApp.tsx`:
  - When user applies any adaptation, trigger an animated floating toast at the bottom:
    > **✓ Đã áp dụng Phương án đề xuất**  
    > Lịch trình ngày 21/09 đã được cập nhật thành công.  
    > `[Hoàn tác (Undo)]` (progress timer countdown: 10s).
  - Clicking `[Hoàn tác (Undo)]` triggers `undoAdaptationMutation(actionId)`, which restores the pre-adaptation timetable atomically and plays a soft confirmation sound.

---

## Verification
- Applied adaptations show immediately in Activity History.
- Clicking Undo within 10s reverts the multi-block shift cleanly.
- Clicking "Xem cuộc trò chuyện" opens the exact chat thread.
