# Phase 01: Temporal Hook & State Derivation

**Parent Plan:** [plan.md](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/plan.md)  
**Spec Reference:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/spec.md)  
**Status:** Pending  

---

## Objective
Xây dựng module tiện ích xử lý thời gian thực và React hook để biến thời gian hệ thống thành dữ liệu trạng thái chuẩn xác cho Timeline:

1. **`src/lib/temporal.ts`**:
   - `parseTimeToMinutes(timeStr: string): number` (vd: "21:30" $\rightarrow$ 1290).
   - `formatMinutesToTime(minutes: number): string` (vd: 1290 $\rightarrow$ "21:30").
   - `getTimelineState(blocks: TimeBlock[], now: Date)`:
     - `activeBlock`: block có `startTime <= now < endTime`.
     - `nextBlock`: block kế tiếp gần nhất có `startTime > now`.
     - `pastBlocks`: các block có `endTime <= now`.
     - `upcomingBlocks`: các block có `startTime > now`.
     - `isFreeTime`: boolean (`activeBlock == null`).
     - `freeMinutesRemaining`: số phút trống còn lại cho đến `nextBlock.startTime`.
     - `progressPercent`: `%` thời gian đã trôi qua của `activeBlock`.
     - `remainingMinutes`: số phút còn lại của `activeBlock`.

2. **`src/hooks/useRealTimeClock.ts`**:
   - Trả về `currentTime` (Date), `formattedTime` ("21:37:42"), `formattedDate` ("Saturday, September 19"), cập nhật mỗi 1000ms.
   - Trả về `minuteTick` (cập nhật mỗi 10s hoặc mỗi khi phút nhảy) để kích hoạt recalculation Timeline mượt mà.

---

## Deliverables
- `adaptive-planner-frontend/src/lib/temporal.ts`
- `adaptive-planner-frontend/src/hooks/useRealTimeClock.ts`
- Unit tests / compilation verification.
