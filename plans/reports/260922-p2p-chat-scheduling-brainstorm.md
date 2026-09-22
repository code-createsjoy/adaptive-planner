# Brainstorm: P2P Chat & Social Scheduling

**Date:** 2026-09-22

## Ideas Explored
1. **Interactive In-Chat Invitation Cards**: Users create schedule invites in 1-1 chat; the recipient sees a rich interactive card with Accept/Decline actions.
2. **AI-Driven Conversational Parser**: AI listens to normal messages (e.g., "coffee tomorrow at 3pm") and automatically proposes meeting chips.
3. **Cal.com/Calendly-Style Public Booking**: Sending slot booking links across external apps.
4. **Gmail-Based Friendship & Contacts Discovery**: Connecting contacts directly using their registered Google/Email address.
5. **Two-Way Profile Demo Switcher**: Instant switcher in the UI to demonstrate sending, receiving, and accepting invitations between two personas (e.g. Thai & Minh).

## User's Direction
- The user wants a P2P messaging experience where users connect via their registered Gmail accounts.
- Schedule creation follows **Approach A (Interactive Cards)**: the sender picks date, time, and topic to dispatch an in-chat Invitation Card, and the recipient accepts/declines directly inside the conversation.
- Accepted invitations automatically sync as active `TimeBlock` events into both participants' Timelines and Calendars with attendee tags.
- Mock data and interactive prototyping are prioritized to clearly present the idea and product flow.

## Open Questions
- None blocking for spec; MVP will use local mock storage with seamless 2-way profile toggle for live demonstration.

## Risks
1. **Schedule Overlaps on Recipient's Calendar**: An accepted invite might conflict with an existing high-focus block or sleep boundary. *Mitigation: Display a mini schedule check badge on the invite card.*
2. **Presentation Friction**: Switching browser tabs to test multi-user chat is cumbersome. *Mitigation: Built-in instant account switcher in the demo bar.*
