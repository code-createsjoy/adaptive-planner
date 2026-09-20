# Implementation Plan: Real-time Timeline & Dynamic NOW/NEXT Engine

**Date:** 2026-09-19  
**Mode:** --hard  
**Risk:** normal — Pure client-side temporal state derivation with zero database migration risk and zero backend API breakage.  
**Spec Reference:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/spec.md)  
**Brainstorm Reference:** [260919-real-time-timeline-brainstorm.md](file:///d:/6_OJT/adaptive-planner/plans/reports/260919-real-time-timeline-brainstorm.md)  

---

## Architecture Principle
> **"Client-side Ground Truth: Device time drives the real-time clock, dynamic NOW/NEXT calculations, countdown progress, and indicator positioning without server polling or WebSockets."**

---

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-19 22:22  
**Phase in progress:** All Phases Completed  
**Status:** Real-time Timeline Engine, Live Digital Clock, Dynamic NOW/NEXT states, NOW Indicator Line, Contextual Free Time Card, and Transition Warnings implemented and verified 100%.

### Decisions made this session
- Created `src/lib/temporal.ts` with pure temporal state derivation functions (`calculateTimelineState`).
- Created `src/hooks/useRealTimeClock.ts` with lightweight 1s interval clock and minute timestamp for layout reactivity.
- Enhanced `AdaptiveApp.tsx` with Live Digital Clock in Header, dynamic `NOW Active` card with countdown `%` progress bar, contextual `FreeTimeCard`, and chronological `NowIndicatorLine`.
- Verified production build (`npm run build`, 0 errors).

---

## Phased Implementation Roadmap

| Phase | Title | Focus & Core Deliverables | P1/P2 Stories Covered |
| :--- | :--- | :--- | :--- |
| **[x] Phase 01** | Temporal Hook & State Derivation | Tạo `useCurrentTime` hook (tick 1s cho clock, 10s cho layout), module `src/lib/temporal.ts` tính toán `NOW`, `NEXT`, `PAST`, `remainingMinutes`, `progressPercent`, và `isFreeTime`. | P1: Dynamic NOW/NEXT calculation & Live Digital Clock |
| **[x] Phase 02** | NOW Indicator Line & Free Time UI | Tích hợp đường chỉ báo `─── 🔴 NOW (HH:mm) ───` di chuyển chính xác giữa các blocks theo thời gian thực; hiển thị card "You're Free (X min available)" khi nằm ngoài các khung giờ. | P1: NOW Indicator Line & Contextual Free Time Card |
| **[x] Phase 03** | Transition Warnings & Sensory Polish | Thêm cảnh báo chuyển tiếp T-10m & T-0m dịu nhẹ (soft badge + 432Hz sine chime), đồng bộ với modal "What should I do now?", kiểm thử end-to-end. | P1 & P2: Time Remaining countdown & Multi-stage Transition cues |

---

## Detailed Phase Breakdown

* [Phase 01: Temporal Hook & State Derivation](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/phase-01-temporal-hook-and-state-derivation.md)
* [Phase 02: NOW Indicator Line & Free Time UI](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/phase-02-now-indicator-and-free-time-cards.md)
* [Phase 03: Transition Warnings & Sensory Polish](file:///d:/6_OJT/adaptive-planner/plans/real-time-timeline/phase-03-transition-cues-and-e2e-polish.md)

---

## Verification & Safeguards
1. **Performance Guard:** Re-render interval cho toàn bộ danh sách timetable chỉ cập nhật mỗi khi phút thay đổi (hoặc mỗi 10-30s), trong khi đồng hồ số ở Header chạy timer 1s riêng biệt để giữ FPS mượt mà.
2. **Time-Blindness Ergonomics:** Không hiển thị số giây đếm ngược giật gân (no flickering seconds) trên các thẻ công việc; hiển thị trực quan dạng thanh phần trăm + "X min remaining".
3. **Seamless Fallback:** Nếu danh sách blocks rỗng hoặc tất cả task đã qua, hiển thị trạng thái "All done for today · Rest & Recharge" thay vì màn hình trống.
