# Brainstorm: Tinh Chỉnh Cơ Chế Phân Bổ Lịch AI Goal Scheduling

**Date:** 2026-09-21  
**Author:** Pair programming with User  

---

## 1. Vấn Đề Cần Giải Quyết (Problem & Context)
Trước đó, khi AI tạo TimeBlock cho dự án, hệ thống có thể tạo ra các khung giờ riêng lẻ (ví dụ: `14:00 - 17:00`) nằm đè lên ca làm việc có sẵn (`12:30 - 18:00 Work`), dẫn đến hiện tượng trùng lặp thẻ trên timetable.

Người dùng đề xuất 2 hướng tiếp cận phân bổ rõ ràng:
1. **Lồng thẳng danh sách việc vào khung giờ `Work` có sẵn** trên thời khóa biểu hàng ngày.
2. **Đề xuất khung giờ tập trung riêng (`High Energy`) hoàn toàn không bị trùng lấn**, ưu tiên neo cùng một khung giờ cố định mỗi ngày (Anchor Time) để dễ kiểm soát và tạo thói quen, nhưng có thể linh hoạt đổi giờ nếu ngày đó vướng lịch bận.

---

## 2. Các Hướng Đi Đã Thảo Luận (Ideas Explored)

### Hướng 1: Lồng trực tiếp vào Work Routine (Embedded Routine)
- **Cơ chế**: Khi người dùng chọn kịch bản *Fit into Current Schedule*, AI quét các ca `Work` trên lịch trong ngày.
- **Quyết định (Lựa chọn 1.A)**: AI tự động chọn ca `Work` chính / dài nhất trong ngày để nhúng danh sách task con làm micro-steps.
- **Ưu điểm**: Không sinh ra thêm thẻ mới, không bị trùng lịch, giữ nguyên thói quen làm việc hàng ngày.

### Hướng 2: Khung giờ tập trung riêng High Energy (Dedicated High-Energy Focus)
- **Cơ chế**: Dành cho kịch bản *Dedicated Blocks* hoặc khi ngày đó chưa có routine `Work`.
- **Nguyên tắc "Neo giờ cố định" (Anchor Time)**: AI ưu tiên xếp vào cùng một khung giờ năng lượng cao mỗi ngày (ví dụ: `08:30 – 10:30` hoặc `14:00 – 16:00`). Nếu ngày nào vướng lịch bận, AI mới dời sang khung giờ trống khác của riêng ngày đó.
- **Thuộc tính TimeBlock**: 
  - `energyLevel = "high"`
  - `priority = "HIGH"`
  - Nhãn hiển thị: `⚡ Deep Work: <Tên công việc> (High Energy)`
- **Đảm bảo**: Tuyệt đối không trùng lấn lên giờ ăn, giờ ngủ hay các cuộc hẹn cố định.

---

## 3. Quyết Định Chung & Golden Rules (User's Direction)
- ✅ **Lựa chọn 1.A**: Tự động lồng vào ca làm việc chính có sẵn mà không bắt user phải chọn thủ công.
- ✅ **Khung giờ riêng**: Gắn nhãn `High Energy` + ưu tiên cùng khung giờ cố định hàng ngày (Anchor Time).
- ✅ **Theo dõi trực quan**: Cung cấp bộ 3 chế độ xem (Hôm nay / Theo từng ngày / Theo giai đoạn) và checklist trực tiếp trên từng thẻ timetable.

---

## 4. Kế Hoạch Tiếp Theo (Next Steps)
- Lưu trữ kết quả brainstorm và cập nhật `spec.md`.
- Tiếp tục với `$bb-plan` để hoàn thiện chi tiết thuật toán Anchor Time trong `GoalScheduleService`.
