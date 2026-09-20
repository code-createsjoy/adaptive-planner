# Phase 01: Database & Backend Core

**Focus:** Thiết lập project Spring Boot 3+, kết nối PostgreSQL, Domain Entities, Repository, DTOs và RESTful APIs cho TimeBlock.

---

## 1. Domain Model & PostgreSQL Schema
* **Table `time_blocks`:**
  * `id` (UUID / Long, Primary Key)
  * `title` (VARCHAR(255), Not Null)
  * `description` (TEXT)
  * `start_time` (TIMESTAMPTZ, Not Null)
  * `end_time` (TIMESTAMPTZ, Not Null)
  * `category` (VARCHAR(50) - e.g., 'WORK', 'SOCIAL', 'HEALTH', 'REST', 'URGENT')
  * `energy_level` (VARCHAR(20) - 'HIGH', 'MEDIUM', 'LOW')
  * `reminder_minutes` (INTEGER[] / JSONB - e.g., [30, 10, 0])
  * `is_completed` (BOOLEAN, Default False)
  * `is_buffer_block` (BOOLEAN, Default False)
  * `micro_steps` (JSONB - Array of `{ id, text, done }`)
  * `created_at`, `updated_at` (TIMESTAMPTZ)

---

## 2. Spring Boot Components
* `TimeBlockEntity.java` & `TimeBlockRepository.java` (Spring Data JPA).
* `TimeBlockDTO.java` (Validation with Jakarta Bean Validation: `@NotNull`, `@FutureOrPresent`).
* `TimeBlockService.java`:
  * CRUD TimeBlock.
  * Validation: `startTime < endTime`, buffer time calculation.
  * Transactional batch updates (hỗ trợ áp dụng cả cụm TimeBlocks khi chấp thuận kịch bản).
* `TimeBlockController.java`:
  * `GET /api/timeblocks?date=YYYY-MM-DD`
  * `POST /api/timeblocks`
  * `PUT /api/timeblocks/{id}`
  * `DELETE /api/timeblocks/{id}`
  * `POST /api/timeblocks/batch-apply` (Áp dụng Scenario đã được User chọn).

---

## 3. Verification Criteria
- [ ] Khởi động Spring Boot kết nối PostgreSQL thành công.
- [ ] Kiểm thử REST API CRUD TimeBlock với Postman / cURL / Unit Tests đạt HTTP 200/201.
- [ ] Xử lý ngoại lệ chuẩn (GlobalExceptionHandler) trả về RFC 7807 ProblemDetail.
