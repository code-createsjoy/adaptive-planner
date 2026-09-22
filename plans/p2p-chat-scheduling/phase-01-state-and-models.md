# Phase 1: Models & State Management

## Goal
Establish TypeScript data structures, initial mock seed data, and a persistent Zustand store (`useP2PChatStore`) for friends, messages, schedule invitations, and active user persona.

## Target Files
- `src/features/chat/types.ts` [NEW]
- `src/features/chat/store/useP2PChatStore.ts` [NEW]

## Detailed Implementation Steps
1. **Define Data Models (`src/features/chat/types.ts`):**
   - `UserPersona`: `id`, `name`, `email`, `avatarUrl`, `status` ('online' | 'busy' | 'offline').
   - `ScheduleInviteData`: `inviteId`, `title`, `date` (YYYY-MM-DD), `startTime` (HH:mm), `endTime` (HH:mm), `category` ('social' | 'focus' | 'admin'), `location`?: string, `note`?: string, `status`: 'PENDING' | 'ACCEPTED' | 'DECLINED', `senderId`: string, `recipientId`: string.
   - `ChatMessage`: `id`, `senderId`, `recipientId`, `timestamp`: string, `type`: 'text' | 'schedule_invite', `text`?: string, `invite`?: ScheduleInviteData.
   - `FriendContact`: extends `UserPersona` with `unreadCount`: number, `lastMessage`?: string, `lastMessageTime`?: string.

2. **Define Seed Mock Data:**
   - Persona A: `user-thai` ("Thai", `quoc.thai@modo.app`, avatar: `/thai-avatar.jpg`).
   - Persona B: `user-minh` ("Minh (UI Designer)", `minh.designer@gmail.com`, avatar: random styled avatar).
   - Persona C: `user-lan` ("Lan (Product Lead)", `lan.product@gmail.com`, avatar: random styled avatar).
   - Seed conversation between Thai and Minh with friendly chat history and a sample pending coffee invite.

3. **Build Zustand Store (`useP2PChatStore.ts`):**
   - State: `activeUserId` ('user-thai' | 'user-minh'), `activeFriendId`: string | null, `friends`: FriendContact[], `messages`: ChatMessage[], `searchQuery`: string.
   - Actions:
     - `switchActiveUser(userId: string)`: switches active persona.
     - `selectFriend(friendId: string)`: sets active chat and marks unread messages as read.
     - `sendTextMessage(recipientId: string, text: string)`: appends outgoing message.
     - `sendScheduleInvite(recipientId: string, invite: Omit<ScheduleInviteData, 'inviteId' | 'senderId' | 'recipientId' | 'status'>)`: generates invite card.
     - `respondToInvite(inviteId: string, status: 'ACCEPTED' | 'DECLINED')`: updates invite status.
     - `addFriendByEmail(email: string, name?: string)`: adds new friend with mock online status.
     - Persistence: `localStorage` wrapper so demo stays consistent across page reloads with a quick "Reset Demo Chat" option.

## Verification
- Unit test / type check passes with zero TS errors.
- Store actions correctly update messages and active user state.
