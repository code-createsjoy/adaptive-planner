# Brainstorm: Real-time Timeline & Dynamic NOW/NEXT Engine

**Date:** 2026-09-19  
**Status:** Explored & Narrowed

## Ideas Explored

1. **Passive Digital Clock:** Simple live clock in the header (HH:mm:ss). High readability, but does not solve time blindness on its own.
2. **Dynamic NOW Indicator Line (Red Line / Live Cursor):** Visual timeline marker moving smoothly based on current minutes of the day, showing where the user is relative to upcoming blocks.
3. **Automatic NOW / NEXT Calculation:** Deriving active and next tasks purely on client-side (`Date.now()`) compared against `startTime` and `endTime` of all blocks in PostgreSQL/Zustand store.
4. **Time Remaining & Progress Gauge (Countdown):** Explicit minutes remaining (e.g. `27 min remaining · Ends at 22:00`) + visual progress bar to eliminate cognitive arithmetic for time-blind individuals.
5. **Contextual Free Time State ("You're Free"):** When no task is currently active between blocks, render an encouraging calm state with available minutes and instant shortcuts ("What should I do now?").
6. **Multi-stage Transition Warnings (T-10m, T-0m):** Calm visual and audio transition cues before switching focus.

## User's Direction

The user selected a holistic integration of all core elements, prioritizing cognitive utility over decorative clocks:
- **Client-Side Real-Time Loop:** No heavy WebSocket required. The frontend uses a lightweight interval hook to derive NOW/NEXT, countdowns, and indicator position.
- **Cognitive Clarity Over Sensory Clutter:** Avoid blinking timers on every block; only the active `NOW` block shows a live minute countdown and progress bar.
- **Empathetic Free Time Handling:** Replace blank/broken screens during gap periods with a calm "You're Free (X minutes available)" card connected to the AI assistant.

## Open Questions for Planning

1. **Timezone & Date Boundary Handling:** Ensure tasks scheduled around midnight or next-day rollover transition cleanly without visual jumps.
2. **Demo Mode vs Real System Time:** Allow a subtle toggle or slider in developer settings to shift virtual time for hackathon demos if testing at off-hours.

## Risks & Mitigations

- **Risk: Re-render performance overhead.** Running 1s interval re-renders the whole tree.  
  *Mitigation:* Keep the 1s tick isolated to the header clock and countdown hook, and update block classifications (NOW/PAST/UPCOMING) only when minute value changes.
- **Risk: Sensory overload from constant motion.**  
  *Mitigation:* Update countdown in whole minutes (`27m remaining`) rather than frantically ticking seconds on all timeline cards.
