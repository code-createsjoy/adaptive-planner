# Spec: AI Goal Decomposition & Smart Progress Companion

**Date:** 2026-09-21  
**Status:** Approved / Golden Path Defined  
**Scope Target:** MVP before 2026-09-23 (Focused Golden Path)

---

## Problem Statement
Khi người dùng nhận một dự án hoặc mục tiêu dài hạn có deadline (ví dụ: làm website bán hàng trong 2 tuần), họ thường bị quá tải, không biết cách chia nhỏ công việc (WBS), không tìm được quỹ thời gian khả dụng trong lịch hiện tại và dễ bị vỡ kế hoạch khi xảy ra chậm trễ. 

Adaptive Planner giải quyết bài toán này bằng cơ chế **Project Layer on top of Calendar Layer**:
1. Tự động phân rã mục tiêu (WBS) và ước lượng khối lượng công việc.
2. Đề xuất 3 kịch bản ánh xạ vào lịch trình kèm buffer an toàn.
3. Cung cấp checklist 2 tầng (Day Timeline và Project Progress Card).
4. **Smart Rebalancing**: Tự động phát hiện chậm trễ và sửa lại toàn bộ phần còn lại của kế hoạch, bảo toàn giờ ăn, giấc ngủ, meeting và deadline mà không dồn việc gây kiệt sức.

---

## The MVP Golden Path Flow (Demo Scenario)

```text
Goal entered (e.g. "Hoàn thành website bán hàng mini trước 5/10")
        ↓
AI decomposes into WBS milestones + estimated duration
        ↓
Calendar scan: Available hours vs. Required hours (Feasible / Tight / Not feasible)
        ↓
3 schedule options (Fit Routine / Dedicated Blocks / Flexible Plan)
        ↓
Click scenario → Impact Preview (Multi-day roadmap mapped to dates)
        ↓
Apply → Calendar gets project blocks with today's checklist
        ↓
User ticks completed subtasks → Progress % automatically updates
        ↓
User misses/delays today's task
        ↓
Adaptive detects delay & prompts check-in:
"You finished 2 of 4 tasks. I can recover the remaining 80 min without touching your lunch or break."
        ↓
3 recovery options (Smart rebalance / Catch up tomorrow / Use project buffer)
        ↓
Preview changed days → Apply rebalance
```

---

## User Stories

### Core Decomposition & 3-Scenario Scheduling (P1)
- **[P1]** Là một người dùng, tôi muốn nhập mục tiêu + deadline vào khung chat để AI phân rã thành các giai đoạn & subtasks kèm thời lượng ước tính.
  - *Accepted when*: AI trả về danh sách công việc chi tiết, tính tổng thời gian cần (`requiredHours`), quét lịch để tìm `availableHours` và phân loại 1 trong 3 trạng thái: `Feasible`, `Tight`, hoặc `Not feasible`.
- **[P1]** Là một người dùng, tôi muốn nhận 3 phương án xếp lịch (Fit Routine, Dedicated Blocks, Flexible Plan) có tính toán ngày đích (`internalTargetDate = deadline - buffer`):
  - **Fit into Routine**: Tự động lồng thẳng danh sách việc vào ca làm việc chính (`Work` routine) có sẵn trong ngày mà không tạo thêm thẻ trùng giờ.
  - **Dedicated Blocks**: Tạo các khung giờ tập trung riêng biệt `⚡ Deep Work (High Energy)`, ưu tiên neo cùng một khung giờ cố định mỗi ngày (Anchor Time) và chỉ đổi giờ nếu ngày đó có lịch bận.
  - **Flexible Plan**: Chia nhỏ công việc trải đều các buổi tối nhẹ nhàng.
  - *Accepted when*: 3 card kịch bản hiển thị rõ ràng chiến lược xếp lịch, số giờ phân bổ mỗi ngày và số ngày buffer dự trù.
- **[P1]** Là một người dùng, tôi muốn nhấn vào từng kịch bản để xem **Impact Preview** hiển thị toàn bộ lộ trình theo từng ngày (Multi-day Roadmap) trước khi áp dụng vào lịch.
  - *Accepted when*: Khu vực Preview hiển thị danh sách ngày, khung giờ, tên task và nút *"Áp dụng phương án này"*.

