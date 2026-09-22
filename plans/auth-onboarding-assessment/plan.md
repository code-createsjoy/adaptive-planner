# Plan: Authentication, Onboarding, Multi-Tier Roles & Functional Assessment

**Date:** 2026-09-22
**Mode:** --hard
**Risk:** high-risk — Touches Spring Security, password hashing (BCrypt), JWT/Refresh tokens in HTTP-only cookies, new database schema for users, functional profiles, and B2B organizations.
**Spec:** [spec.md](file:///d:/6_OJT/adaptive-planner/plans/auth-onboarding-assessment/spec.md)

---

## Executive Summary
Implement the complete authentication, progressive onboarding, and functional accessibility assessment system for Modo:
1. **Security & Authentication**: Spring Security + JWT Access Token (15 min) & Server-Tracked Refresh Token (7 days) via HTTP-only Secure Cookies.
2. **Four-Tier Independent Architecture**:
   $$\text{Authorization Role} \neq \text{Journey Stage} \neq \text{Neurodivergence Self-ID} \neq \text{Functional Profile}$$
3. **Calm First-Time Onboarding**: Progressive 4-step flow (Welcome $\rightarrow$ Journey Stage $\rightarrow$ Private Self-ID $\rightarrow$ Optional 12-Question Functional Assessment $\rightarrow$ Instant Dashboard Personalization).
4. **B2B Foundation**: Schema and entities for `Organization`, `OrganizationMember`, and `OrganizationInvitation` prepared cleanly for future team management without blocking MVP.

---

## Phases

### [Phase 1: Spring Security, JWT Cookie Engine & User Auth Backend](file:///d:/6_OJT/adaptive-planner/plans/auth-onboarding-assessment/phase-01-spring-security-jwt-auth-backend.md)
- Add `spring-boot-starter-security` and `jjwt` dependencies in `pom.xml`.
- Implement `UserEntity`, `RefreshTokenEntity`, and repositories.
- Configure `SecurityFilterChain`, `JwtAuthenticationFilter`, `JwtTokenProvider`, and `CookieUtils`.
- Implement `AuthService` and `AuthController` (`/api/auth/signup`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`).
- Unit and WebMvc tests (`AuthServiceTest`, `AuthControllerTest`).

### [Phase 2: Onboarding State Machine, Functional Profile & Assessment Backend](file:///d:/6_OJT/adaptive-planner/plans/auth-onboarding-assessment/phase-02-onboarding-state-machine-and-assessment-backend.md)
- Implement `NeurodivergenceProfileEntity`, `FunctionalProfileEntity`, `AssessmentAnswerEntity`.
- Build `AssessmentScoringService` scoring 6 functional dimensions (Attention, Task Initiation, Time Awareness, Context Switching, Sensory, Structure).
- Expose endpoints in `OnboardingController` (`/api/onboarding/journey-stage`, `/api/onboarding/neurodivergence-self-id`, `/api/onboarding/assessment/submit`, `/api/onboarding/complete`, `/api/onboarding/functional-profile`).
- Unit tests (`AssessmentScoringServiceTest`, `OnboardingControllerTest`).

### [Phase 3: Frontend Authentication Pages, Auth Store & Route Guards](file:///d:/6_OJT/adaptive-planner/plans/auth-onboarding-assessment/phase-03-frontend-auth-pages-and-state.md)
- Create `useAuthStore` managing user session, login state, and onboarding gate.
- Build lightweight, accessible Auth views: `LoginPage.tsx`, `SignUpPage.tsx`.
- Connect API methods with credentials in `src/lib/api.ts`.
- Set up route protection redirecting unauthenticated users to `/login` and first-time users to `/onboarding`.

### [Phase 4: Frontend Onboarding Wizard & 12-Question Functional Assessment UI](file:///d:/6_OJT/adaptive-planner/plans/auth-onboarding-assessment/phase-04-frontend-onboarding-and-functional-assessment-ui.md)
- Build `OnboardingWizard.tsx` with progressive "Step X of 4" layout:
  - Step 1: Welcome & Philosophy.
  - Step 2: Journey Stage selector.
  - Step 3: Neurodivergence Self-ID (private).
  - Step 4: Optional Assessment prompt & 12-question step-by-step questionnaire.
- Build `FunctionalProfileRevealCard.tsx` displaying the generated functional profile and non-medical pattern descriptions.
- Save onboarding completion and transition to dashboard.

### [Phase 5: B2B Domain Foundation & Instant Dashboard Personalization Wiring](file:///d:/6_OJT/adaptive-planner/plans/auth-onboarding-assessment/phase-05-b2b-entities-and-dashboard-personalization-wiring.md)
- Define backend entities: `OrganizationEntity`, `OrganizationMemberEntity`, `OrganizationInvitationEntity`.
- Wire `FunctionalProfile` into `AdaptiveApp.tsx` and header sensory mode baseline (e.g. Focus mode for distractibility, Task Breakdown highlight for initiation support).
- Full end-to-end test verification (`mvn test` and `npm run build`).

---

## Verification Plan

### Automated Tests
- Backend Security & Onboarding Tests:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-backend
  mvn test "-Dtest=AuthServiceTest,AuthControllerTest,AssessmentScoringServiceTest,OnboardingControllerTest"
  ```
- Full Test Suite:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-backend && mvn test
  cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend && npm run build
  ```

### Manual Verification
1. **Public Signup & Login**: Create a new account, verify HTTP-only cookie headers, test login and logout.
2. **First-Time Onboarding Flow**: Complete Welcome $\rightarrow$ Journey Stage $\rightarrow$ Private Self-ID $\rightarrow$ Assessment.
3. **Assessment Results**: Verify profile cards render scored dimensions without medical diagnosis wording.
4. **Dashboard Personalization**: Verify dashboard loads tailored layout based on the functional profile.
5. **Subsequent Logins**: Reload/re-login and verify user is routed straight to dashboard with onboarding skipped.
