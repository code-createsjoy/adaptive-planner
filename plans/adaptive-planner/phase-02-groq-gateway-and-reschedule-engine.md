# Phase 02: Groq AI Gateway & Reschedule Engine

**Focus:** Tích hợp Groq API (`llama-3.3-70b-versatile`), xây dựng Prompt Engineering chuẩn mực, Structured JSON Schema và Engine sinh kịch bản dời lịch thích ứng (Adaptive Reschedule).

---

## 1. Groq Client Integration
* Cấu hình Spring `WebClient` / `RestClient` gọi Groq endpoint (`https://api.groq.com/openai/v1/chat/completions`).
* Quản lý `GROQ_API_KEY` an toàn qua `application.yml` / biến môi trường.
* Sử dụng JSON Mode (`response_format: { type: "json_object" }`).

---

## 2. Prompt Engineering & Structured Outputs
* **System Prompt Core Guidelines:**
  * Giọng điệu đồng cảm, thấu hiểu, mang tính gợi ý nhẹ nhàng, tuyệt đối không phán xét (Zero-Guilt).
  * Hiểu rõ cơ chế Time Blindness & Transition Friction: luôn tính toán thêm 10-15 phút Buffer Time.
* **Output JSON Schema (Reschedule Scenarios Response):**
  ```json
  {
    "analysis": "Nhận thấy cuộc họp khẩn lúc 17:00 trùng với khung giờ tập thể dục (16:30 - 17:30). Dưới đây là 3 kịch bản cân bằng lại lịch:",
    "scenarios": [
      {
        "id": "scenario_a",
        "title": "Tối ưu trong ngày (Rút ngắn & Dời nhẹ)",
        "explanation": "Rút ngắn tập thể dục xuống 30p, chèn họp khẩn và dời bữa tối sang 18:00.",
        "energyImpact": "Medium",
        "blocks": [ /* updated list of TimeBlocks */ ]
      },
      {
        "id": "scenario_b",
        "title": "Tiết kiệm năng lượng (Zero-Guilt)",
        "explanation": "Tạm hoãn tập thể dục hôm nay để bạn có không gian chuẩn bị họp, dời đọc sách sang ngày mai.",
        "energyImpact": "Low",
        "blocks": [ /* updated list of TimeBlocks */ ]
      }
    ]
  }
  ```

---

## 3. Backend Reschedule Service & Controller
* `RescheduleService.java`:
  * Tiếp nhận request từ User (sự kiện mới / việc khẩn cấp + danh sách TimeBlocks hiện tại trong ngày).
  * Gọi Groq API $\rightarrow$ Parse JSON $\rightarrow$ Validate thời gian và logic trước khi trả về.
* `AiPlannerController.java`:
  * `POST /api/planner/parse-intent` (Nhập liệu tự nhiên $\rightarrow$ Tạo TimeBlock).
  * `POST /api/planner/reschedule-scenarios` (Sinh 2-3 Scenarios khi có xung đột).
  * `POST /api/planner/task-breakdown` (Bẻ nhỏ đầu việc lớn).

---

## 4. Verification Criteria
- [ ] Thời gian xử lý từ lúc gọi Groq đến khi trả về kịch bản < 1.0 giây.
- [ ] Dữ liệu trả về luôn tuân thủ strict JSON schema và DTOs.
- [ ] Xử lý fallback an toàn khi Groq rate limit / timeout mà không làm crash Backend.
