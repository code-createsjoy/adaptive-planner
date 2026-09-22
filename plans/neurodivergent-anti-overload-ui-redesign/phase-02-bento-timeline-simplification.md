# Phase 2: Simplified Bento Timeline & Compassionate States

## Goals
- Clean, low-saturation surfaces with high WCAG AA contrast ($\ge 4.5:1$).
- Neutral de-emphasis for past tasks using lighter borders, subtle backgrounds, and checkmarks (no hard-coded opacity that ruins text contrast).
- Replace long descriptive prose on cards with scannable badges and single-line summaries.
- Implement compassionate empty states and zero-blame error messages.

## Implementation Steps
1. Timeline Card Streamlining (`TimelineBlockCard` / `BentoTimelineCard`):
   - Primary label: 1 clear concise line.
   - De-emphasize past blocks with neutral slate surface, subtle border, and green checkmark.
   - Secondary details and notes collapsed behind intentional 1-click trigger.
2. Compassionate State Messages:
   - Empty state: *"Nothing needs your attention right now. [Plan something]"*
   - Error state: *"Modo couldn't create that change. Your current schedule hasn't been modified."*
   - Offline / save error: *"We couldn't save that response. Your previous answers are safe. [Try again]"*

## Verification
- Check timeline: Verify past, current, and future tasks are clearly distinguishable with high text readability.
- Clear day's tasks: Verify compassionate empty state renders cleanly.
