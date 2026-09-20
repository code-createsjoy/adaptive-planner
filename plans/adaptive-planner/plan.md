# Implementation Plan: Adaptive Planner (Neurodivergent AI Timetable)

**Date:** 2026-09-19  
**Mode:** --hard  
**Risk:** normal — Multi-tier architecture (React/TypeScript Frontend + Spring Boot Backend + Groq AI Gateway + PostgreSQL), schema migrations, real-time timetable rescheduling and user confirmation flow.  
**Spec Reference:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/adaptive-planner/spec.md)  
**PRD Reference:** [PRD.md](file:///d:/6_OJT/adaptive-planner/PRD.md)  

---

## Architecture Principle
> **"AI chỉ Understand + Explain + Suggest; Backend chịu trách nhiệm Validate + Calculate + Apply; User luôn là người Decide."**

---

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-19 22:07
**Phase in progress:** All Phases Completed
**Status:** All 5 Phases (Frontend Visual Timeline, Spring Boot 3-Layer Core, API Integration, Groq AI Gateway, Adaptive Reschedule & Cognitive Polish) completed and verified 100%.

### Decisions made this session
- Integrated Spring Boot with PostgreSQL database `adaptive_planner` and seeded initial neurodivergent timetable.
- Integrated Groq AI Gateway (`llama-3.3-70b-versatile`) for natural language parsing, scenario rescheduling, and 3-step micro-task breakdown.
- Connected TanStack Query mutation hooks directly to `AdaptiveApp.tsx` with zero-lag UI updates and fallback safety.
- Built gentle 432Hz sine chime synthesizer for sensory-friendly audio cues.
- Verified end-to-end builds (`mvn test` 100% passing, `npm run build` 0 errors).

---

## Phased Implementation Roadmap (Adjusted Execution Order)

| Phase | Title | Focus & Core Deliverables | P1/P2 Stories Covered |
| :--- | :--- | :--- | :--- |
| **[x] Phase 01 (Frontend First)** | Frontend Visual Timeline & Core UX | Dựa trên prototype hiện có tại `adaptive-planner-frontend`, hoàn thiện Visual Timeline (NOW / NEXT / PAST), Muted Design Tokens, Zustand store, Framer Motion animations. | P1: Visual Timeline & Personal Timetable UI |
| **[x] Phase 02 (Backend 3-Layer)** | Spring Boot Core & PostgreSQL | Khởi tạo `adaptive-planner-backend/` theo mô hình 3 lớp (Controller $\rightarrow$ Service $\rightarrow$ Repository), kết nối PostgreSQL, CRUD REST APIs & Validation. | P1: Timetable Data Layer |
| **[x] Phase 03 (Integration)** | Frontend-Backend API Integration | Kết nối `adaptive-planner-frontend` với Spring Boot qua TanStack Query, đồng bộ trạng thái và persistence. | P1: End-to-end Timetable Flow |
| **[x] Phase 04 (AI Gateway & Engine)** | Groq Gateway & Prompt Engine | Backend tích hợp Groq API (`llama-3.3-70b-versatile`), Structured JSON Schema, fallback an toàn khi chưa có API key. | P1: Natural Language Planning Engine |
| **[x] Phase 05 (Adaptive Reschedule & Polish)** | Adaptive Reschedule & Cognitive UX | AI-Assisted Reschedule Modal (`[Apply Option A/B/C]`), Transition Buffer, Chambered Notifications, Magic Task Breakdown. | P1 & P2: Conflict Reschedule & Cognitive Support |





---

## Detailed Phase Breakdown

* [Phase 01: Database & Backend Core](file:///d:/6_OJT/adaptive-planner/plans/adaptive-planner/phase-01-database-and-backend-core.md)
* [Phase 02: Groq AI Gateway & Reschedule Engine](file:///d:/6_OJT/adaptive-planner/plans/adaptive-planner/phase-02-groq-gateway-and-reschedule-engine.md)
* [Phase 03: Frontend State & Visual Timeline](file:///d:/6_OJT/adaptive-planner/plans/adaptive-planner/phase-03-frontend-state-and-visual-timeline.md)
* [Phase 04: AI Planning & Scenario Reschedule UI](file:///d:/6_OJT/adaptive-planner/plans/adaptive-planner/phase-04-ai-planning-and-scenario-reschedule-ui.md)
* [Phase 05: Notifications & Cognitive Assistants](file:///d:/6_OJT/adaptive-planner/plans/adaptive-planner/phase-05-notifications-and-cognitive-assistants.md)

---

## Verification & Red-Team Safeguards
1. **User Agency Gate:** Mọi API thay đổi lịch trình phát sinh từ AI bắt buộc phải nhận payload do người dùng gửi lên kèm `confirmedScenarioId` hoặc payload rõ ràng. Không có webhook/cron tự động xóa hay dời lịch mà không qua User.
2. **Deterministic Time Validation:** Backend Spring Boot kiểm tra không để xảy ra khung giờ âm (`endTime <= startTime`) hoặc chồng lấn không hợp lệ trước khi persist vào database.
3. **Low-Stress Sensory UI:** Toàn bộ components tuân thủ bảng màu Muted / Pastel, transition nhẹ nhàng với `framer-motion` (hoặc `motion/react`), không xuất hiện pop-up giật gân.
