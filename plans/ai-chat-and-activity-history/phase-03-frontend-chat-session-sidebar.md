# Phase 3: Frontend AI Chat Sessions Sidebar

## Goal
Build a ChatGPT-style sidebar in the AI Planner view that loads, organizes, and switches between conversation sessions.

---

## Technical Specifications

### 1. API Client & React Query Hooks
- File: `src/hooks/useConversations.ts` & `src/lib/api.ts`
- Query keys: `['conversations']`, `['conversation', id]`
- Hooks:
  - `useConversationsQuery()`
  - `useConversationDetailQuery(id)`
  - `useCreateConversationMutation()`
  - `useAppendMessageMutation()`
  - `useDeleteConversationMutation()`

### 2. Chat Sidebar Component
- Component: `ChatHistorySidebar.tsx`
- Layout:
  - Header: "+ Cuộc trò chuyện mới" (New Chat) button with icon.
  - Grouped Section List:
    - **Hôm nay (Today)**
    - **Hôm qua (Yesterday)**
    - **Tháng này (This Month)**
    - **Cũ hơn (Older)**
  - Conversation Item:
    - Title (e.g. `Họp đột xuất chiều nay`, `Lên lịch học Java`)
    - Last updated relative time (e.g. `2 giờ trước`, `Hôm qua`)
    - Active indicator with highlight badge
    - Delete icon button on hover
  - Mobile responsive drawer support.

### 3. State Hydration in AI Planner
- When switching active conversation:
  - Hydrate `plannerMessages` from server messages.
  - Parse metadata for cards (pending activities, conflict warnings, recommended scenario cards).
  - Set active `conversationId` so subsequent prompts append to the current thread.

---

## Verification
- Switching sessions loads conversation history smoothly without lag.
- New chat starts a clean conversation and auto-saves on first message.
