# Phase 3: Sidebar Integration, Calendar Auto-Sync & E2E Validation

## Goal
Connect the `FriendsChatView` to the main application navigation, integrate invitation acceptance with `useCreateTimeBlockMutation` so accepted invites automatically show up on the timeline and calendar, and validate the end-to-end user presentation flow.

## Target Files
- `src/components/adaptive/AdaptiveApp.tsx` [MODIFY]
- `src/features/chat/components/ScheduleInviteCard.tsx` [MODIFY]
- `src/features/chat/index.ts` [NEW]

## Detailed Implementation Steps
1. **Update Navigation in `AdaptiveApp.tsx`:**
   - Add `{ id: "friends-chat", label: "Friends & Chat", icon: Users }` (or `MessageSquareShare` / `Users2`) to `navigation` array.
   - Update `ViewId` type.
   - Compute total unread message count from `useP2PChatStore` and display badge count in sidebar navigation for `friends-chat`.
   - Render `<FriendsChatView />` when `view === "friends-chat"`.

2. **Hook Calendar TimeBlock Auto-Creation:**
   - In `ScheduleInviteCard.tsx`, on `Accept` click:
     - Dispatch `respondToInvite(invite.inviteId, 'ACCEPTED')`.
     - Invoke `createTimeBlockMutation.mutateAsync(...)` with:
       - `title`: `invite.title` (e.g., `Coffee & Design Sync with Minh`)
       - `category`: `social`
       - `targetDate`: `invite.date`
       - `startTime`: `invite.startTime`
       - `endTime`: `invite.endTime`
       - `energyLevel`: `medium`
       - `isFixed`: `true`
       - `note`: `invite.note` || `Scheduled via Modo Friends Chat`
     - Display toast notification: `Meeting added to your Day Timeline! 🎉`.

3. **End-to-End Presentation Workflow Testing:**
   - Test Step 1: Open "Friends & Chat" tab from sidebar.
   - Test Step 2: Add friend using Gmail (`lan.product@gmail.com`).
   - Test Step 3: Send a message and schedule invitation from `Thai` to `Minh`.
   - Test Step 4: Click the Persona Switcher toggle to switch to `Minh`.
   - Test Step 5: Observe the invite card rendered with `[Accept]` and `[Decline]` buttons.
   - Test Step 6: Click `[Accept]`, switch back to `Thai`, and verify the meeting is created in the Day Timeline / Monthly Calendar.

## Verification
- TypeScript build passes cleanly (`npx tsc --noEmit` or Vite build check).
- Browser verification verifying full interactive flow.
