package com.adaptive.planner.controller;

import com.adaptive.planner.dto.*;
import com.adaptive.planner.service.AiPlannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
public class AiPlannerController {

    private final AiPlannerService aiPlannerService;

    @PostMapping("/parse-intent")
    public ResponseEntity<TimeBlockDto> parseIntent(@Valid @RequestBody ParseIntentRequest request) {
        TimeBlockDto parsed = aiPlannerService.parseIntent(request.getPrompt());
        return ResponseEntity.ok(parsed);
    }

    @PostMapping("/reschedule-scenarios")
    public ResponseEntity<RescheduleResponseDto> generateRescheduleScenarios(
            @Valid @RequestBody RescheduleRequest request) {
        RescheduleResponseDto response = aiPlannerService.generateRescheduleScenarios(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/task-breakdown")
    public ResponseEntity<TaskBreakdownResponseDto> breakdownTask(
            @Valid @RequestBody ParseIntentRequest request) {
        TaskBreakdownResponseDto response = aiPlannerService.breakdownTask(request.getPrompt());
        return ResponseEntity.ok(response);
    }
}
