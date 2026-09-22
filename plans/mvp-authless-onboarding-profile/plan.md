# Plan: MVP Authless Direct Access & Re-usable Profile Assessment

**Mode:** Fast
**Risk:** normal — touches frontend auth store fallback, profile modal, and onboarding re-assessment update flow

---

## Overview
Implement friction-free direct access for MVP testing without blocking login forms, while preserving the full onboarding questionnaire for profile customization and enabling users to re-take/edit their assessment directly from the Profile screen with previously chosen answers pre-filled.

---

## Phases

- [x] [Phase 1: Authless Direct Access & Default Session Fallback](./phase-01-authless-bypass.md)
  - Auto-initialize `useAuthStore` with a default user session.
  - Gracefully fallback to the default user if unauthenticated.
  - Ensure CORS origin patterns allow all dynamic localhost ports (`http://localhost:*`, `http://127.0.0.1:*`).
  
- [x] [Phase 2: Profile Re-Assessment Wizard with Pre-filled Answers](./phase-02-profile-reassessment.md)
  - Connect the "Thiết lập profile" / "Làm lại bài test" button in the Profile view to the Onboarding / Assessment Wizard.
  - Load existing answers/functional profile and pre-populate all test questions.
  - Support instant update and saving back to the backend database with reactive store updates.

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-22 13:52
**Phase in progress:** Completed all phases
**Status:** Implemented & Verified build (0 errors)

### Decisions made this session
- Initialized `useAuthStore` with persistent default user fallback to ensure friction-free MVP exploration.
- Updated `SecurityConfig.java` to support `allowedOriginPatterns` for all dynamic local dev ports.
- Added reactive state synchronization in `AdaptiveOnboardingModal` to prefill existing user profile choices when re-taking the assessment.

### Next immediate action
- Finalize handoff and invite user to verify in browser.

---

## File Ownership & Changes

| File | Change Summary |
| --- | --- |
| `adaptive-planner-frontend/src/store/useAuthStore.ts` | Set default guest session, auto-recover from 401 |
| `adaptive-planner-frontend/src/components/adaptive/AdaptiveApp.tsx` | Bypass login wall, mount re-assessment modal on demand |
| `adaptive-planner-frontend/src/features/onboarding/OnboardingWizard.tsx` | Support modal mode & pre-filling existing answers |
| `adaptive-planner-frontend/src/components/adaptive/AccessibilityProfileSettings.tsx` | Wire "Làm lại bài test" button to trigger the questionnaire |
| `adaptive-planner-backend/src/main/java/com/adaptive/planner/security/SecurityConfig.java` | Origin patterns for all local ports |
