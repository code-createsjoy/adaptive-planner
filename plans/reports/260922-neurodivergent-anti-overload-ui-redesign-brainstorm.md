# Brainstorm: Neurodivergent Anti-Overload UI/UX Redesign

**Date:** 2026-09-22

## Ideas Explored
1. **Full Minimalist Chute (Llama Life Style)**: Hide the entire timeline and show strictly 1 current task. Rejected because users still need macro time context for their afternoon/evening commitments.
2. **Dense Multi-column Calendar (Google Calendar / Outlook Style)**: Traditional grid layout. Rejected because it induces severe visual noise, time-blindness anxiety, and choice paralysis.
3. **Hero Focus Card + Bento Time-Pill Timeline (Selected)**:
   - Dedicated "NOW / NEXT" Hero card at top with visual progress timer and direct micro-steps checkbox.
   - Simplified Bento Timeline with soft rounded pill blocks, muted pastel tags, and 70% reduced text copy.
   - Non-intrusive AI prompt bar / slide-over instead of a cluttered persistent chat panel taking up half the workspace.
   - One-click Sensory Mode switch (🌿 Calm / ⚖️ Balanced / 🎯 Focus).

## User's Direction
- Redesign the UI specifically for Neurodivergent users (ADHD, Autism, Executive Dysfunction).
- Eliminate all unnecessary text copy, walls of text, and visual clutter.
- Structure information with scannable cards, visual progress indicators, and bite-sized actions.

## Open Questions
- Micro-steps checklist: Ensure inline checking directly updates task state in PostgreSQL backend without opening full modal dialogs.
- AI Assistant placement: Float/slide-over to maximize timeline breathing room.

## Risks
- Oversimplification removing power features (mitigated by using progressive disclosure: details available on 1-click expand).
