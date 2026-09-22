# Phase 3: Frontend Authentication Pages, Auth Store & Route Guards

## Context & Objectives
Build the frontend authentication layer, including Zustand session store (`useAuthStore`), lightweight accessible public views (`LoginPage.tsx`, `SignUpPage.tsx`), credentials-enabled HTTP client methods, and route guards that automatically route unauthenticated users to `/login` and first-time users to `/onboarding`.

## File Ownership
- [NEW] `adaptive-planner-frontend/src/store/useAuthStore.ts`
- [NEW] `adaptive-planner-frontend/src/features/auth/api.ts`
- [NEW] `adaptive-planner-frontend/src/features/auth/LoginPage.tsx`
- [NEW] `adaptive-planner-frontend/src/features/auth/SignUpPage.tsx`
- [MODIFY] `adaptive-planner-frontend/src/lib/api.ts` (attach `credentials: 'include'`)
- [MODIFY] `adaptive-planner-frontend/src/components/adaptive/AdaptiveApp.tsx` (wire auth state & route views)

## Detailed Implementation Steps
1. **Implement `useAuthStore` (Zustand)**:
   - State: `user: UserDto | null`, `isAuthenticated: boolean`, `isLoading: boolean`, `authError: string | null`.
   - Actions: `setUser`, `setLoading`, `logout`, `checkSession`.
2. **Implement API Client in `src/features/auth/api.ts`**:
   - `signup(payload)`: `POST /api/auth/signup` with credentials.
   - `login(payload)`: `POST /api/auth/login` with credentials.
   - `logout()`: `POST /api/auth/logout`.
   - `fetchCurrentUser()`: `GET /api/auth/me`.
3. **Build `LoginPage.tsx` & `SignUpPage.tsx`**:
   - **Signup Form**: Full name, email, password, confirm password, Terms & Privacy checkbox. Zero medical/neurodivergence questions. Clear error messaging and calm styling.
   - **Login Form**: Email, password, Remember me checkbox, Forgot password link.
   - Primary CTA: *"Create account"* / *"Sign in to Modo"*.
4. **Wire Route Guard in `AdaptiveApp.tsx`**:
   - On initial mount, execute `checkSession()`.
   - If `!isAuthenticated` $\rightarrow$ render `LoginPage` / `SignUpPage`.
   - If `isAuthenticated && !user.onboardingCompleted` $\rightarrow$ render `OnboardingWizard`.
   - If `isAuthenticated && user.onboardingCompleted` $\rightarrow$ render main dashboard.

## Verification
```bash
cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend
npm run build
```
