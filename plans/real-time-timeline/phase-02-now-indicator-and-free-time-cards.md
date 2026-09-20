# Phase 02: NOW Indicator Line & Free Time UI

**Parent Plan:** [plan.md](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/plan.md)  
**Spec Reference:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/spec.md)  
**Status:** Pending  

---

## Objective
Cập nhật giao diện `AdaptiveApp.tsx` / `TodayView`:

1. **Header Live Digital Clock:**
   - Hiển thị thời gian thực dạng số kèm ngày tháng tự động (`HH:mm:ss · Saturday, 19 September`).

2. **Dynamic NOW Indicator Line (`─── 🔴 NOW (HH:mm) ───`):**
   - Chèn đường kẻ chỉ báo vị trí thời gian hiện tại vào danh sách Timeline theo thứ tự thời gian.
   - Nằm phía trên các task sắp tới và phía dưới các task đã qua.

3. **Dynamic Active NOW Card & Countdown:**
   - Thẻ `NOW Active` hiển thị chính xác task hiện tại lấy từ `activeBlock`.
   - Hiển thị thanh tiến trình động `%` và thời gian còn lại: `X min remaining · Ends at HH:mm`.

4. **Contextual Free Time Card ("You're Free"):**
   - Khi không có task trong khung giờ hiện tại (`isFreeTime === true`):
     - Hiển thị card dịu nhẹ: `YOU'RE FREE · ${freeMinutesRemaining} minutes available`.
     - Phía dưới có các shortcut hành động: `[Find something small]`, `[Take a sensory break]`, `[What should I do now?]`.

---

## Deliverables
- Cập nhật `AdaptiveApp.tsx` với Live Clock, NOW Indicator Line, Dynamic NOW/NEXT Card, và Free Time Card.
