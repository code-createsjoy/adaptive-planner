# Phase 04: AI Planning & Scenario Reschedule UI

**Focus:** Xây dựng giao diện nhập liệu tự nhiên bằng AI, cơ chế cảnh báo xung đột và Modal chọn kịch bản thích ứng (AI-Assisted Dynamic Reschedule Selector).

---

## 1. Natural Language AI Input Bar
* Component `AiPromptInput`:
  * Cho phép người dùng nhập câu lệnh đời thường (ví dụ: *"Tối nay 7h tôi muốn đi cafe với bạn bè 2 tiếng"* hoặc *"Ngày mai từ 9h-11h làm báo cáo tài chính"*).
  * Hiển thị trạng thái đang xử lý (Thinking indicator) êm dịu, không giật màn hình.
  * Tự động hiển thị thẻ preview block mới được tạo để người dùng bấm xác nhận thêm vào lịch.

---

## 2. Emergency Interruption & Scenario Selector Modal
* **Nút bấm khẩn cấp:** Nút *"Báo việc khẩn cấp / Thay đổi lịch"* (Emergency / Reschedule Trigger).
* **Modal chọn kịch bản (Scenario Comparison):**
  * **Trực quan hóa so sánh:** Hiển thị 2-3 kịch bản theo dạng thẻ song song hoặc tabs:
    * **Option A:** Tối ưu trong ngày (rút ngắn + dời nhẹ).
    * **Option B:** Tiết kiệm năng lượng (Zero-Guilt - hoãn việc không khẩn).
    * **Option C:** Giữ nguyên & tìm khung giờ khác.
  * **Live Preview:** Khi hover/chọn 1 Option, giao diện Timeline bên dưới hiển thị preview các block sẽ được di chuyển như thế nào (dùng Zustand `activeScenarioPreview`).
  * **Action Button:** Nút `[Apply This Scenario]` to, rõ ràng, xác nhận thay đổi lịch trình.

---

## 3. Verification Criteria
- [ ] Người dùng nhập câu lệnh tiếng Việt/Anh $\rightarrow$ AI parse và hiển thị block preview chính xác trong < 1.5s.
- [ ] Khi có xung đột hoặc việc khẩn, modal hiển thị rõ ràng 2-3 kịch bản kèm giải thích thấu cảm.
- [ ] Nhấn `[Apply]` cập nhật tức thì Timeline thông qua mutation API và đóng modal mượt mà.
