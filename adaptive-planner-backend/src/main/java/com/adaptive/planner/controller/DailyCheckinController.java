package com.adaptive.planner.controller;

import com.adaptive.planner.dto.CyclePredictionDto;
import com.adaptive.planner.dto.DailyCheckinDto;
import com.adaptive.planner.dto.ProactiveAdaptationRequest;
import com.adaptive.planner.dto.ProactiveAdaptationResponse;
import com.adaptive.planner.service.DailyCheckinService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/daily-checkins")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DailyCheckinController {

    private final DailyCheckinService dailyCheckinService;

    @GetMapping
    public ResponseEntity<List<DailyCheckinDto>> getCheckinsInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        List<DailyCheckinDto> list = dailyCheckinService.getCheckinsInRange(userId, startDate, endDate);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{date}")
    public ResponseEntity<DailyCheckinDto> getCheckinByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        return dailyCheckinService.getCheckinByDate(userId, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<DailyCheckinDto> upsertCheckin(
            @RequestBody DailyCheckinDto dto,
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        DailyCheckinDto saved = dailyCheckinService.upsertCheckin(userId, dto);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/by-date/{date}")
    public ResponseEntity<Void> deleteCheckinByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        dailyCheckinService.deleteCheckinByDate(userId, date);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCheckinById(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        dailyCheckinService.deleteCheckinById(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cycle-prediction")
    public ResponseEntity<CyclePredictionDto> getCyclePredictions(
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        CyclePredictionDto prediction = dailyCheckinService.getCyclePredictions(userId);
        return ResponseEntity.ok(prediction);
    }

    @PostMapping("/evaluate-adaptation")
    public ResponseEntity<ProactiveAdaptationResponse> evaluateAdaptation(
            @RequestBody ProactiveAdaptationRequest request,
            @RequestParam(required = false, defaultValue = "default-user") String userId
    ) {
        ProactiveAdaptationResponse response = dailyCheckinService.evaluateProactiveAdaptation(userId, request);
        return ResponseEntity.ok(response);
    }
}
