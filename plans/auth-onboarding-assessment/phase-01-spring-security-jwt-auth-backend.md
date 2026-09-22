# Phase 1: Spring Security, JWT Cookie Engine & User Auth Backend

## Context & Objectives
Implement the foundational authentication layer with Spring Security, password hashing (BCrypt), JWT Access Tokens (15 min) and server-tracked Refresh Tokens (7 days) served in HTTP-only Secure Cookies, along with public endpoints for signup, login, refresh, logout, and current user retrieval.

## File Ownership
- [MODIFY] `adaptive-planner-backend/pom.xml` (add Spring Security, JJWT)
- [NEW] `com/adaptive/planner/entity/UserEntity.java`
- [NEW] `com/adaptive/planner/entity/RefreshTokenEntity.java`
- [NEW] `com/adaptive/planner/repository/UserRepository.java`
- [NEW] `com/adaptive/planner/repository/RefreshTokenRepository.java`
- [NEW] `com/adaptive/planner/security/JwtTokenProvider.java`
- [NEW] `com/adaptive/planner/security/JwtAuthenticationFilter.java`
- [NEW] `com/adaptive/planner/security/SecurityConfig.java`
- [NEW] `com/adaptive/planner/security/CookieUtils.java`
- [NEW] `com/adaptive/planner/dto/auth/SignUpRequest.java`
- [NEW] `com/adaptive/planner/dto/auth/LoginRequest.java`
- [NEW] `com/adaptive/planner/dto/auth/AuthResponse.java`
- [NEW] `com/adaptive/planner/dto/auth/UserDto.java`
- [NEW] `com/adaptive/planner/service/AuthService.java`
- [NEW] `com/adaptive/planner/controller/AuthController.java`
- [NEW] `com/adaptive/planner/service/AuthServiceTest.java`
- [NEW] `com/adaptive/planner/controller/AuthControllerTest.java`

## Detailed Implementation Steps
1. **Configure Dependencies in `pom.xml`**:
   - `spring-boot-starter-security`
   - `io.jsonwebtoken:jjwt-api:0.12.6`, `io.jsonwebtoken:jjwt-impl:0.12.6`, `io.jsonwebtoken:jjwt-jackson:0.12.6`
2. **Implement User & Token Entities**:
   - `UserEntity`: `id`, `name`, `email` (unique), `passwordHash`, `platformRole` (`PERSONAL_USER` default), `journeyStage`, `onboardingCompleted` (boolean).
   - `RefreshTokenEntity`: `id`, `user` (`UserEntity`), `tokenHash`, `expiresAt`, `revoked` (boolean).
3. **Configure Security & JWT Provider**:
   - `JwtTokenProvider`: Generates short-lived Access Token (15 min) with user claims and validates signature.
   - `CookieUtils`: Generates `HttpOnly`, `SameSite=Lax`, `Path=/` cookie headers for access and refresh tokens.
   - `SecurityConfig`: Configures CORS with `allowCredentials(true)` for `http://localhost:5173`, public access to `/api/auth/**`, `/api/holidays/**`, and protected access to other endpoints.
4. **Implement `AuthService` & `AuthController`**:
   - `POST /api/auth/signup`: Validates input, hashes password with BCrypt, sets `platformRole = PERSONAL_USER`, persists user.
   - `POST /api/auth/login`: Authenticates password, generates access token and persisted refresh token, attaches HTTP-only cookies.
   - `POST /api/auth/refresh`: Reads refresh token cookie, validates against DB, rotates token, attaches new cookies.
   - `POST /api/auth/logout`: Revokes refresh token in DB, returns expired cookie clearing headers.
   - `GET /api/auth/me`: Returns `UserDto` of authenticated principal.
5. **Unit & Controller Tests**:
   - Verify BCrypt password hashing, JWT claims, refresh rotation, and cookie headers.

## Verification
```bash
cd d:/6_OJT/adaptive-planner/adaptive-planner-backend
mvn test "-Dtest=AuthServiceTest,AuthControllerTest"
```
