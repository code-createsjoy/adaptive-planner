# Phase 03: Transition Warnings & Sensory Polish

**Parent Plan:** [plan.md](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/plan.md)  
**Spec Reference:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/spec.md)  
**Status:** Pending  

---

## Objective
Hoàn thiện trải nghiệm giác quan và cảnh báo chuyển tiếp cho người dùng Neurodivergent:

1. **Multi-stage Transition Notice (T-10m & T-0m):**
   - Khi `activeBlock` còn dưới 10 phút: hiển thị badge mềm mại `🟡 10 minutes left · Transition buffer ready`.
   - Khi đến T-0m: kích hoạt thông báo chuyển đổi nhẹ nhàng, không hối thúc.

2. **Sensory Sound Cue (432Hz sine chime):**
   - Tự động phát âm thanh êm dịu khi chuyển đổi trạng thái (nếu bật tùy chọn âm thanh).

3. **End-to-end Build & Verification:**
   - Kiểm tra `npm run build` (0 lỗi).
   - Kiểm tra giao diện trên mobile và desktop.

---

## Deliverables
- Cập nhật UI thông báo và chuyển tiếp trong `AdaptiveApp.tsx`.
- Cập nhật `feature_list.json` và walkthrough.
