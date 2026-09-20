# Brainstorm: Tech Stack & System Architecture Selection

**Date:** 2026-09-19

## Ideas Explored
- **Fullstack Next.js vs Separate Frontend / Backend:** 
  - Đã chọn tách biệt Frontend (React + Vite) và Backend (Spring Boot + Java) để đảm bảo tính toàn vẹn dữ liệu, type-safe mạnh mẽ ở Backend và khả năng scale lâu dài.
- **Frontend State Management:**
  - Kết hợp **Zustand** (cho Client/UI state: selected block, active preview scenario, AI modal) và **TanStack Query** (cho Server state: fetch, cache, invalidate, synchronization).
- **AI Inference Provider:**
  - Chọn **Groq** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) với độ trễ cực thấp (< 500ms) để hỗ trợ phản hồi tái cấu trúc lịch tức thì cho người Neurodivergent.
- **Backend Role as AI Gateway:**
  - Spring Boot quản lý API key bí mật, xử lý Prompt Engineering, parse và validate Structured JSON từ LLM trước khi trả về Client.

## User's Direction & Core Principle
> **"AI chỉ Understand + Explain + Suggest; Backend chịu trách nhiệm Validate + Calculate + Apply; User luôn là người Decide."**

## Finalized Stack
- **Frontend:** React + TypeScript + Vite, Tailwind CSS, Lucide Icons, Framer Motion, Zustand, TanStack Query.
- **Backend:** Spring Boot (Java), PostgreSQL, Jackson (JSON validation), Spring WebClient (gọi Groq API).
- **AI Engine:** Groq API (Llama 3.3).

## Open Questions & Next Steps
- Sẵn sàng chuyển giao sang bước lập kế hoạch chi tiết (`/bb-plan plans/adaptive-planner/spec.md`).
