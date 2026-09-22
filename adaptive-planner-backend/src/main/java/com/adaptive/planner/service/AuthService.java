package com.adaptive.planner.service;

import com.adaptive.planner.dto.auth.AuthResponse;
import com.adaptive.planner.dto.auth.LoginRequest;
import com.adaptive.planner.dto.auth.SignUpRequest;
import com.adaptive.planner.dto.auth.UserDto;
import com.adaptive.planner.entity.RefreshTokenEntity;
import com.adaptive.planner.entity.UserEntity;
import com.adaptive.planner.repository.RefreshTokenRepository;
import com.adaptive.planner.repository.UserRepository;
import com.adaptive.planner.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public record AuthResult(UserDto user, String accessToken, String refreshToken) {}

    @Transactional
    public AuthResult signup(SignUpRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        UserEntity user = UserEntity.builder()
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .platformRole("PERSONAL_USER")
                .onboardingCompleted(false)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getPlatformRole());
        String refreshToken = createAndSaveRefreshToken(user);

        return new AuthResult(UserDto.fromEntity(user), accessToken, refreshToken);
    }

    @Transactional
    public AuthResult login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getPlatformRole());
        String refreshToken = createAndSaveRefreshToken(user);

        return new AuthResult(UserDto.fromEntity(user), accessToken, refreshToken);
    }

    @Transactional
    public AuthResult refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        RefreshTokenEntity tokenEntity = refreshTokenRepository.findByTokenHashAndRevokedFalse(rawRefreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or revoked refresh token"));

        if (tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenEntity.setRevoked(true);
            refreshTokenRepository.save(tokenEntity);
            throw new IllegalArgumentException("Refresh token expired");
        }

        // Rotate token
        tokenEntity.setRevoked(true);
        refreshTokenRepository.save(tokenEntity);

        UserEntity user = tokenEntity.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getPlatformRole());
        String newRefreshToken = createAndSaveRefreshToken(user);

        return new AuthResult(UserDto.fromEntity(user), newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenRepository.findByTokenHashAndRevokedFalse(rawRefreshToken)
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.fromEntity(user);
    }

    private String createAndSaveRefreshToken(UserEntity user) {
        String tokenString = jwtTokenProvider.generateRefreshTokenString();
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshTokenValidityMs() / 1000);

        RefreshTokenEntity entity = RefreshTokenEntity.builder()
                .user(user)
                .tokenHash(tokenString)
                .expiresAt(expiresAt)
                .revoked(false)
                .build();

        refreshTokenRepository.save(entity);
        return tokenString;
    }
}
