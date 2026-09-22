# Brainstorm: Progressive Insights & Weekly Reflection Engine

**Date:** 2026-09-22
**Project:** Modo (Adaptive Planner)

---

## 1. Core Philosophy & Value Proposition

Traditional analytics tools in productivity software often induce stress and guilt through competitive metrics: "Productivity Score: 73 (↓ 12% from last week)", streaks, and punitive empty states.

Modo establishes **"Progressive Insights: Your patterns, not your performance"**:
- **Zero Blocking Empty State**: Even on Day 1 or Day 2 of the week, the page is immediately alive with real-time progressive metrics (completed tasks, focus hours, daytime rhythm).
- **Confidence-Graduated Phrasing**:
  - *Day 1–2 (Early Pattern)*: Explicitly tagged as `🌱 Xu hướng ban đầu (Early pattern · Dựa trên 2 ngày)` with modest, non-authoritative wording: *"Cho đến nay, các phiên buổi sáng của bạn ít bị gián đoạn hơn."*
  - *Day 3+ (Recurring Pattern)*: Upgrades to `✨ Mẫu hình định kỳ (Recurring pattern)` once evidence passes statistical consistency.
- **Supportive, Descriptive Tone**: Replaces judgmental scores with neutral pattern observations (e.g. *"Tuần này của bạn có nhiều cuộc họp hơn tuần trước"*, *"Bạn có ít thời gian tập trung liền mạch hơn"*).

---

## 2. Integrated Product Loop (Insight → Action)

Instead of passive graphs that leave the user wondering what to do next, Modo connects Insights directly into Adaptive Scheduling:

$$\text{Insight} \longrightarrow \text{Explain ("Why am I seeing this?")} \longrightarrow \text{Suggestion} \longrightarrow \text{Diff Preview} \longrightarrow \text{User Decides}$$

Example:
1. **Insight**: *"Các cuộc họp sau 15:00 thường đi kèm các task tập trung dở dang."*
2. **Evidence**: *"Trong 2 tuần qua, 5 trên 7 ca tập trung chiều sau giờ họp đã phải dời hoặc bị gián đoạn."*
3. **Suggestion**: *"Bạn có muốn Modo tự động chèn 30 phút đệm sau các cuộc họp chiều tuần tới không?"*
4. **Preview**: User clicks `[ Xem trước kịch bản tuần tới ]` to open the familiar side-by-side Adaptive Diff Preview.

---

## 3. UI Layout & Architecture (Two-Tier Progressive Screen)

### A. Top Half: TUẦN NÀY (This Week — Live Progressive Flow)
- **Header Badge**: `Tuần này · 21/09 – 27/09 · Ngày 2 / 7`.
- **Live Metrics Strip**: Tasks completed, Total deep focus duration (`3h 40m`), Focus blocks count.
- **Rhythm Distribution Bars**: Visual bar chart showing Morning / Afternoon / Evening allocation.
- **Early / Evolving Pattern Card**: Honest evidence summary based on the elapsed days.

### B. Bottom Half: TUẦN TRƯỚC (Last Week's Retrospective & Reflection)
- **Header**: `Nhìn lại tuần trước (Last Week's Reflection)`.
- **Completed Metrics Summary**: Total tasks resolved (`18 / 22`), Focus hours logged (`8h 15m`).
- **Key Pattern Noticed**: Empathetic retrospective finding (e.g. *"Bạn hoàn thành task nặng ổn định hơn trước 12:00 trưa"*).
- **Actionable Recommendation**: 1-click button `[ Áp dụng mẫu hình này → Xem trước ]` triggering Adaptive Diff Preview.

---

## 4. Backend Engine Enhancements (`WeeklyInsightsService`)
- Support returning both **Current Week (Live Progressive DTO)** and **Previous Week (Archived Retrospective DTO)** in a single fast call (`GET /api/insights/progressive?weekStart=YYYY-MM-DD`).
- Add data maturity tag: `DATA_MATURITY`: `EARLY` (1-2 days) vs `CONFIRMED` (3+ days).
- Expose actionable `suggestionAction` that links to the Diff Preview schedule generator.

---

## 5. Risks & Mitigation
- **Risk 1: Early Bias**: 1 day of abnormal data might give wrong suggestions.
  - *Mitigation*: Mark as `Early pattern (Based on N days)` and avoid making definitive scheduling adjustments until day 3+.
- **Risk 2: Visual Overload**: Showing both weeks on one page might feel cluttered.
  - *Mitigation*: Use clean visual separation with subtle cards, generous sensory whitespace, and collapsible details.
