# Phase 1: Authless Direct Access & Default Session Fallback

## Goals
- Allow immediate entrance into the adaptive workspace on first visit without mandatory login or registration.
- Fallback seamlessly to a default user session when `/api/auth/me` returns unauthenticated.
- Prevent network fetch / CORS errors across dynamic dev ports (`http://localhost:*`, `http://127.0.0.1:*`).

## Implementation Steps
1. **Frontend Auth Store (`useAuthStore.ts`)**:
   - Provide a sensible default user state: `{ id: 1, name: 'Norman', email: 'quocthaiarct2005@gmail.com', platformRole: 'PERSONAL_USER', onboardingCompleted: true }`.
   - In `checkSession()`, if the API call fails or user is unauthenticated, automatically fall back to the default user so the app never gets blocked on the login page.
2. **Backend Security Configuration (`SecurityConfig.java`)**:
   - Set `allowedOriginPatterns` to `http://localhost:*` and `http://127.0.0.1:*` so any port (5173, 5174, etc.) connects without CORS preflight failures.

## Verification
- Navigate to `http://localhost:5173/` or `http://localhost:5174/` in an incognito window.
- Verify that the app loads directly into the main Dashboard.
