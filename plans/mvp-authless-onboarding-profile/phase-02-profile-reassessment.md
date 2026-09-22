# Phase 2: Profile Re-Assessment Wizard with Pre-filled Answers

## Goals
- Provide a "Thiết lập profile" / "Làm lại bài test" button in the Profile / Settings page.
- Open the assessment questionnaire as a modal dialog with previously submitted answers pre-populated.
- Save modified answers and update user functional & accessibility profile seamlessly.

## Implementation Steps
1. **Onboarding / Assessment Modal Component**:
   - Enable `OnboardingWizard` or `AdaptiveOnboardingModal` to be invoked as a modal dialog with `isOpen`, `onClose`, and `isEditing` / `initialAnswers` props.
   - Pre-populate state using current `accessibilityProfile` / `functionalProfile`.
2. **Profile & Settings UI (`ProfileView` & `AccessibilityProfileSettings.tsx`)**:
   - Ensure the "Làm lại bài test đánh giá" / "Thiết lập lại hồ sơ" button invokes the modal.
   - When answers are submitted, trigger profile refetch / reactive store updates (`useAccessibilityStore` / `useAuthStore`).
3. **Backend Onboarding Endpoints**:
   - Verify `PUT /api/onboarding/functional-assessment` and `POST /api/user/accessibility-profile/onboarding` persist updates without error.

## Verification
- Open Profile tab -> Click "Làm lại bài test đánh giá".
- Check that existing choices are pre-selected.
- Change a setting (e.g., Focus support / Sound level) -> Click Submit.
- Verify profile cards and theme attributes update immediately without page refresh.
