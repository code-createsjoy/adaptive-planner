# Phase 3: Floating AI Prompt Bar & Accessible History Drawer

## Goals
- Remove the static, crowded AI chat panel from occupying permanent timeline screen space.
- Introduce a minimalist floating / docked quick prompt bar at the bottom for instant natural language scheduling.
- Accessible slide-over conversation history drawer with keyboard focus trapping, `aria-modal="true"`, and `Esc` key dismissal.

## Implementation Steps
1. Floating Quick AI Input Bar:
   - Compact prompt input at bottom/top with voice & submit buttons.
   - Parses intent and pops preview modal without shifting timeline layout.
2. Accessible Slide-over Drawer (`ChatHistorySidebar.tsx` / `ConversationDrawer`):
   - Opens smoothly when user clicks "View AI Conversation History".
   - Traps focus inside the drawer while open.
   - Pressing `Esc` or clicking the backdrop closes the drawer and restores focus to the trigger button.

## Verification
- Enter natural language command: Verify quick modal preview appears cleanly.
- Open AI History: Verify slide-over drawer traps focus and closes with `Esc`.
