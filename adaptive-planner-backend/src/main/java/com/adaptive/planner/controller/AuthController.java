package com.adaptive.planner.controller;

import com.adaptive.planner.dto.auth.AuthResponse;
import com.adaptive.planner.dto.auth.LoginRequest;
import com.adaptive.planner.dto.auth.SignUpRequest;
import com.adaptive.planner.dto.auth.UserDto;
import com.adaptive.planner.security.CookieUtils;
import com.adaptive.planner.security.UserPrincipal;
import com.adaptive.planner.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"}, allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    private final CookieUtils cookieUtils;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignUpRequest request) {
        AuthService.AuthResult result = authService.signup(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createAccessTokenCookie(result.accessToken(), 900).toString())
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createRefreshTokenCookie(result.refreshToken(), 604800).toString())
                .body(new AuthResponse(result.user(), "Account created successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthService.AuthResult result = authService.login(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createAccessTokenCookie(result.accessToken(), 900).toString())
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createRefreshTokenCookie(result.refreshToken(), 604800).toString())
                .body(new AuthResponse(result.user(), "Logged in successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String refreshToken = cookieUtils.getCookieValue(request, CookieUtils.REFRESH_TOKEN_COOKIE)
                .orElse(null);

        AuthService.AuthResult result = authService.refresh(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createAccessTokenCookie(result.accessToken(), 900).toString())
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createRefreshTokenCookie(result.refreshToken(), 604800).toString())
                .body(new AuthResponse(result.user(), "Session refreshed"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String refreshToken = cookieUtils.getCookieValue(request, CookieUtils.REFRESH_TOKEN_COOKIE)
                .orElse(null);

        authService.logout(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtils.clearAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, cookieUtils.clearRefreshTokenCookie().toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            // Return 401 if unauthenticated
            return ResponseEntity.status(401).build();
        }

        UserDto user = authService.getCurrentUser(principal.id());
        return ResponseEntity.ok(user);
    }
}
