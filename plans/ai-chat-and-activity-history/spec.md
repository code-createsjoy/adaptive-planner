# Spec: AI Chat Sessions & Activity History (Decision Audit Trail)

**Date:** 2026-09-20  
**Status:** Ready

---

## Problem Statement
When schedules change dynamically or unexpected disruptions occur, neurodivergent users can feel overwhelmed or forget why certain tasks were moved, deferred, or prioritized. There is currently no persistent record of past chat interactions with the AI Planner or historical audit log linking decisions back to their reasoning.

---

## User Stories

<!-- P1 = MVP (must ship), P2 = nice-to-have, P3 = future/out-of-scope -->

- **[P1]** As a user, I want to review past AI Chat sessions grouped by date (Today, Yesterday, Older) so that I can remember what I discussed with AI and what options were proposed.  
  *Accepted when:* User can open a sidebar, see past conversations, click any session, and load the full message history including proposed scenarios.

- **[P1]** As a user, I want each schedule adjustment to record an `AdaptationAction` with its reasoning (Why) and changes (Before/After diff) linked to the conversation so that I have clear transparency into how my schedule evolved.  
  *Accepted when:* Applying an adaptation saves the action snapshot in the database and lists it in the Activity History timeline.

- **[P1]** As a user, I want to see a dedicated Activity / Decision History view so that I can inspect the timeline of adjustments made to my day.  
  *Accepted when:* Clicking an item in Activity History expands the `WHY` bullets, before/after time block changes, and provides a direct "View Conversation" button.

- **[P1]** As a user, I want an instant Undo button immediately after applying an AI plan so that I can safely revert the entire multi-block modification without manual editing.  
  *Accepted when:* Clicking "Undo" within the toast window rolls back all affected blocks to their exact pre-adaptation state.

- **[P2]** As a user, I want to search and filter conversation history and activity logs by date, keywords, or event tags.  
  *Accepted when:* Typing in a search bar instantly filters past sessions and adaptation records.

- **[P2]** As a user, I want to safely revert an older historical adaptation even hours later, with state conflict checking.  
  *Accepted when:* Clicking revert on a historical action checks current block states and warns if subsequent manual modifications conflict.

- **[P3]** _(Out of scope)_ Daily/Weekly AI summary report generation aggregating all adjustments and focus metrics.

---

## Functional Requirements

1. **FR-01: Conversation & Message Persistence**  
   - Backend persists `ConversationEntity` (`id`, `title`, `createdAt`, `updatedAt`) and `ChatMessageEntity` (`id`, `conversationId`, `role`, `content`, `metadataJson`, `createdAt`).
   - REST endpoints: `GET /api/ai/conversations`, `GET /api/ai/conversations/{id}`, `POST /api/ai/conversations`, `DELETE /api/ai/conversations/{id}`.

2. **FR-02: Adaptation Action Audit Persistence**  
   - Backend persists `AdaptationActionEntity` (`id`, `conversationId`, `targetDate`, `reason`, `selectedScenarioId`, `explanationJson`, `beforeSnapshotJson`, `afterSnapshotJson`, `status`, `createdAt`).
   - REST endpoints: `GET /api/ai/adaptations?date={date}`, `POST /api/ai/adaptations/undo/{actionId}`.

3. **FR-03: Chat History Sidebar in UI**  
   - A collapsible sidebar in the AI Planner view showing conversations grouped by `Hôm nay`, `Hôm qua`, `Tháng này`.
   - Ability to start a "Cuộc trò chuyện mới" (New Chat) or switch between active threads.

4. **FR-04: Activity & Decision Timeline Component**  
   - Timeline UI displaying chronological schedule changes:
     - Trigger event (e.g. `Họp đột xuất 17:00–18:30`)
     - AI Reasoning summary (Why: Protected boundaries, deadlines, buffers)
     - Block diff chips (e.g. `Học Java: 15:00 → 19:00`, `Chơi game: 21:00 → Ngày mai`)
     - Action link to open corresponding conversation thread.

5. **FR-05: Multi-Block Instant Rollback**  
   - When a scenario is applied, `beforeSnapshot` is stored in the response.
   - Frontend displays an interactive toast with `[Hoàn tác (Undo)]` lasting 10 seconds.
   - Triggering Undo calls `POST /api/ai/adaptations/undo/{actionId}` which atomically restores the before-snapshot in PostgreSQL.

---

## Non-Functional Requirements

- **Performance**: Fetching conversation list and activity logs must respond with p95 < 150ms.
- **Data Integrity**: Adaptation rollback must execute in an isolated `@Transactional` database operation.
- **Storage Efficiency**: Snapshots stored as compressed JSONB in PostgreSQL.

---

## Success Criteria

- [ ] All chat messages, proposed options, and user choices persist across browser refreshes.
- [ ] User can click any past conversation to review full message bubbles and recommendation cards.
- [ ] Every adaptation execution records a timestamped `AdaptationAction` linked to `conversationId`.
- [ ] User can view the "Why & Changes" diff in the Activity History timeline.
- [ ] Instant Undo successfully restores all shifted and deferred blocks in a single click.

---

## Out of Scope (P1)

- Arbitrary out-of-order historical reverts past the instant undo window (deferred to P2).
- Semantic vector search across past chat conversations (deferred to P2).

---

## Assumptions

- PostgreSQL database is active and supports JSON columns/entities.
- User operates within a single-user profile context for the MVP.
