package com.adaptive.planner.controller;

import com.adaptive.planner.dto.CognitiveLoadAssessmentDto;
import com.adaptive.planner.dto.QuickRebalanceProposalDto;
import com.adaptive.planner.service.CognitiveLoadEvaluationService;
import com.adaptive.planner.service.QuickRebalanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/workload")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CognitiveLoadController {

    private final CognitiveLoadEvaluationService evaluationService;
    private final QuickRebalanceService rebalanceService;

    @GetMapping("/evaluate")
    public ResponseEntity<CognitiveLoadAssessmentDto> evaluateWorkload(
            @RequestParam(name = "userId", defaultValue = "default-user") String userId,
            @RequestParam(name = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        log.info("Evaluating cognitive workload for user [{}] on date [{}]", userId, date);
        CognitiveLoadAssessmentDto assessment = evaluationService.evaluateSchedule(userId, date);
        return ResponseEntity.ok(assessment);
    }

    @GetMapping("/rebalance-options")
    public ResponseEntity<QuickRebalanceProposalDto> getRebalanceOptions(
            @RequestParam(name = "userId", defaultValue = "default-user") String userId,
            @RequestParam(name = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        log.info("Generating quick rebalance proposals for user [{}] on date [{}]", userId, date);
        QuickRebalanceProposalDto proposal = rebalanceService.generateRebalanceOptions(userId, date);
        return ResponseEntity.ok(proposal);
    }
}
