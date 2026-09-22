package com.adaptive.planner.dto.auth;

public record AuthResponse(
        UserDto user,
        String message
) {}
