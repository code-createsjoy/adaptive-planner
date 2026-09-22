# Brainstorm: AI Goal Decomposition & Smart Progress Companion

**Date:** 2026-09-21  
**Author:** AI Pair Programmer & Quoc Thai  
**Topic:** AI Goal/Project Breakdown, Multi-Day Calendar Mapping, Interactive Checklists, Dynamic Rebalancing & Humanized Progress Companion.

---

## 1. Core Philosophy & Value Proposition

> *"You give Adaptive a deadline, not a to-do list. It turns the goal into a realistic plan, finds time for it, and continuously repairs the plan as real life changes."*

Mục tiêu của tính năng là xây dựng **Project Layer nằm trên Calendar Layer**, trong đó AI liên tục điều chỉnh mối quan hệ giữa tiến độ dự án thực tế và lịch sinh hoạt của người dùng.

---

## 2. The 1 Golden Path Demo Flow (Scope chốt cho MVP trước 23/09)

1. **Goal entered**: Người dùng nhập goal + deadline (vd: *"Hoàn thành website bán hàng mini trước 5/10"*).
2. **AI Decomposition**: Phân rã thành WBS (Milestones + Subtasks + Estimated duration).
3. **Calendar scan & Feasibility**: Tính tổng giờ cần vs giờ trống -> Đánh giá 1 trong 3 trạng thái: `Feasible`, `Tight`, hoặc `Not feasible`.
4. **3 Scenarios**:
   - `Recommended`: Fit into current schedule (tận dụng các block Work có sẵn, ít đổi routine nhất).
   - `Faster`: Dedicated project blocks (tạo thêm Deep Work session để xong sớm).
   - `Low-pressure`: Flexible plan (workload thấp hơn, dùng thêm cuối tuần hoặc buffer).
5. **Impact Preview (Multi-day Roadmap)**: Người dùng xem trước toàn bộ roadmap phân bổ theo từng ngày ở khu vực Preview.
6. **Apply**: Hệ thống tạo các block lịch vào Calendar.
7. **Two-Tier Tracking**:
   - Day Timeline: Chỉ hiển thị checklist subtask của hôm nay.
   - Project Widget: Hiển thị tổng quan % tiến độ, milestone hiện tại, số ngày buffer còn lại.
8. **Smart Rebalancing (The Core Wow Factor)**:
   - Khi phát hiện người dùng bị trễ task (vd: chỉ làm được 2/4 task hôm nay).
   - AI gửi check-in: *"Tôi có thể tái phân bổ 80 phút còn lại mà không đụng đến giờ ăn trưa hay meeting của bạn."*
   - Cung cấp 3 recovery options (Smart rebalance / Catch up tomorrow / Use buffer).
   - Preview các ngày bị thay đổi -> Apply rebalance.

---

## 3. Data & Heuristic Refinements

- **Progress calculation**: Derived tự động từ các subtask:  
  $$\text{Progress \%} = \frac{\sum \text{estimatedMinutes of completed subtasks}}{\sum \text{estimatedMinutes of all subtasks}} \times 100$$
  (Loại bỏ trường `completedMinutes` để tránh duplicate state).
- **Buffer heuristic**: Internal Target Date = Deadline - Buffer (dự trù 1–2 ngày buffer cho MVP).
- **Realistic Feasibility**: Trung thực với 3 trạng thái (`Feasible`, `Tight`, `Not feasible`). Nếu toán học không khả thi, AI gợi ý thêm giờ làm, giảm scope hoặc dời deadline, không "hallucinate productivity".
- **UI Terminology**: Tinh gọn, dễ hiểu: `Goals` / `Projects` -> `Plan with AI` → `Roadmap` → `Today's Checklist` → `Rebalance`.

---

## 4. Next Step
Chuyển giao Spec sang `$bb-plan` để tạo kế hoạch triển khai chi tiết từng phase cho backend & frontend.
