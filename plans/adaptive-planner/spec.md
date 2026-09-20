# Spec: Adaptive Planner (AI Timetable for Neurodivergent Users)

**Date:** 2026-09-19  
**Status:** Approved  

---

## Problem Statement
Người neurodivergent (đặc biệt những người gặp khó khăn với quản lý thời gian, chức năng điều hành, chuyển đổi tác vụ hoặc quá tải nhận thức như ADHD, autism,...) thường gặp tình trạng mất nhận thức thời gian (time blindness), dễ bị tê liệt khi bắt đầu công việc, và rơi vào khủng hoảng khi kế hoạch bị vỡ do phát sinh sự cố khẩn cấp.

---

## Core Story & Architecture Principle
> **Core Story:** *"When your plan breaks, Adaptive Planner helps you understand what changed and choose how to adapt."*
>
> **Architecture Principle:** *"AI chỉ Understand + Explain + Suggest; Backend chịu trách nhiệm Validate + Calculate + Apply; User luôn là người Decide."*

---

## Tech Stack
- **Frontend:** React + TypeScript + Vite, Tailwind CSS, Lucide Icons, Framer Motion
  - *State Management:* **Zustand** (UI & temporary scenario state) + **TanStack Query** (Server state & cache)
- **Backend:** Spring Boot (Java), PostgreSQL
  - *Gateway Role:* Giữ Groq API Key, prompt engineering, validate Structured JSON, áp dụng business rules
- **AI Engine:** Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`)

---

## User Stories (Theo phân bổ MVP Scope)

### ⭐ MUST HAVE (P1 - Core Loop)
- **[P1] Personal Timetable & Visual Timeline:** Quản lý thời gian biểu cá nhân trên Web với hiển thị phân biệt rõ ràng block **NOW** (Hiện tại), **NEXT** (Sắp tới) và các task đã qua.
  *Accepted when:* Giao diện timeline làm nổi bật task đang diễn ra và chỉ thị rõ ràng task kế tiếp.
- **[P1] Natural Language AI Planning:** Nhập kế hoạch bằng văn bản tự nhiên để AI tự phân tích và xếp lịch vào các khung thời gian trống phù hợp kèm 5-15 phút Buffer Time chuyển tiếp.
  *Accepted when:* Câu lệnh tiếng Việt/Anh được chuyển đổi chính xác thành TimeBlock trên lịch.
- **[P1] Conflict Detection & AI-Assisted Dynamic Reschedule:** Khi có việc khẩn cấp phát sinh hoặc lịch bị trùng, AI phân tích tác động và sinh 2-3 kịch bản sắp xếp lại rõ ràng (kèm nút `[Apply Option]`) để người dùng chủ động chọn áp dụng.
  *Accepted when:* Backend validate thời gian, hệ thống không tự ý sửa lịch mà chỉ áp dụng kịch bản sau khi người dùng bấm xác nhận.

### 🟡 SHOULD HAVE (P2 - Trợ lực nhận thức)
- **[P2] Customizable Notifications:** Tùy chỉnh số phút gửi thông báo nhắc trước cho từng khung giờ để chủ động chuẩn bị tâm lý.
- **[P2] "What should I do now?" & Transition Assistant:** Bấm 1 nút để AI tóm tắt việc cần làm ngay lúc này và nhắc nhở chuyển tiếp nhẹ nhàng.
- **[P2] Magic Task Breakdown:** Bấm "Break it down" để AI chia nhỏ một việc lớn thành 3-5 micro-steps dưới 5 phút.

### 🔵 NICE TO HAVE (P3 - Mở rộng trải nghiệm)
- **[P3] Energy Tracker & Rest Suggester:** AI phát hiện lịch có nhiều block High Focus liên tiếp và gợi ý thời gian nghỉ ngơi.
- **[P3] Sensory Themes & Sound:** Giao diện Warm/Muted theme và âm thanh chuông nhắc êm dịu.

---

## Functional Requirements
1. **FR-01 (Timetable Management):** Spring Boot REST API + PostgreSQL CRUD cho TimeBlock.
2. **FR-02 (Natural Language Scheduling):** Spring Boot chuyển câu lệnh sang Groq LLM, validate JSON trả về và lưu vào DB sau khi người dùng xác nhận.
3. **FR-03 (AI-Assisted Dynamic Reschedule):** Groq sinh 2-3 kịch bản giải quyết xung đột, Spring Boot validate business rules, Frontend preview qua Zustand và áp dụng khi user bấm `[Apply]`.
4. **FR-04 (Custom Notification Timing):** Cấu hình số phút nhắc trước cho mỗi block.

---

## Success Criteria
- [ ] Groq Inference latency < 500ms cho phân tích và sinh kịch bản.
- [ ] User luôn là người bấm nút `[Apply]` để xác nhận mọi thay đổi của lịch trình.
- [ ] Giao diện Framer Motion mượt mà, chuyển đổi trạng thái êm dịu không gây gián đoạn thị giác.
