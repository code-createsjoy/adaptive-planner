# Phase 4: Live Header Mode Switcher, Profile Settings & Layout Reactivity

## Context & Objectives
Implement the Live 3-mode Switcher in the Header, adapt the Day Timeline and Dashboard widgets to respect the active mode, and build the deep settings panel.

## File Ownership
- [NEW] `src/components/adaptive/SensoryModeSwitcher.tsx`
- [NEW] `src/components/adaptive/AccessibilityProfileSettings.tsx`
- [MODIFY] `src/components/adaptive/AdaptiveApp.tsx`
- [MODIFY] `src/features/insights/InsightsView.tsx`

## Detailed Implementation Steps
1. **Build `SensoryModeSwitcher.tsx`:**
   - 3-segment pill control: `🧘 Calm` | `⚖️ Balanced` | `🎯 Focus`.
   - Visual feedback, sensory sound chime on toggle, instant < 30ms DOM dataset and store update.
2. **Layout Reactivity in `TodayView` / `AdaptiveApp.tsx`:**
   - When in `🧘 Calm Mode`:
     - Hide secondary right-sidebar widgets (Focus Companion / Routine manager / non-essential lists).
     - Limit active timeline view to **Now + Next Task** with generous sensory whitespace.
     - Soften color saturation via CSS tokens.
   - When in `🎯 Focus Mode`:
     - Display single active task with an interactive focus countdown timer and micro-step checklists.
     - Mute non-urgent notifications and AI suggestions.
   - When in `⚖️ Balanced Mode`:
     - Render full multi-view timeline and standard widgets.
3. **Build `AccessibilityProfileSettings.tsx`:**
   - Placed in Profile navigation view.
   - Fine-tune sliders: Information Density (Low/Med/High), Sensory Motion (None/Reduced/Full), Notification Volume, Communication Style.
   - "Làm lại bài khảo sát Onboarding" button.
4. **Proactive AI Mode Suggestion (Tolerance for Error):**
   - If user frequently switches to Calm Mode during afternoon hours, display gentle suggestion card with user agency: *"Bạn thường chuyển sang Calm Mode vào buổi chiều. Bạn có muốn đặt Calm Mode làm mặc định cho khung giờ này không?"*

## Verification
- Run frontend build & full verification:
  ```bash
  npm run build
  ```
