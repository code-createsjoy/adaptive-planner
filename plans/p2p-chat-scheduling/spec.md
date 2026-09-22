# Spec: Peer-to-Peer Chat & Interactive Social Scheduling

**Date:** 2026-09-22
**Status:** Ready

---

## Problem Statement
Neurodivergent individuals often experience social anxiety and friction when coordinating appointments, meetups, and joint study sessions across separate chat and calendar apps. This feature provides direct 1-1 chat with interactive in-chat meeting invitations that automatically sync confirmed events into both users' adaptive timelines with zero friction.

---

## User Stories

- **[P1]** As a user, I want to find and add friends by their registered Gmail address so that I can start a conversation.
  - Accepted when: Typing an existing or mock Gmail (e.g. `minh.designer@gmail.com`) adds the friend to the Friends list with online presence.
- **[P1]** As a user, I want to send text messages and interactive schedule invitations in a 1-1 chat so that we can agree on a meeting time.
  - Accepted when: Clicking "Create Schedule Invite" opens a quick picker (Date, Start Time, End Time, Title, Location/Detail) and posts an interactive card into the conversation.
- **[P1]** As a recipient, I want to Accept or Decline a meeting invite directly in the chat card so that the event automatically pins to my timeline.
  - Accepted when: Clicking `[Accept]` updates the card status to `Accepted`, creates a new `social` TimeBlock on the target date on both users' calendars, and shows a confirmation badge.
- **[P1]** As a presenter/tester, I want to quickly switch between demo user accounts (e.g. `Thai` and `Minh`) so that I can seamlessly showcase the 2-way conversation and scheduling flow.
  - Accepted when: Clicking the persona toggle instantly swaps the active user view and message alignment (sent vs. received).
- **[P2]** As a user, I want to see if a proposed meeting conflicts with my existing commitments before clicking Accept.
  - Accepted when: The invitation card highlights `No conflict detected` or `⚠️ Overlaps with Study session (15:00-16:00)`.
- **[P3]** Real-time WebSocket multi-tenant backend server sync and push notifications across disparate physical devices *(future phase after presentation approval)*.

---

## Functional Requirements

1. **FR-01 (Navigation Entry):** Add a "Friends & Chat" navigation tab in the Desktop & Mobile Sidebar (`👥 Friends & Chat`) with unread message badge count.
2. **FR-02 (Friend List & Add Friend):** Display list of active friends with avatar, name, email, last message preview, and a modal/input to "Add Friend by Gmail".
3. **FR-03 (1-1 Chat Interface):** Render chat bubbles (outgoing on right, incoming on left), timestamps, typing indicators, and message input with Send action.
4. **FR-04 (In-Chat Schedule Invitation Card):** 
   - Fields: Title (e.g., `Coffee & Design Sync`), Date (`YYYY-MM-DD`), Time (`HH:mm - HH:mm`), Category (`social`), Note/Location.
   - Statuses: `PENDING` (buttons: Accept / Decline), `ACCEPTED` (status badge: Confirmed · Added to Calendar), `DECLINED` (status badge: Declined).
5. **FR-05 (Calendar Auto-Sync):** On invitation acceptance, trigger a `createTimeBlock` call adding a `social` block with title and attendee label into the user's timeline.
6. **FR-06 (Mock Account Switcher):** Floating top-right widget to switch active persona (`Thai (Current User)` ⇄ `Minh (Friend)`) for end-to-end interactive demo.

---

## Non-Functional Requirements

- **Performance:** Instant in-memory message dispatch and UI state updates (< 50ms transition).
- **Design System:** Glassmorphic modern aesthetic matching Modo theme, rounded squircles, smooth framer-motion transitions, and light/dark mode support.
- **Neurodivergent Accessibility:** Clear visual hierarchy, no sudden loud notifications, transparent conflict warnings.

---

## Success Criteria

- [ ] Able to add a friend via Gmail and start a 1-1 chat session in < 3 clicks.
- [ ] Able to send a schedule invite, switch user profile, accept the invite, and verify the event appears on the Today/Calendar view.
- [ ] Clean build with 0 TypeScript and compile errors.

---

## Out of Scope (Phase 1 Mock Prototype)

- Real-time WebRTC audio/video calling.
- Complex group chats (> 2 people).
- External Google Calendar OAuth two-way sync (covered in later phase).

---

## Assumptions

- Mock storage with `localStorage` persistence is sufficient for presenting the idea and demoing interactive user flow.
- Primary user identity is `Thai` with mock friend `Minh`.
