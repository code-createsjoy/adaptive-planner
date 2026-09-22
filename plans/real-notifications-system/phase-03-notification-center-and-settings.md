# Phase 3: Real Notification Center UI & Settings

**Goal**: Replace mock data in `NotificationsView` with real PostgreSQL-backed notifications, implement grouping, unread badge synchronization, and notification preference settings.

---

## 1. Scope & Deliverables

1. **In-App Notification Center (`NotificationsView`)**:
   - Fetches live notifications from `GET /api/notifications`.
   - Groups notifications into:
     - `Hôm nay (Today)`
     - `Hôm qua (Yesterday)`
     - `Cũ hơn (Earlier)`
   - Displays unread status dot, timestamp relative format, title, message, priority tag, and CTA buttons.
   - Action buttons:
     - `Đánh dấu đã đọc (Mark as read)` per item.
     - `Đánh dấu tất cả đã đọc (Mark all as read)` header button.
     - `Xóa thông báo (Delete)` option.
2. **Sidebar Real Unread Badge Counter**:
   - Sidebar item `Notifications` uses live `unreadCount` fetched from `GET /api/notifications/unread-count`.
   - Badge updates in real time when notifications are received or marked as read.
3. **Notification Preferences in Settings**:
   - Remind early selector: `5 phút`, `10 phút`, `15 phút` trước khi bắt đầu.
   - Toggles for In-app notifications, Browser notifications (with gentle permission request), and Audio Chime.
   - Focus protection rules: "Không làm phiền khi đang Deep Work / Break / Sleep".

---

## 2. Verification
- Marking notifications as read immediately decrements sidebar badge and persists across page refreshes.
- Empty notification state displays an elegant, helpful zero-state card.
