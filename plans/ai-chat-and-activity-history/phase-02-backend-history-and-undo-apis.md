# Phase 2: Backend History & Multi-Block Undo APIs

## Goal
Expose REST controllers and business services to manage conversation history, store adaptation audit logs with diff snapshots, and atomically rollback multi-block adjustments.

---

## Technical Specifications

### 1. `ConversationService` & `AiHistoryController`
- DTOs:
  - `ConversationDto`: `id`, `title`, `createdAt`, `updatedAt`, `messages: List<ChatMessageDto>`, `lastMessagePreview: String`
  - `ChatMessageDto`: `id`, `role`, `content`, `metadataJson`, `createdAt`
  - `CreateConversationRequest`: `title`, `initialMessage: ChatMessageDto`
  - `AppendMessageRequest`: `role`, `content`, `metadataJson`
- Endpoints:
  - `GET /api/ai/conversations`: Returns summary list of all conversations ordered by `updatedAt DESC`.
  - `GET /api/ai/conversations/{id}`: Returns full conversation with messages.
  - `POST /api/ai/conversations`: Creates a new conversation with auto-generated title or initial message.
  - `POST /api/ai/conversations/{id}/messages`: Appends a new message to an existing conversation.
  - `DELETE /api/ai/conversations/{id}`: Deletes a conversation and cascades to messages.

### 2. Adaptation Audit & Multi-Block Undo
- Extend `AdaptationService`:
  - On `applyAdaptation`:
    1. Read and serialize the current active `TimeBlock` list for `targetDate` $\rightarrow$ `beforeSnapshotJson`.
    2. Apply the requested `newBlocks` batch update.
    3. Read and serialize the new active `TimeBlock` list $\rightarrow$ `afterSnapshotJson`.
    4. Save `AdaptationActionEntity` with `conversationId`, `reason`, `explanationJson`, `beforeSnapshotJson`, `afterSnapshotJson`, and `status = "APPLIED"`.
    5. Return `AdaptationResultDto` with `actionId` for immediate client undo.
  - `GET /api/ai/adaptations?date={date}`: Returns list of adaptation records for a date (or all if omitted).
  - `POST /api/ai/adaptations/undo/{actionId}`:
    1. Retrieve `AdaptationActionEntity` by `actionId`.
    2. Check if already `status == "UNDONE"`.
    3. Deserialize `beforeSnapshotJson` back into `List<TimeBlockDto>`.
    4. Atomically replace the current day's active blocks with the restored snapshot inside a `@Transactional` boundary.
    5. Mark entity `status = "UNDONE"`.
    6. Return restored `List<TimeBlockDto>`.

---

## Verification
- Unit test `AiHistoryControllerTest` testing session creation, message append, and list.
- Unit test `AdaptationServiceTest` verifying before/after snapshots and instant rollback.
