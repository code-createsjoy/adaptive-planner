# Brainstorm: Complete Authentication, Onboarding, Role Management & First-Time Assessment Experience

**Date:** 2026-09-22
**Slug:** auth-onboarding-assessment

---

## 1. Ideas & Directions Explored

### Direction A: Monolithic User Role + Single Onboarding Form
- *Concept*: Combine platform role, journey, and accessibility preferences into a single `user.role` (e.g. `USER`, `EMPLOYER`) and a single multi-page setup form.
- *Trade-off*: Highly discouraged. Fails the core requirement of separating authorization permissions from journey stages, medical/neurodivergent self-identifications, and functional profiles. Violates Universal Design by creating cognitive fatigue through massive forms.

### Direction B: Clean Decoupled Domain Architecture + Progressive Functional Onboarding (Selected)
- *Concept*: 
  1. **Authentication**: Spring Security with JWT Access Token + Server-Tracked Refresh Token using HTTP-only Secure Cookies.
  2. **Domain Separation**:
     - `Platform Account Role`: `PERSONAL_USER`, `PLATFORM_ADMIN`.
     - `Organization Member Role`: `EMPLOYEE`, `MANAGER`, `HR`, `ORG_ADMIN` (stored in `OrganizationMemberEntity`, not on `UserEntity`).
     - `Journey Stage`: `STUDYING`, `EXPLORING_CAREERS`, `JOB_SEARCHING`, `CURRENTLY_WORKING`, etc. (Contextual, non-permission).
     - `Neurodivergence Self-ID`: Strictly private by default, optional.
     - `Functional Profile`: 12–14 deterministic functional questions $\rightarrow$ scored dimensions $\rightarrow$ UI/AI personalization engine.
  3. **Progressive Onboarding**: 1 question per step with "Step X of 4", calm aesthetic, immediate dashboard customization on complete.
  4. **B2B Foundation**: Schema and entities for `Organization`, `OrganizationMember`, and `OrganizationInvitation` prepared without blocking P0 MVP.

---

## 2. User's Preferred Direction & Architecture

### A. MVP Scope (P0 Fully Functional First)
- **Sign Up / Login / Logout / Refresh / /me**: Complete authentication flow with BCrypt and HTTP-only cookies.
- **Protected Routes**: Middleware / Route guards on frontend; Spring Security filter on backend.
- **First-time Onboarding Flow**:
  - Welcome $\rightarrow$ Journey Stage $\rightarrow$ Neurodivergence Self-ID $\rightarrow$ Optional Assessment $\rightarrow$ Functional Profile Result $\rightarrow$ Dashboard.
- **Personalized Dashboard**: Immediately activates layout based on functional profile (e.g., Focus mode, Now/Next prioritization, breakdown triggers).
- **Subsequent Logins**: Skip onboarding directly to dashboard.

### B. B2B Foundation
- Create domain entities (`Organization`, `OrganizationMember`, `OrganizationInvitation`) to avoid refactoring debt, with invitation token verification endpoints. Full B2B management UI deferred to P1.

---

## 3. Key Design Decisions

1. **Strict Separation of Concerns**:
   - `AUTHORIZATION ROLE` $\neq$ `JOURNEY STAGE` $\neq$ `NEURODIVERGENCE IDENTITY` $\neq$ `FUNCTIONAL ACCESSIBILITY PROFILE`.
2. **Zero Medical Diagnosis Claim**:
   - Assessments identify *functional working patterns* (Attention regulation, Task initiation, Time awareness, Context switching, Sensory sensitivity, Need for structure).
   - Clear disclaimer: *"These results describe patterns in your responses and are not a medical diagnosis."*
3. **Privacy by Default**:
   - Private scores and self-IDs are never shared with organization managers or HR. Only explicit user-selected workplace accommodations (e.g. *"Prefers written instructions"*) can be shared.

---

## 4. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **Cognitive Overwhelm during Signup** | Keep initial registration to Name, Email, Password. Zero neurodivergence/medical questions on signup. |
| **CORS / Cookie Transport between Origins** | Configure Spring Security CORS with `allowCredentials(true)`, standard `SameSite=Lax`, and `HttpOnly=true` cookie helpers. |
| **Unauthorized Role Self-Promotion** | Public signup hardcoded to `PERSONAL_USER`. Org roles require signed invitation tokens verified server-side. |
