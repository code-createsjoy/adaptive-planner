# Brainstorm: AI Chat Sessions & Activity History (Decision Audit Trail)

**Date:** 2026-09-20

## Ideas Explored
1. **Chat-only History**: Simple ChatGPT-style conversation threads list. Good for context recall, but disconnects the actual timetable mutation from the explanation.
2. **Activity-only Log**: Raw database audit table (CRUD events on time blocks). Factual, but lacks the empathetic "Why" and the AI negotiation context.
3. **Unified Hybrid Architecture (Selected)**: Dual linked model — `ChatSession` (conversations, messages, proposed options) linked via `conversationId` to `AdaptationAction` (decision snapshots, why, diff changes, instant undo).

## User's Direction
- **Philosophy**: Support the core loop — *Understand what changed → Understand why → Choose how to adapt*.
- **Structure**:
  - **AI Chat History**: Sidebar grouped by timeline (Today, Yesterday, Date) allowing review of dialogues and proposed scenarios.
  - **Activity / Decision History**: Timeline of changes showing the event disruption, the AI's explanation (`WHY`), and before/after diffs (`CHANGES`) with links to the corresponding conversation.
  - **Undo & Safety**: Instant full-plan rollback immediately after applying a scenario (`[Undo]` toast). Defer arbitrary historical revert to P2 to avoid state conflicts.

## Scope Breakdown
- **P1 (MVP / Core)**:
  - Backend schema & APIs for `ConversationEntity`, `ChatMessageEntity`, and `AdaptationActionEntity`.
  - Storing proposed AI scenarios and the user's chosen option.
  - Storing before/after block diff snapshots on `applyAdaptation`.
  - Frontend AI Chat history sidebar (list sessions, resume / view messages).
  - Frontend Activity / Decision history drawer or view (timeline of decisions + diff view + why).
  - Instant multi-block rollback (Undo) after applying an adaptation.
- **P2 (Next Phase)**:
  - Full-text search and filtering in history.
  - Arbitrary historical snapshot reverts with conflict detection.
  - Daily & weekly aggregate decision summaries.

## Open Questions
- Storage of message metadata: JSON payload in PostgreSQL for rich blocks/scenarios representation.
- Session lifecycle: Auto-create session on first prompt or explicit "New Chat" button with auto-titling.

## Risks
1. **Data Bloat from Snapshots**: Persisting full before/after block snapshots on every adaptation could grow over time $\rightarrow$ Mitigate by storing minimal diffs or JSON payloads.
2. **Out-of-Order History Reverts (P2)**: Reverting an old plan when intermediate manual edits were made $\rightarrow$ Keep out of MVP, restrict MVP strictly to instant undo.
