# Spec: Real-time Timeline & Dynamic NOW/NEXT Engine

**Date:** 2026-09-19  
**Status:** Ready  

---

## Problem Statement
Individuals with ADHD and time blindness struggle to intuitively perceive the passage of time or calculate remaining task durations (e.g. `22:00 - 21:37 = 23m`). This feature introduces a real-time temporal tracking engine with live timeline indicators, dynamic NOW/NEXT slot determination, explicit remaining time progress gauges, and supportive free-time guidance.

---

## User Stories

- **[P1]** As a neurodivergent user, I want the Timeline to dynamically highlight the currently active task (`NOW`) and upcoming task (`NEXT`) based on my device's actual time, so that I don't have to manually figure out where I am in my day.  
  *Accepted when:* When the system clock is within `[startTime, endTime]`, that task automatically becomes the focused NOW card with remaining minutes updated in real-time.

- **[P1]** As a user with time blindness, I want to see an explicit countdown gauge ("27 min remaining · Ends at 22:00") and a visual NOW indicator line moving along the timeline, so that I visually grasp time passing without performing mental arithmetic.  
  *Accepted when:* A red/accent NOW indicator line is positioned accurately between timeline slots and the NOW card displays a dynamic percentage progress bar.

- **[P1]** As a user with free time between scheduled blocks, I want to see a calm "You're Free (X minutes available)" card with action shortcuts instead of an empty screen, so that I don't get trapped in waiting paralysis.  
  *Accepted when:* If `currentTime` does not fall within any block, the NOW slot shows free minutes until the next scheduled block with a button to ask "What should I do now?".

- **[P2]** As a user nearing the end of a focus block (T-10m), I want gentle visual and audio transition cues ("10 minutes left before Wind down"), so that I can decompress and avoid jarring task-switching shocks.  
  *Accepted when:* When `remainingMinutes <= 10`, a soft warning badge appears and the 432Hz sine chime sounds.

- **[P3]** Virtual Time Travel Slider (Dev/Demo mode) to simulate arbitrary times of day for testing and presentations.

---

## Functional Requirements

1. **FR-01 (Live Clock Hook):** Provide a `useCurrentTime()` hook that updates `currentTime` (HH:mm and Date) every 1s for the header clock and every 10s for timeline layout positioning.
2. **FR-02 (Dynamic NOW/NEXT Calculation):**
   - Derive `activeBlock` = block where `startTime <= currentTime < endTime`.
   - Derive `nextBlock` = earliest block where `startTime > currentTime`.
   - Derive `pastBlocks` = blocks where `endTime <= currentTime`.
   - Derive `isFreeTime` = true when `activeBlock == null`.
3. **FR-03 (Time Remaining & Gauge):**
   - Calculate `elapsedMinutes = currentTimeInMinutes - startTimeInMinutes`.
   - Calculate `totalMinutes = endTimeInMinutes - startTimeInMinutes`.
   - Calculate `progressPercent = Math.min(100, Math.max(0, (elapsedMinutes / totalMinutes) * 100))`.
   - Display `X min remaining · Ends at HH:mm`.
4. **FR-04 (Timeline NOW Indicator Line):**
   - Render a horizontal accent indicator `─── 🔴 NOW (HH:mm) ───` positioned chronologically between timeline blocks.
5. **FR-05 (Contextual Free Time Card):**
   - When `activeBlock == null`, render `YOU'RE FREE · ${gapMinutes} minutes available until ${nextBlock.title}` with quick action buttons.
6. **FR-06 (Multi-stage Transition Warnings):**
   - At T-10m, display a gentle transition notice: "10 minutes left · You have a transition buffer before next task".

---

## Non-Functional Requirements

- **Performance:** Interval calculation runs strictly on the client; timeline block re-classifications trigger at most once every minute or when state changes.
- **Sensory Safety:** Low visual noise, pastel/muted accents, no blinking timers, no noisy push notifications.
- **Responsiveness:** Works seamlessly on mobile viewport (sticky bottom navigation) and desktop layout.

---

## Success Criteria

- [ ] Header displays live local time (e.g. `21:37:42 · Saturday, September 19`).
- [ ] Timeline dynamically renders the `NOW` and `NEXT` cards according to actual system time without hardcoded mock timestamps.
- [ ] Timeline renders a horizontal NOW Indicator Line in the correct chronological position.
- [ ] When in a gap period, the UI renders the "You're Free" contextual card with available minutes.
- [ ] Active block shows real-time progress bar and countdown ("X min remaining").

---

## Out of Scope

- WebSocket / Server-sent Events (not needed since client-side device time is ground truth).
- Native OS background service alarms (future mobile app scope).

---

## Assumptions

- Users' device clocks are set to their local timezone.
- Time blocks follow standard `HH:mm` format within a 24-hour daily cycle.
