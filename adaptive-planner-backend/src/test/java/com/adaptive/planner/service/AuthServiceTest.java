package com.adaptive.planner.service;

import com.adaptive.planner.dto.auth.LoginRequest;
import com.adaptive.planner.dto.auth.SignUpRequest;
import com.adaptive.planner.entity.UserEntity;
import com.adaptive.planner.repository.RefreshTokenRepository;
import com.adaptive.planner.repository.UserRepository;
import com.adaptive.planner.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private JwtTokenProvider jwtTokenProvider;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(
                "adaptive-planner-super-secure-default-jwt-secret-key-2026-min32bytes",
                900000,
                604800000
        );
        authService = new AuthService(userRepository, refreshTokenRepository, passwordEncoder, jwtTokenProvider);
    }

    @Test
    void signup_newEmail_createsUserAndReturnsTokens() {
        SignUpRequest request = new SignUpRequest("Quoc Thai", "thai@example.com", "password123");

        when(userRepository.existsByEmail("thai@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");

        UserEntity savedUser = UserEntity.builder()
                .id(1L)
                .name("Quoc Thai")
                .email("thai@example.com")
                .passwordHash("hashedPassword")
                .platformRole("PERSONAL_USER")
                .onboardingCompleted(false)
                .build();

        when(userRepository.save(any(UserEntity.class))).thenReturn(savedUser);

        AuthService.AuthResult result = authService.signup(request);

        assertThat(result).isNotNull();
        assertThat(result.user().email()).isEqualTo("thai@example.com");
        assertThat(result.user().onboardingCompleted()).isFalse();
        assertThat(result.accessToken()).isNotBlank();
        assertThat(result.refreshToken()).isNotBlank();
        verify(refreshTokenRepository, times(1)).save(any());
    }

    @Test
    void signup_existingEmail_throwsException() {
        SignUpRequest request = new SignUpRequest("Quoc Thai", "thai@example.com", "password123");
        when(userRepository.existsByEmail("thai@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void login_validCredentials_returnsAuthResult() {
        LoginRequest request = new LoginRequest("thai@example.com", "password123");

        UserEntity user = UserEntity.builder()
                .id(1L)
                .name("Quoc Thai")
                .email("thai@example.com")
                .passwordHash("hashedPassword")
                .platformRole("PERSONAL_USER")
                .onboardingCompleted(true)
                .build();

        when(userRepository.findByEmail("thai@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);

        AuthService.AuthResult result = authService.login(request);

        assertThat(result).isNotNull();
        assertThat(result.user().email()).isEqualTo("thai@example.com");
        assertThat(result.user().onboardingCompleted()).isTrue();
        assertThat(result.accessToken()).isNotBlank();
    }
}
