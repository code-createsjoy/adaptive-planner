# Phase 2: AI Decomposition & Rebalancing Engine

**Parent Plan:** [plan.md](file:///d:/6_OJT/adaptive-planner/plans/ai-goal-decomposition-and-progress-companion/plan.md)  
**Spec Stories:** Core Decomposition & 3-Scenario Scheduling (P1), Smart Progress Companion & Dynamic Rebalancing (P1)

---

## 1. Objectives
Phát triển logic AI phân rã WBS từ mục tiêu và deadline tự nhiên, tính toán quỹ thời gian khả dụng theo lịch, sinh 3 kịch bản xếp lịch đa ngày có buffer, và thuật toán tái cân bằng (Rebalancing) khi trễ task.

---

## 2. Implementation Tasks

### 2.1 Prompt Engineering & WBS Parsing
- Prompt system chuyên biệt cho Goal Decomposition:
  - Input: Goal text + Deadline date + Current date + Routine summary.
  - Output: JSON structured object chứa:
    - `goalTitle`
    - `officialDeadline`
    - `internalTargetDate`
    - `bufferDays`
    - `totalRequiredMinutes`
    - `milestones`: `[{ name: "UI Design", subtasks: [{ title: "Build Hero", estimatedMinutes: 60 }] }]`
- Fallback heuristic generator nếu LLM offline hoặc parse timeout.

### 2.2 Feasibility & Multi-Day 3-Scenario Generator
- `GoalScheduleService.java`:
  - `evaluateFeasibility(currentSchedule, startDate, deadline, totalRequiredMinutes)`:
    - `FEASIBLE`: Quỹ thời gian trống $\ge$ tổng thời gian + buffer.
    - `TIGHT`: Quỹ thời gian trống $\approx$ tổng thời gian (ít hơn 2h buffer).
    - `NOT_FEASIBLE`: Quỹ thời gian trống < tổng thời gian cần.
  - Sinh 3 kịch bản (`GoalScenarioOption`):
    - **Scenario 1 (Recommended - Fit Routine)**: Ghép vào các block `Work` / `Study` hiện có.
    - **Scenario 2 (Faster - Dedicated Blocks)**: Tạo các phiên `Deep Work` riêng để hoàn thành sớm hơn.
    - **Scenario 3 (Low-pressure - Flexible Plan)**: Giảm tải mỗi ngày, trải đều và tận dụng thêm cuối tuần.

### 2.3 Dynamic Rebalancing Engine
- Khi user trễ $X$ phút (ví dụ 80 phút):
  - `generateRebalanceOptions(projectId, overdueMinutes, remainingDays, currentSchedule)`:
    - **Option 1 (Smart rebalance - Recommended)**: Phân bổ $X/N$ phút vào các ngày tiếp theo mà không chạm vào `BREAK`, `MEAL`, `SLEEP`, `MEETING`.
    - **Option 2 (Catch up tomorrow)**: Bù toàn bộ $X$ phút vào block ngày mai.
    - **Option 3 (Use project buffer)**: Trừ $X$ phút vào buffer days của project.

### 2.4 API Integration
- `POST /api/ai/goals/decompose`: Nhận prompt mục tiêu -> trả về WBS + Feasibility + 3 Scenarios.
- `POST /api/ai/goals/apply-scenario`: Áp dụng kịch bản được chọn -> lưu `ProjectGoal`, `ProjectSubtask` và các `TimeBlock` tương ứng.
- `POST /api/ai/goals/rebalance`: Nhận yêu cầu rebalance -> trả về 3 phương án phục hồi.

---

## 3. Verification Commands
- `mvn test -Dtest=GoalScheduleServiceTest`
