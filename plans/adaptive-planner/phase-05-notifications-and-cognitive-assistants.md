# Phase 05: Notifications & Cognitive Assistants

**Focus:** Xây dựng hệ thống thông báo đa tầng tùy biến (Chambered Notifications), trợ lý *"What should I do now?"*, và tính năng *"Magic Task Breakdown"*.

---

## 1. Chambered Notification Engine (Frontend Web Notifications)
* **Custom Reminder Settings:**
  * Cho phép người dùng chỉnh số phút báo trước (ví dụ: [30, 10, 0] phút trước giờ bắt đầu) trong form tạo/sửa block hoặc settings chung.
* **Notification Dispatcher:**
  * Background interval / Web Worker kiểm tra mốc thời gian.
  * Khi đến mốc T-30m: Báo *"Sắp đến giờ chuyển việc, hãy hoàn thành nốt việc hiện tại nhé!"*.
  * Khi đến mốc T-10m: Báo *"Chuẩn bị thu dọn đồ đạc / di chuyển nào!"*.
  * Khi đến mốc T-0m: Báo *"Bắt đầu task mới! Uống một ngụm nước nhé."*.
* **Sensory Sound:** Phát âm thanh nhẹ nhàng (Web Audio API / Soft Chime), hỗ trợ bật/tắt âm thanh.

---

## 2. Cognitive Assistants
* **"What should I do now?" Card:**
  * Widget nổi bật trên đầu trang tóm tắt ngắn gọn:
    * *"Hiện tại (14:15): Bạn đang làm task [Viết tài liệu] (còn 45 phút)."*
    * *"Tiếp theo (15:00): [Nghỉ ngơi 15 phút]."*
  * Giúp giải phóng tâm lý choáng ngợp và xóa bỏ Waiting Mode Paralysis.
* **Magic Task Breakdown:**
  * Bấm icon "Break it down" trên thẻ công việc $\rightarrow$ Gọi API `POST /api/planner/task-breakdown`.
  * Trả về checklist 3-5 micro-steps dưới 5 phút, lưu thẳng vào `microSteps` của TimeBlock.

---

## 3. Verification Criteria
- [ ] Thông báo kích hoạt đúng thời điểm T-X phút đã cấu hình.
- [ ] Tính năng "Break it down" sinh danh sách các bước vi mô thiết thực và có thể check hoàn thành từng bước.
- [ ] Trợ lý "What should I do now?" hiển thị chính xác bối cảnh hiện tại.
