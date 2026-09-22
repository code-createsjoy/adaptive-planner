# Phase 1: Database & Backend Entity Models

## Goal
Implement persistent database tables and JPA entities for conversations, messages, and adaptation decision actions.

---

## Technical Specifications

### 1. `ConversationEntity`
- Table: `ai_conversations`
- Fields:
  - `id`: `Long` (Primary Key, Auto-increment)
  - `title`: `String` (nullable = false)
  - `createdAt`: `LocalDateTime` (nullable = false)
  - `updatedAt`: `LocalDateTime` (nullable = false)
  - `@OneToMany` `List<ChatMessageEntity> messages`

### 2. `ChatMessageEntity`
- Table: `ai_chat_messages`
- Fields:
  - `id`: `Long` (Primary Key, Auto-increment)
  - `conversationId`: `Long` (nullable = false, indexed)
  - `role`: `String` ("user" | "assistant" | "system")
  - `content`: `String` (columnDefinition = "TEXT")
  - `metadataJson`: `String` (columnDefinition = "TEXT", stores proposed scenarios, pending cards, or quick actions)
  - `createdAt`: `LocalDateTime` (nullable = false)

### 3. `AdaptationActionEntity`
- Table: `adaptation_actions`
- Fields:
  - `id`: `Long` (Primary Key, Auto-increment)
  - `conversationId`: `Long` (nullable = true, links to chat session)
  - `targetDate`: `LocalDate` (nullable = false)
  - `reason`: `String` (e.g. "Họp đột xuất 17:00–18:30")
  - `selectedScenarioId`: `String` (e.g. "recommended" | "alt_cascade")
  - `scenarioTitle`: `String` (e.g. "Điều chỉnh thông minh (Khuyến nghị)")
  - `explanationJson`: `String` (columnDefinition = "TEXT", structured JSON of what changed, what will happen, and why reasons)
  - `beforeSnapshotJson`: `String` (columnDefinition = "TEXT", full list of TimeBlocks before adaptation)
  - `afterSnapshotJson`: `String` (columnDefinition = "TEXT", full list of TimeBlocks after adaptation)
  - `status`: `String` ("APPLIED" | "UNDONE")
  - `createdAt`: `LocalDateTime` (nullable = false)

### 4. JPA Repositories
- `ConversationRepository`
- `ChatMessageRepository`
- `AdaptationActionRepository` (with `findByTargetDateOrderByCreatedAtDesc(LocalDate date)` and `findAllByOrderByCreatedAtDesc()`)

---

## Verification
- Spring Data JPA entities map properly without startup or dialect errors.
- Schema auto-creates cleanly on PostgreSQL.
