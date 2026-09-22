# Phase 2: UI Components & Interactive Elements

## Goal
Construct polished, responsive, glassmorphic UI components for the Friends & Chat feature following the Modo design system.

## Target Files
- `src/features/chat/components/FriendsChatView.tsx` [NEW]
- `src/features/chat/components/FriendListPane.tsx` [NEW]
- `src/features/chat/components/ChatConversationPane.tsx` [NEW]
- `src/features/chat/components/ScheduleInviteCard.tsx` [NEW]
- `src/features/chat/components/InviteScheduleModal.tsx` [NEW]
- `src/features/chat/components/AddFriendModal.tsx` [NEW]
- `src/features/chat/components/PersonaSwitcherWidget.tsx` [NEW]

## Detailed Implementation Steps
1. **`PersonaSwitcherWidget.tsx`:**
   - Floating badge / top banner allowing immediate 1-click toggle between `Thai (You)` and `Minh (Friend)`.
   - Visual indicator showing current active persona and quick demo explanation ("Switch persona to view the conversation and accept/decline invites from the friend's perspective").

2. **`FriendListPane.tsx`:**
   - Search bar to filter contacts by name or email.
   - "+ Add Friend" button opening `AddFriendModal`.
   - Friend items showing avatar with online badge, name, email, last message snippet, and unread bubble.
   - Selected state highlight with smooth squircle border.

3. **`AddFriendModal.tsx`:**
   - Clean dialog input for Gmail address (with helpful quick-add suggestions like `minh.designer@gmail.com`, `lan.product@gmail.com`, `huan.engineer@gmail.com`).
   - "Add Friend" validation and feedback toast.

4. **`ScheduleInviteCard.tsx`:**
   - Distinctive visual card embedded directly in message flow with `CalendarPlus` icon and calm tinted background (`bg-primary/10 border-primary/20`).
   - Shows meeting title, date, start-to-end time, note/location.
   - Status states:
     - **Pending (Recipient view):** `[Accept]` (primary solid button) & `[Decline]` (subtle ghost button).
     - **Pending (Sender view):** "Waiting for recipient to respond..." badge.
     - **Accepted:** Green `CheckCircle2` badge "Confirmed · Pinned to Calendar".
     - **Declined:** Muted badge "Declined".
   - Conflict check badge: highlights if time slot overlaps with existing events.

5. **`InviteScheduleModal.tsx`:**
   - Modal triggered via `Calendar` button in the chat prompt bar.
   - Inputs: Meeting Title (default: "Quick Sync / Coffee"), Date (date picker or today/tomorrow shortcuts), Start Time, End Time, Category (`social`), Note/Location (e.g. "Discord voice / Highlands Coffee").
   - "Send Invitation" button that dispatches the `schedule_invite` message into the chat.

6. **`ChatConversationPane.tsx`:**
   - Chat header with active friend avatar, name, email, and online status.
   - Scrollable message bubble list with auto-scroll on new message.
   - Message bubbles:
     - Outgoing (active user): right-aligned, primary accent background, squircle rounded corners.
     - Incoming (friend): left-aligned, card background, border.
   - Footer with message text input, emoji shortcut, "Create Invite" action button (`CalendarPlus`), and "Send" button.

7. **`FriendsChatView.tsx`:**
   - Main container assembling `FriendListPane` (left column) and `ChatConversationPane` (right main area) with responsive support (collapsible sidebar on smaller screens).

## Verification
- Verify layout responsiveness, transitions, and hover states.
- Verify modals open and close cleanly without scroll locking issues.
