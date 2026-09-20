# Phase 03: Frontend State & Visual Timeline

**Focus:** Xây dựng kiến trúc State kết hợp (Zustand + TanStack Query), Design System dịu mắt (Muted/Pastel theme) và Timeline thị giác (Visual Time-blocking) làm nổi bật trạng thái NOW / NEXT.

---

## 1. State Management Architecture
* **Server State (TanStack Query):**
  * `useTimeBlocksQuery(date)`: Fetch danh sách block trong ngày, cache & background refetch.
  * `useCreateTimeBlockMutation()`, `useUpdateTimeBlockMutation()`, `useApplyScenarioMutation()`.
* **Client & UI State (Zustand Store - `usePlannerStore`):**
  * `selectedDate`: Ngày đang xem.
  * `selectedBlock`: Block đang được chọn/xem chi tiết.
  * `activeScenarioPreview`: Scenario đang được preview trước khi người dùng bấm [Apply].
  * `isAiModalOpen`, `isEmergencyModalOpen`.

---

## 2. Visual Time-Blocking Component System
* **Bảng màu Neuro-inclusive (Tailwind Custom Tokens):**
  * `bg-muted-slate`, `accent-sage`, `accent-amber`, `accent-lavender`, `card-surface`.
* **Components:**
  * `TimelineHeader`: Chọn ngày, hiển thị tiến độ thời gian thực của ngày.
  * `TimelineView`: Cột thời gian 24h hoặc khung 6h-23h trực quan.
  * `TimeBlockCard`:
    * Hiển thị dạng khối gradient dịu.
    * Chỉ thị rõ ràng: `NOW (Đang diễn ra - Glowing viền nhẹ)`, `NEXT (Sắp tới)`, `PAST (Đã hoàn thành - làm mờ)`.
    * Tag năng lượng: High Focus 🔋, Medium ⚡, Recharge ☕.
    * Thời gian đệm (Buffer Block): Hiển thị dạng sọc chéo mờ (Dotted/Striped buffer visual).
  * `CurrentTimeIndicator`: Vạch đỏ/xanh mảnh trôi theo thời gian thực.

---

## 3. Motion & Micro-interactions
* Sử dụng `framer-motion` (hoặc `motion/react`) cho các chuyển động:
  * Fade & slide khi thêm block mới.
  * Smooth layout animation (`layoutId`) khi đổi thứ tự hoặc dời lịch.

---

## 4. Verification Criteria
- [ ] Giao diện render sắc nét, bảng màu dịu mắt, không gây chói hoặc rối thị giác.
- [ ] Trạng thái NOW/NEXT cập nhật chính xác theo đồng hồ thời gian thực của hệ thống.
- [ ] CRUD TimeBlock hoạt động trơn tru qua TanStack Query kết nối với Spring Boot.
