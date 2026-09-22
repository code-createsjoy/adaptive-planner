# Phase 3: 4-Question Adaptive Onboarding Wizard Component

## Context & Objectives
Implement the frictionless 4-question onboarding wizard (< 30s) that establishes the user's initial Personal Accessibility Profile without invasive medical/diagnostic terminology.

## File Ownership
- [NEW] `src/components/adaptive/AdaptiveOnboardingModal.tsx`
- [MODIFY] `src/components/adaptive/AdaptiveApp.tsx`

## Detailed Implementation Steps
1. **Design 4 Question Cards:**
   - **Step 1:** "Bạn thích thông tin hiển thị như thế nào?" (How do you prefer information shown?)
     - Options: `🎨 Trực quan & Màu sắc (Visual)`, `📝 Cấu trúc & Văn bản (Text)`, `✨ Kết hợp cân bằng (Mixed)`.
   - **Step 2:** "Mức độ dễ bị xao nhãng bởi yếu tố xung quanh?" (How easily are distractions?)
     - Options: `🍃 Thấp (Tập trung tốt)`, `⚖️ Trung bình`, `🌪️ Cao (Cần không gian yên tĩnh, ít chi tiết)`.
   - **Step 3:** "Bạn muốn nhận nhắc nhở & chuông báo như thế nào?" (How do you prefer reminders?)
     - Options: `🕊️ Êm dịu (Chuông 432Hz nhẹ nhàng)`, `🔔 Tiêu chuẩn`, `⏰ Rõ ràng & Dứt khoát`.
   - **Step 4:** "Bạn thích lịch trình của mình linh hoạt hay cố định?" (Schedule structure preference)
     - Options: `🌊 Linh hoạt & Thích ứng (Flexible)`, `⚖️ Cân bằng`, `📐 Khung giờ cố định (Structured)`.
2. **Profile Generation & Reveal Screen:**
   - Animated reveal calculating the user's Personal Accessibility Profile (e.g. *"Sensory-Friendly Mind Profile: Ưu tiên sự êm dịu, giảm tải kích thích thị giác và nhắc nhở 432Hz"*).
   - `[Bắt đầu trải nghiệm Modo]` button that submits data and sets `onboardingCompleted = true`.
3. **Trigger Logic in `AdaptiveApp.tsx`:**
   - Auto-opens modal on first visit if `profile.onboardingCompleted === false`.
   - Allows re-taking onboarding at any time from Profile/Settings.

## Verification
- Run frontend build:
  ```bash
  npm run build
  ```
- Verify wizard steps forward/back, calculation accuracy, and smooth closing animations.
