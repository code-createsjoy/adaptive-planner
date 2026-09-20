package com.adaptive.planner.controller;

import com.adaptive.planner.dto.AdaptationActionResultDto;
import com.adaptive.planner.dto.ApplyAdaptationRequest;
import com.adaptive.planner.service.AdaptationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/planner/adaptation")
@RequiredArgsConstructor
public class AdaptationController {

    private final AdaptationService adaptationService;

    @PostMapping("/apply")
    public ResponseEntity<AdaptationActionResultDto> applyAdaptation(@RequestBody ApplyAdaptationRequest request) {
        return ResponseEntity.ok(adaptationService.applyAdaptation(request));
    }

    @PostMapping("/undo/{actionId}")
    public ResponseEntity<AdaptationActionResultDto> undoAdaptation(@PathVariable Long actionId) {
        return ResponseEntity.ok(adaptationService.undoAdaptation(actionId));
    }
}
