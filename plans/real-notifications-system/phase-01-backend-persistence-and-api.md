# Phase 1: Backend Persistence & REST API

**Goal**: Implement the database persistence layer, entity, repository, service with deduplication/idempotency, DTOs, and REST controller for notifications.

---

## 1. Scope & Deliverables

1. **Entity & Enum**:
   - `NotificationEntity`: `id`, `userId`, `type` (`NotificationType`), `priority` (`LOW`, `NORMAL`, `HIGH`), `title`, `message`, `relatedEntityType`, `relatedEntityId`, `actionType`, `actionData` (JSON text), `isRead`, `readAt`, `eventKey` (indexed, unique/deduplication), `scheduledFor`, `deliveredAt`, `createdAt`.
   - `NotificationType` enum: `BLOCK_STARTING`, `BLOCK_STARTED`, `BLOCK_ENDED`, `DEADLINE_WARNING`, `TASK_OVERDUE`, `SCHEDULE_CONFLICT`, `REBALANCE_AVAILABLE`, `SCHEDULE_CHANGED`, `MILESTONE_COMPLETED`, `PROJECT_COMPLETED`.
2. **Repository**:
   - `NotificationRepository`:
     - `findByOrderByCreatedAtDesc()`
     - `countByIsReadFalse()`
     - `findByEventKey(String eventKey)`
     - `findAllByIsReadFalseOrderByCreatedAtDesc()`
3. **Service (`NotificationService`)**:
   - `getNotifications()`
   - `getUnreadCount()`
   - `markAsRead(Long id)`
   - `markAllAsRead()`
   - `deleteNotification(Long id)`
   - `createNotification(CreateNotificationRequest request)` with idempotency check against `eventKey`.
4. **Controller (`NotificationController`)**:
   - `GET /api/notifications`
   - `GET /api/notifications/unread-count`
   - `PUT /api/notifications/{id}/read`
   - `PUT /api/notifications/read-all`
   - `DELETE /api/notifications/{id}`
5. **Unit & Integration Tests**:
   - `NotificationControllerTest.java` & `NotificationServiceTest.java`.

---

## 2. Verification
- `mvn test -Dtest=NotificationControllerTest,NotificationServiceTest` passes 100%.
