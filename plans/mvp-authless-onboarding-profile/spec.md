# Spec: MVP Direct Access with Re-usable Profile Assessment

**Date:** 2026-09-22
**Status:** Ready

---

## Problem Statement
For MVP trial and testing, forcing user login/registration introduces unnecessary friction. We need direct entry into the adaptive planner app while preserving the onboarding assessment test for personal profile customization, with the ability to review and modify previously answered assessments directly from the User Profile.

---

## User Stories

- **[P1]** As a user opening the application, I want to access the planner dashboard immediately without mandatory login/sign-up forms, so that I can explore the product friction-free.
  *Accepted when:* Navigating to `http://localhost:5173/` or `5174/` loads the dashboard/workspace seamlessly with an active default user session.

- **[P1]** As a new or unconfigured user, I want the onboarding assessment to be available on first load (with a clear "Skip for now" option) and persist my choices to my profile.
  *Accepted when:* Completing the onboarding wizard saves functional profile preferences to the backend database; clicking "Skip" dismisses the modal and sets `onboardingCompleted = true` or marks it skipped.

- **[P1]** As a user in the Profile / Settings area, I want a "Thiết lập profile" (Setup / Retake Assessment) button that opens the same assessment wizard pre-populated with my previous answers, so that I can easily adjust my sensory, cognitive, and planning preferences.
  *Accepted when:* Clicking the button opens the assessment dialog with prior choices selected; submitting updates the functional profile in the DB without error.

- **[P2]** As a user who wants to reset my preferences, I want a quick reset button inside the assessment wizard to clear all answers back to defaults.
  *Accepted when:* Clicking "Reset to default" clears all selected radios/checkboxes to standard baseline values.

- **[P3]** *(Out of scope for this MVP iteration)* Multi-tenant cloud session isolation and social auth providers (Google/GitHub SSO).

---

## Functional Requirements

1. **FR-01 (Auth Bypass / Default Session):** 
   - Frontend `useAuthStore` initializes with a persistent default user session (`id: 1, name: 'Norman', email: 'guest@adaptive.local'`).
   - If `/api/auth/me` returns 401 or no token exists in local development, frontend auto-falls back to the default user without blocking the view with login errors.
2. **FR-02 (Backend Default User Seeding / Auto-Provision):**
   - Backend automatically seeds a default user with ID 1 and empty/initial functional profile if database is empty.
3. **FR-03 (Assessment Pre-fill & Re-take):**
   - Frontend fetches current functional profile & assessment state from `/api/onboarding/profile`.
   - Onboarding Wizard (`OnboardingModal` / `AssessmentWizard`) supports receiving `initialAnswers` to pre-populate all questionnaire steps.
4. **FR-04 (Profile Screen Action):**
   - Add "Thiết lập profile" / "Làm lại bài test đánh giá" button in the Profile / Settings section that triggers the Assessment Wizard.
   - On submission, calls `PUT /api/onboarding/assessment` to update profile and triggers reactive UI updates (sensory themes, cognitive load thresholds).

---

## Non-Functional Requirements

- **Performance:** Assessment modal opens with pre-filled state in < 150ms without full-page reloads.
- **Reliability:** Updates made in the re-taken assessment immediately reflect in both frontend state and backend persistence.
- **Compatibility:** CORS configuration supports any dynamic local port (`http://localhost:*`, `http://127.0.0.1:*`).

---

## Success Criteria

- [ ] App loads directly to Dashboard on `localhost:5173` / `5174` without blocking login screen.
- [ ] Onboarding assessment can be completed or skipped on first run.
- [ ] Profile page contains a "Thiết lập profile" button that loads previous answers and successfully saves new changes.
- [ ] All unit and integration flows pass without regression.

---

## Out of Scope

- Enforcing mandatory JWT authentication gates on all endpoints in local MVP dev mode.
- Changing the question bank schema (reuses existing assessment taxonomy).

---

## Assumptions

- Single-user local development mode is the primary target for MVP testing.
