# Implementation Plan: AI Chat Sessions & Activity History (Decision Audit Trail)

Mode: --hard
Risk: normal — Database entity models and REST endpoints for chat/adaptation history + UI sidebar & activity drawer, isolated from core timetable scheduling math.

---

## Architecture Overview

```
                          AI Planner Interaction
                                    │
            ┌───────────────────────┴───────────────────────┐
            ↓                                               ↓
    Chat Session Service                            Adaptation Audit Service
  (Conversations & Messages)                     (Decision Snapshots & Diffs)
            │                                               │
    ┌───────┴───────┐                               ┌───────┴───────┐
    ↓               ↓                               ↓               ↓
Conversation   ChatMessage                   AdaptationAction  Before/After Diffs
   Entity         Entity                          Entity           (JSONB)
            │                                               │
            └───────────────────────┬───────────────────────┘
                                    ↓
                     Linked by `conversationId`
                                    │
               ┌────────────────────┴────────────────────┐
               ↓                                         ↓
     AI Chat History Sidebar                 Activity History Drawer
 (Timeline Groups: Today/Older)          (Why Reason + Diffs + Instant Undo)
```

---

## Phase Breakdown

### [Phase 1: Database & Backend Entity Models](phase-01-database-and-backend-entities.md)
- Define `ConversationEntity` (`id`, `title`, `createdAt`, `updatedAt`).
- Define `ChatMessageEntity` (`id`, `conversationId`, `role`, `content`, `metadataJson`, `createdAt`).
- Define `AdaptationActionEntity` (`id`, `conversationId`, `targetDate`, `reason`, `selectedScenarioId`, `explanationJson`, `beforeSnapshotJson`, `afterSnapshotJson`, `status`, `createdAt`).
- Create JPA Repositories for all 3 entities.

### [Phase 2: Backend History & Multi-Block Undo APIs](phase-02-backend-history-and-undo-apis.md)
- `ConversationService` & `AiHistoryController`:
  - `GET /api/ai/conversations`: list all sessions ordered by `updatedAt DESC`.
  - `GET /api/ai/conversations/{id}`: retrieve conversation with messages.
  - `POST /api/ai/conversations`: create or append messages.
  - `DELETE /api/ai/conversations/{id}`: delete session.
- `AdaptationService` extensions:
  - Save full `AdaptationAction` on `applyAdaptation` (recording before & after block lists + explanation).
  - `GET /api/ai/adaptations?date={date}`: fetch decision history with diffs.
  - `POST /api/ai/adaptations/undo/{actionId}`: atomic multi-block rollback restoring `beforeSnapshot`.

### [Phase 3: Frontend AI Chat Sessions Sidebar](phase-03-frontend-chat-session-sidebar.md)
- React Query hooks (`useConversationsQuery`, `useConversationDetailQuery`, `useCreateConversationMutation`, `useDeleteConversationMutation`).
- Collapsible Chat Sidebar inside AI Planner view:
  - Grouped by `Hôm nay`, `Hôm qua`, `Tháng này`.
  - "Cuộc trò chuyện mới" (+ New Chat) button.
  - Active conversation switching with full message bubble & scenario card hydration.

### [Phase 4: Frontend Activity History Timeline & Instant Undo](phase-04-frontend-activity-history-timeline-and-undo.md)
- Activity History Drawer / Component:
  - Chronological decision events (Disruption $\rightarrow$ AI Options $\rightarrow$ Applied Option).
  - Expandable `WHY` bullets & visual block diff chips (`Học Java: 15:00 → 19:00`, `Gaming → Ngày mai`).
  - "Xem cuộc trò chuyện" (View Conversation) button jumping to the linked chat session.
- Instant 10-second Undo Toast immediately after applying an adaptation, restoring all modified blocks in 1-click.

---

## Verification Plan

### Automated Tests
- `mvn test -Dtest=AiHistoryControllerTest,AdaptationServiceTest`
- Verify persistence, diff recording, and multi-block rollback.

### Manual Verification
1. Start a chat in AI Planner ("ngày 21 tôi có cuộc họp đột xuất từ 6h30 tới 8h30 tối").
2. Apply the recommended scenario $\rightarrow$ verify `[Hoàn tác (Undo)]` toast appears.
3. Check Activity History $\rightarrow$ verify the adaptation entry displays with Why bullets & Before/After diffs.
4. Click "Xem cuộc trò chuyện" $\rightarrow$ verify it switches to the exact chat session.
5. Click "Hoàn tác" $\rightarrow$ verify all blocks immediately restore to their original slots.
