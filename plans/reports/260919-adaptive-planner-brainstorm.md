# Brainstorm: Adaptive Planner for Neurodivergent Users

**Date:** 2026-09-19

## Ideas Explored
- **Conversational Dynamic Timetable:** Cho phép nhập liệu tự nhiên bằng ngôn ngữ đời thường, AI tự nhận diện intent và xếp vào timeline.
- **1-Tap Reschedule & Emergency Handling:** Khi có việc gấp chen ngang (ví dụ họp khẩn 5h), AI đưa ra 2-3 kịch bản tái cấu trúc lịch để người dùng chọn thay vì phải tự sắp xếp thủ công.
- **Chambered Multi-stage Notifications:** Nhắc nhở theo từng chặng (T-30m tâm lý, T-10m hành động, T-0m bắt đầu) với âm thanh êm dịu, chống giật mình và giảm time blindness.
- **Spoon / Energy-Aware Management:** Quản lý lịch dựa trên mức năng lượng (High/Medium/Low) thay vì chỉ nhìn theo thời gian, chống burnout.
- **Magic Task Breakdown:** Bẻ nhỏ đầu việc lớn thành micro-steps dưới 5 phút để kích hoạt dopamine vượt qua Executive Dysfunction.

## User's Direction
- Tập trung vào website nhắc lịch timetable hỗ trợ người Neurodivergence.
- AI đóng vai trò như một trợ lý quản lý thời gian thông minh, đưa ra lời khuyên, đề xuất và tự động tái cấu trúc lịch trình khi có phát sinh hoặc trùng lặp.
- Người dùng có toàn quyền điều chỉnh thời gian hệ thống gửi thông báo nhắc trước cho từng khung giờ.

## Open Questions
- Tích hợp âm thanh nhắc nhở qua Web Audio API hay thông báo Native Web Notification?
- Lưu trữ dữ liệu lịch trình local-first (IndexedDB) hay Cloud Database (Supabase/Postgres) để đồng bộ đa thiết bị?

## Risks
- Độ trễ của AI response khi tính toán sắp xếp lại lịch trình nếu prompt quá phức tạp $\rightarrow$ Cần dùng structured JSON output với mô hình phản hồi nhanh (Gemini 1.5 Flash).
- Quá tải thông báo (Notification Fatigue) $\rightarrow$ Cần thiết lập giới hạn thông báo thông minh.
