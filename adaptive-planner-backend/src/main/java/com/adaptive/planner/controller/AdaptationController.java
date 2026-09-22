package com.adaptive.planner.controller;

import com.adaptive.planner.dto.AdaptationActionDto;
import com.adaptive.planner.dto.AdaptationActionResultDto;
import com.adaptive.planner.dto.ApplyAdaptationRequest;
import com.adaptive.planner.service.AdaptationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping({"/api/planner/adaptation", "/api/ai/adaptations"})
@RequiredArgsConstructor
public class AdaptationController {

    private final AdaptationService adaptationService;

    @GetMapping
    public ResponseEntity<List<AdaptationActionDto>> getAdaptations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(adaptationService.getAdaptations(date));
    }

    @GetMapping("/{actionId}")
    public ResponseEntity<AdaptationActionDto> getAdaptationById(@PathVariable Long actionId) {
        return ResponseEntity.ok(adaptationService.getAdaptationById(actionId));
    }

    @PostMapping("/apply")
    public ResponseEntity<AdaptationActionResultDto> applyAdaptation(@RequestBody ApplyAdaptationRequest request) {
        return ResponseEntity.ok(adaptationService.applyAdaptation(request));
    }

    @PostMapping("/undo/{actionId}")
    public ResponseEntity<AdaptationActionResultDto> undoAdaptation(@PathVariable Long actionId) {
        return ResponseEntity.ok(adaptationService.undoAdaptation(actionId));
    }
}
