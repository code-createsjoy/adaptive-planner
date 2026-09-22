package com.adaptive.planner.controller;

import com.adaptive.planner.dto.insights.ProgressiveInsightsDto;
import com.adaptive.planner.dto.insights.SaveExperimentRequest;
import com.adaptive.planner.dto.insights.WeeklyInsightsResponse;
import com.adaptive.planner.entity.InsightExperimentEntity;
import com.adaptive.planner.service.InsightExperimentService;
import com.adaptive.planner.service.ProgressiveInsightsService;
import com.adaptive.planner.service.WeeklyInsightsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InsightsController {

    private final WeeklyInsightsService weeklyInsightsService;
    private final ProgressiveInsightsService progressiveInsightsService;
    private final InsightExperimentService experimentService;

    @GetMapping("/progressive")
    public ResponseEntity<ProgressiveInsightsDto> getProgressiveInsights(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart
    ) {
        ProgressiveInsightsDto response = progressiveInsightsService.getProgressiveInsights(weekStart);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyInsightsResponse> getWeeklyInsights(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart
    ) {
        WeeklyInsightsResponse response = weeklyInsightsService.getWeeklyInsights(weekStart);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/experiments")
    public ResponseEntity<InsightExperimentEntity> saveExperiment(@RequestBody @Valid SaveExperimentRequest request) {
        InsightExperimentEntity entity = experimentService.saveExperiment(request);
        return ResponseEntity.ok(entity);
    }

    @PostMapping("/experiments/dismiss")
    public ResponseEntity<Void> dismissExperiment(@RequestBody @Valid SaveExperimentRequest request) {
        experimentService.dismissExperiment(request);
        return ResponseEntity.ok().build();
    }
}
