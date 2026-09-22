package com.adaptive.planner.controller;

import com.adaptive.planner.dto.onboarding.AssessmentSubmissionRequest;
import com.adaptive.planner.dto.onboarding.FunctionalProfileDto;
import com.adaptive.planner.dto.onboarding.JourneyStageRequest;
import com.adaptive.planner.dto.onboarding.NeurodivergenceSelfIdRequest;
import com.adaptive.planner.security.UserPrincipal;
import com.adaptive.planner.service.OnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"}, allowCredentials = "true")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/journey-stage")
    public ResponseEntity<Void> saveJourneyStage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody JourneyStageRequest request
    ) {
        Long userId = resolveUserId(principal);
        onboardingService.saveJourneyStage(userId, request.journeyStage());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/neurodivergence-self-id")
    public ResponseEntity<Void> saveNeurodivergenceSelfId(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody NeurodivergenceSelfIdRequest request
    ) {
        Long userId = resolveUserId(principal);
        onboardingService.saveNeurodivergenceSelfId(userId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/assessment/submit")
    public ResponseEntity<FunctionalProfileDto> submitAssessment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AssessmentSubmissionRequest request
    ) {
        Long userId = resolveUserId(principal);
        FunctionalProfileDto profile = onboardingService.submitAssessment(userId, request);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/complete")
    public ResponseEntity<Void> completeOnboarding(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = resolveUserId(principal);
        onboardingService.completeOnboarding(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/functional-profile")
    public ResponseEntity<FunctionalProfileDto> getFunctionalProfile(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = resolveUserId(principal);
        FunctionalProfileDto profile = onboardingService.getFunctionalProfile(userId);
        return ResponseEntity.ok(profile);
    }

    private Long resolveUserId(UserPrincipal principal) {
        if (principal != null) {
            return principal.id();
        }
        // Dev fallback for single-user testing if principal not yet set
        return 1L;
    }
}
