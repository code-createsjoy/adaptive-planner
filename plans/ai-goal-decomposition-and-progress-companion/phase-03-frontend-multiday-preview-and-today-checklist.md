# Phase 3: Frontend Multi-Day Preview & Today's Checklist

**Parent Plan:** [plan.md](file:///d:/6_OJT/adaptive-planner/plans/ai-goal-decomposition-and-progress-companion/plan.md)  
**Spec Stories:** Core Decomposition & 3-Scenario Scheduling (P1), Execution & Two-Tier Tracking (P1)

---

## 1. Objectives
Phát triển các component giao diện người dùng trên frontend để hiển thị Roadmap Preview nhiều ngày khi click kịch bản, checklist subtask trong Day Timeline, và Project Progress Widget.

---

## 2. Implementation Tasks

### 2.1 Multi-Day Roadmap Impact Preview
- Nâng cấp `ScenarioDiffPreviewCard.tsx` hoặc tạo `GoalRoadmapPreviewCard.tsx`:
  - Hiển thị theo nhóm ngày (`Mon 21`, `Tue 22`, `Wed 23`... -> `Final testing` -> `Protected Buffer`).
  - Badge trực quan: `Tận dụng Routine`, `Deep Work Block`, `Buffer Day`.
  - Nút *"Áp dụng kế hoạch này"* kích hoạt API lưu toàn bộ roadmap vào lịch.

### 2.2 Two-Tier Tracking Components
- **Tầng 1 - Day Timeline Block Checklist**:
  - Khi một `TimeBlock` gắn với Project Subtasks:
    - Hiển thị danh sách checklist: `☑ Create navbar`, `☐ Build hero section`...
    - Progress mini: `Progress today: 1/4 (37% project)`.
    - Hỗ trợ tick hoàn thành với optimistic update mượt mà (`< 50ms`).
- **Tầng 2 - Project Progress Widget**:
  - Card tổng quan gọn gàng trên sidebar / top dashboard:
    - Tên Goal + Deadline (vd: *Website Mini · Oct 5*).
    - Progress Bar derived: `42%`.
    - Milestone Indicator: `✓ Research` → `✓ Wireframe` → `● Frontend` → `○ Backend`...
    - Trạng thái: `On track · 2 days buffer remaining`.

### 2.3 Frontend Hooks & State Management
- `useGoalPlanner.ts`: Quản lý query & mutation cho Goal decomposition, apply scenario, và toggle subtask completion.

---

## 3. Verification Commands
- `npm run build`