### Execution & Two-Tier Tracking (P1)
- **[P1]** Là một người dùng, trong Day Timeline của ngày hôm nay, tôi chỉ thấy subtasks cần làm của hôm nay kèm checkbox để tick hoàn thành.
  - *Accepted when*: Tick checkbox cập nhật ngay tức thì (`< 50ms`), tiến độ tổng thể của Project tự động tăng theo công thức trọng số thời gian:  
    $$\text{Progress \%} = \frac{\sum \text{estimatedMinutes of completed subtasks}}{\sum \text{estimatedMinutes of all subtasks}} \times 100$$
- **[P1]** Là một người dùng, tôi muốn xem **Project Progress Widget / Card** để nắm bắt tiến độ chung, milestone hiện tại (Research → Wireframe → UI → Frontend...) và số ngày buffer còn lại.
  - *Accepted when*: Widget hiển thị thanh progress bar trực quan, trạng thái `On track` / `Tight` / `Behind`.

### Smart Progress Companion & Dynamic Rebalancing (P1 - Core Wow Factor)
- **[P1]** Là một người dùng, khi tôi bị trễ task (ví dụ hôm nay chỉ làm được 2/4 task), AI sẽ chủ động phát hiện chậm tiến độ và đưa ra gợi ý phục hồi thông minh mà không làm vỡ giờ nghỉ:
  - *Option 1 (Smart rebalance - Recommended)*: Chia đều thời gian thiếu (vd: +35p thứ 3, +35p thứ 4) mà không dời deadline.
  - *Option 2 (Catch up tomorrow)*: Bù toàn bộ vào ngày mai.
  - *Option 3 (Use project buffer)*: Trừ vào ngày đệm dự phòng của dự án.
  - *Accepted when*: Bấm chọn phương án phục hồi hiển thị Preview các ngày bị thay đổi và bấm Apply để tái cân bằng lịch tức thì.
- **[P2]** Là một người dùng, khi tôi hoàn thành toàn bộ dự án sớm hơn dự kiến, AI sẽ gửi thông báo chúc mừng chân thành và đề xuất giải phóng các block thời gian đệm đã đặt trước.

---

## Data Models & Schema Design (Clean & Derived)

### 1. `ProjectGoal` Entity
- `id`: String / UUID
- `title`: String (vd: "Website Mini Bán Hàng")
- `officialDeadline`: LocalDate / LocalDateTime
- `internalTargetDate`: LocalDate (Deadline trừ đi buffer heuristic)
- `bufferDays`: Integer (vd: 1-2 ngày)
- `status`: Enum (`PLANNING`, `IN_PROGRESS`, `COMPLETED`, `PAUSED`)
- `feasibilityStatus`: Enum (`FEASIBLE`, `TIGHT`, `NOT_FEASIBLE`)

### 2. `ProjectSubtask` Entity
- `id`: String / UUID
- `projectId`: String
- `milestoneName`: String (vd: "UI Design", "Frontend")
- `title`: String (vd: "Build Hero Section")
- `estimatedMinutes`: Integer (vd: 60)
- `completed`: Boolean
- `scheduledDate`: LocalDate
- `timeBlockId`: String (Nullable - liên kết với TimeBlock trên Day Timeline)

> **Lưu ý Data**: Không lưu trường `completedMinutes` dư thừa. Tiến độ luôn được derive trực tiếp từ các subtasks đã `completed = true`.

---

## UI / UX Architecture

- **Giao diện ngắn gọn, quen thuộc**:
  - Entry point trong AI Planner / Dashboard: Mục **"Goals"** hoặc **"Projects"**.
  - Các tab/card chức năng: `Plan with AI` → `Roadmap` → `Today's Checklist` → `Rebalance`.
- **Impact Preview Multi-day**:
  - Mở rộng Preview Card hiện tại để hỗ trợ group theo ngày (Date headers: *Mon 21*, *Tue 22*, *Wed 23*...).
  - Highlight các khối `existing Work block`, `Deep Work block`, và `Protected Buffer`.

---

## Success Criteria (MVP Gate)

- [ ] Hoàn thành trọn vẹn **Golden Path** từ Goal Input -> AI Decomposition -> 3 Scenarios -> Impact Preview -> Apply -> Tick Subtask -> Miss Task -> Smart Rebalancing.
- [ ] Tính toán % tiến độ chính xác theo trọng số `estimatedMinutes` của subtask.
- [ ] Xử lý trung thực 3 trạng thái Feasibility (`Feasible`, `Tight`, `Not feasible`), không "hallucinate productivity".
- [ ] Demo tái cân bằng (Rebalancing) thể hiện rõ giá trị bảo vệ giờ ăn, giấc ngủ và deadline của người dùng.
