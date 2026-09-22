# Phase 4: Quick Rebalance Modal with Diff Preview & AI Chat Handoff

## Context & Objectives
Build the frictionless Quick Rebalance Modal that shows 3 concrete adjustment proposals with side-by-side Diff Previews, 1-click apply, 10s undo, and a direct handoff to the AI Assistant.

## File Ownership
- [NEW] `src/components/adaptive/QuickRebalanceModal.tsx`
- [MODIFY] `src/components/adaptive/AdaptiveApp.tsx`

## Detailed Implementation Steps
1. **Build `QuickRebalanceModal.tsx`:**
   - **Header**: "Create some breathing room?" with empathetic subtext summarizing why today feels heavy.
   - **Option Cards**:
     - `☕ Option A — Add Breathing Room`: Inserts 15m buffer after meeting/deep block.
     - `→ Option B — Move a Flexible Task`: Moves non-urgent task to tomorrow morning.
     - `🔄 Option C — Reduce Context Switching`: Clusters similar categories together.
   - **Diff Preview Toggle (`[ Preview ]`)**:
     - Clicking `[ Preview ]` expands a side-by-side timetable view (`CURRENT` vs `PROPOSED`) highlighting moved, deferred, or buffer blocks.
   - **Action Footer**:
     - `[ Apply changes ]` (applies the selected option, closes modal, triggers 10s undo toast).
     - `[ Keep current ]` (dismisses modal).
     - `✨ Ask Modo for another approach` (closes modal, opens AI Planner chat, and pre-fills context prompt: *"Hôm nay lịch trình của tôi hơi nặng tải (Load: 78/100). Hãy gợi ý một cách sắp xếp khác giúp tôi giảm bớt áp lực."*).
2. **Mount in `AdaptiveApp.tsx`:**
   - State `isQuickRebalanceOpen`.
   - Wired to `[ Review Schedule ]` in `TodayWorkloadCard` and `DemandingDayBanner`.

## Verification
- Test complete user interaction flow:
  1. Open modal from `TodayWorkloadCard`.
  2. Toggle `[ Preview ]` on options.
  3. Apply changes and verify timetable updates and 10s undo works.
  4. Test `✨ Ask Modo for another approach` opens AI chat.
- Run frontend build:
  ```bash
  npm run build
  ```
