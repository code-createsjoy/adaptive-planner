# Phase 4: "Last Week" Reflection Card & 1-Click Diff Preview Integration

## Context & Objectives
Implement the bottom half of the Progressive Insights page — **Tuần trước (Last Week — Reflection & Learning)**. It provides an empathetic retrospective summary of last week and an actionable 1-click button `[ Áp dụng mẫu hình này → Xem trước ]` that opens the **Adaptive Diff Preview** for upcoming timetable optimization.

## File Ownership
- [NEW] `adaptive-planner-frontend/src/features/insights/components/LastWeekReflectionCard.tsx`
- [MODIFY] `adaptive-planner-frontend/src/features/insights/InsightsView.tsx`
- [MODIFY] `adaptive-planner-frontend/src/features/insights/components/InsightPatternCard.tsx`

## Detailed Implementation Steps

1. **Build `LastWeekReflectionCard.tsx`:**
   - Header with previous week date range (`Tuần trước · 14/09 - 20/09`) and retrospective badge (`🌿 Nhìn lại & Đúc kết`).
   - Summary metrics in soft pastel containers:
     - 🎯 **Nỗ lực đã hoàn thành:** `18 / 22 tasks` (`81%`)
     - ⏳ **Tổng thời lượng Deep Focus:** `8h 15m`
   - Key retrospective pattern callout:
     - *"Bạn hoàn thành các công việc phức tạp ổn định nhất trước 12:00 trưa."*
     - Collapsible **"Tại sao Modo nhận thấy điều này?"** section explaining: *"82% các ca làm việc trước 12h đạt trạng thái hoàn tất mà không cần dời lịch."*
   - Actionable proposal box:
     - Title: *"💡 Gợi ý thích ứng: Bảo vệ 1 khung giờ tập trung buổi sáng tuần này"*
     - Description: *"Đặt một khối Deep Work (09:00 - 10:30) vào các ngày làm việc để duy trì năng lượng cao nhất."*
     - Action Button: `[ Áp dụng mẫu hình này → Xem trước lịch ]` (opens schedule diff preview modal).

2. **Connect Diff Preview Flow:**
   - When the user clicks the suggestion button, open the existing scenario/adaptation diff preview dialog with the proposed morning focus blocks pre-populated.
   - The user can review the before/after impact and click `[ Xác nhận áp dụng ]` (with standard 10s undo safety toast).

3. **Complete `InsightsView.tsx` Layout Integration:**
   - Page Title: **"Insights & Nhịp điệu cá nhân"**
   - Subtitle: *"Your patterns, not your performance · Nhận diện mẫu hình để nâng đỡ lịch trình, không phải để tự phán xét."*
   - Section 1: `ThisWeekProgressCard` (Live accumulated metrics + Daytime rhythm).
   - Section 2: `LastWeekReflectionCard` (Retrospective learnings + 1-click diff preview).
   - Section 3: Existing pattern observations & history list.

## Verification
- Run tests and frontend build:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-backend && mvn test "-Dtest=ProgressiveInsightsServiceTest,InsightsControllerTest"
  cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend && npm run build
  ```
