package com.adaptive.planner.security;

import java.security.Principal;

public record UserPrincipal(Long id, String email, String role) implements Principal {
    @Override
    public String getName() {
        return email;
    }
}
