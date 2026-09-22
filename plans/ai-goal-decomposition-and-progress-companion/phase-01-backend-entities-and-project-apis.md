# Phase 1: Backend Entities & Project APIs

**Parent Plan:** [plan.md](file:///d:/6_OJT/adaptive-planner/plans/ai-goal-decomposition-and-progress-companion/plan.md)  
**Spec Stories:** Core Decomposition & Planning (P1), Execution & Two-Tier Tracking (P1)

---

## 1. Objectives
Xây dựng cơ sở dữ liệu và các API endpoint quản lý `ProjectGoal` và `ProjectSubtask` trên Spring Boot.

---

## 2. Implementation Tasks

### 2.1 Entities & Enums
- Tạo `ProjectGoalStatus.java`: `PLANNING`, `IN_PROGRESS`, `COMPLETED`, `PAUSED`.
- Tạo `FeasibilityStatus.java`: `FEASIBLE`, `TIGHT`, `NOT_FEASIBLE`.
- Tạo `ProjectGoalEntity.java`:
  - `id` (String UUID)
  - `title` (String)
  - `description` (String)
  - `officialDeadline` (LocalDate)
  - `internalTargetDate` (LocalDate)
  - `bufferDays` (Integer)
  - `status` (`ProjectGoalStatus`)
  - `feasibilityStatus` (`FeasibilityStatus`)
  - `createdAt`, `updatedAt` (LocalDateTime)
- Tạo `ProjectSubtaskEntity.java`:
  - `id` (String UUID)
  - `projectId` (String)
  - `milestoneName` (String, e.g. "Research", "Wireframe", "UI Design", "Frontend")
  - `title` (String)
  - `estimatedMinutes` (Integer)
  - `completed` (Boolean)
  - `scheduledDate` (LocalDate)
  - `timeBlockId` (String, nullable)
  - `orderIndex` (Integer)

### 2.2 Repositories
- `ProjectGoalRepository.java`: `findAllByOrderByCreatedAtDesc()`, `findByStatus()`.
- `ProjectSubtaskRepository.java`: `findByProjectIdOrderByOrderIndexAsc()`, `findByScheduledDate()`, `findByTimeBlockId()`.

### 2.3 DTOs & Services
- `ProjectGoalDto.java` (tính toán `totalEstimatedMinutes`, `completedEstimatedMinutes`, `progressPercentage` derived trực tiếp từ subtasks).
- `ProjectSubtaskDto.java`.
- `ProjectGoalService.java`:
  - `createGoalWithSubtasks(...)`
  - `toggleSubtaskCompletion(subtaskId, completed)`
  - `getGoalDetail(projectId)`
  - `getTodaySubtasks(date)`

### 2.4 REST Controller
- `ProjectGoalController.java`:
  - `GET /api/projects`: Danh sách các dự án & tiến độ.
  - `GET /api/projects/{id}`: Chi tiết dự án, danh sách subtask và milestone.
  - `PATCH /api/projects/subtasks/{subtaskId}/toggle`: Đánh dấu hoàn thành / chưa hoàn thành subtask.
  - `GET /api/projects/today`: Lấy danh sách subtask của ngày hiện tại.

---

## 3. Verification Commands
- `mvn test -Dtest=ProjectGoalServiceTest`
