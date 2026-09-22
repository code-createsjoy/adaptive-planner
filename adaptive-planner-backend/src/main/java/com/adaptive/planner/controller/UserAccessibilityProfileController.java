package com.adaptive.planner.controller;

import com.adaptive.planner.dto.OnboardingAnswersDto;
import com.adaptive.planner.dto.UserAccessibilityProfileDto;
import com.adaptive.planner.service.UserAccessibilityProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/accessibility-profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserAccessibilityProfileController {

    private final UserAccessibilityProfileService service;

    @GetMapping
    public ResponseEntity<UserAccessibilityProfileDto> getProfile(
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        UserAccessibilityProfileDto profile = service.getOrCreateProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserAccessibilityProfileDto> updateProfile(
            @RequestBody UserAccessibilityProfileDto dto,
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        UserAccessibilityProfileDto updated = service.updateProfile(userId, dto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/onboarding")
    public ResponseEntity<UserAccessibilityProfileDto> completeOnboarding(
            @RequestBody OnboardingAnswersDto answers,
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        UserAccessibilityProfileDto profile = service.completeOnboarding(userId, answers);
        return ResponseEntity.ok(profile);
    }
}
