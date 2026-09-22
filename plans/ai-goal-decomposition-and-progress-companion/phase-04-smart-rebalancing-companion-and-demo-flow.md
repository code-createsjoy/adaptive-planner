# Phase 4: Smart Rebalancing Companion & Golden Path Verification

**Parent Plan:** [plan.md](file:///d:/6_OJT/adaptive-planner/plans/ai-goal-decomposition-and-progress-companion/plan.md)  
**Spec Stories:** Smart Progress Companion & Dynamic Rebalancing (P1), Success Criteria

---

## 1. Objectives
Hiện thực hóa "Wow Factor" cốt lõi: phát hiện chậm trễ tiến độ, mở giao diện gợi ý phục hồi (Smart Rebalancing Companion), hiển thị preview các ngày bị ảnh hưởng và hoàn tất kiểm thử trọn vẹn kịch bản Golden Path.

---

## 2. Implementation Tasks

### 2.1 Delay Detection & Check-in Companion Banner
- Client/Server event khi kết thúc một block làm việc hoặc cuối ngày:
  - Nếu số task hoàn thành < số task dự kiến của ngày hôm đó:
  - Hiển thị thông báo Companion nhẹ nhàng:
    > *"Bạn đã hoàn thành 2/4 task hôm nay. Deadline 5/10 vẫn an toàn! Tôi có thể tái phân bổ ~80 phút còn lại mà không đụng đến giờ ăn trưa hay nghỉ ngơi của bạn."*

### 2.2 Rebalance Interaction Dialog / Drawer
- Card hiển thị 3 phương án phục hồi:
  1. **Smart rebalance (Recommended)**: `+40 min Tue, +40 min Wed (Deadline unchanged)`.
  2. **Catch up tomorrow**: `+80 min tomorrow (Deadline unchanged)`.
  3. **Leave it for later**: `Dùng 1h20 từ Protected Buffer của dự án`.
- Nhấn chọn từng option -> Hiển thị **Preview các ngày thay đổi** trên Impact Preview -> Bấm Apply.

### 2.3 Celebration & Positive Reinforcement
- Khi toàn bộ subtask được hoàn thành:
  - Hiển thị Toast / Modal chúc mừng sinh động, ấm áp: *"Xuất sắc! Dự án đã hoàn thành trước 2 ngày 🎉 Đã giải phóng các block thời gian dự phòng để bạn nghỉ ngơi."*

### 2.4 End-to-End Golden Path Verification
- Kiểm thử luồng hoàn chỉnh từ đầu đến cuối:
  1. Nhập *"Tôi cần làm website mini bán hàng trước 5/10"*.
  2. Xem 3 Scenario cards + Click preview Multi-day Roadmap.
  3. Bấm Apply -> Các ngày trên Calendar xuất hiện block làm việc kèm checklist subtask.
  4. Tick 2/4 subtask của hôm nay, giả lập trễ 2 task còn lại.
  5. Kích hoạt Smart Rebalance -> Chọn *"Smart rebalance"* -> Xem preview các ngày tới -> Bấm Apply -> Timeline các ngày tiếp theo được mở rộng phù hợp mà không chạm vào giờ nghỉ.

---

## 3. Verification Commands
- `npm run build`
- `mvn test`
