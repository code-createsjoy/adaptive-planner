# Phase 4: Settings Replay Management, Accessibility & Verification

**Parent Plan:** [`plans/in-product-guidance-and-onboarding/plan.md`](file:///d:/6_OJT/adaptive-planner/plans/in-product-guidance-and-onboarding/plan.md)
**Status:** Not Started

---

## Objectives
1. Add a dedicated "Help & Guidance" card in the Settings view of `AdaptiveApp.tsx` allowing users to replay any tour or reset all guidance tips.
2. Ensure full accessibility compliance:
   - Keyboard navigation (Tab, Enter, Escape).
   - Screen-reader tags (`role="dialog"`, `aria-modal="true"`, `aria-label`).
   - Focus restoration to the triggering element when tour closes.
   - High contrast ($\ge 4.5:1$).
   - Respect `prefers-reduced-motion`.
3. Complete end-to-end verification via automated frontend build (`npm run build`) and visual validation in browser.

---

## Detailed Steps

1. **Add Help & Guidance to Settings View**:
   - In `AdaptiveApp.tsx` (`ProfileView` / `Settings` tabs):
     - Add card: *"Trợ giúp & Hướng dẫn sử dụng (Help & Guidance)"*.
     - Button: `[Xem lại Dashboard Tour]` -> starts tour and switches to Today/Planner tab.
     - Button: `[Đặt lại tất cả mẹo hướng dẫn]` -> resets all seen tips and triggers success toast.
     - Guidance Style selector: `Tối giản (Minimal)` | `Có hướng dẫn (Guided)` | `Chi tiết (Detailed)`.

2. **Accessibility & Focus Management**:
   - In `<CoachMark />`, add `onKeyDown` handler for `Escape`.
   - Ensure primary action button is auto-focused on step transition.
   - Add `aria-live="polite"` region announcing current step updates.

3. **Build & Test Verification**:
   - Run `npm run build` to verify 0 TypeScript/lint errors.
   - Run `browser_subagent` to test the tour, interactive step advancement, Help Drawer, and Settings reset.

---

## Verification
- `npm run build` exits with code 0.
- Browser test verifies smooth spotlight transition and functional drawer.
