package com.adaptive.planner.controller;

import com.adaptive.planner.dto.CreateTimeBlockRequest;
import com.adaptive.planner.dto.TimeBlockDto;
import com.adaptive.planner.service.TimeBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timeblocks")
@RequiredArgsConstructor
public class TimeBlockController {

    private final TimeBlockService service;
    private final com.adaptive.planner.service.CalmSlotService calmSlotService;

    @GetMapping
    public ResponseEntity<List<TimeBlockDto>> getBlocks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(service.getBlocksForDate(date));
        }
        return ResponseEntity.ok(service.getBlocksForDate(LocalDate.now()));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<TimeBlockDto>> getInbox(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getInboxBlocks(date));
    }

    @PostMapping("/{id}/schedule-from-inbox")
    public ResponseEntity<TimeBlockDto> scheduleFromInbox(
            @PathVariable Long id,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.scheduleFromInbox(id, startTime, endTime, date));
    }

    @GetMapping("/calm-openings")
    public ResponseEntity<List<com.adaptive.planner.dto.CalmSlotDto>> getCalmOpenings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "60") int duration,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String energyLevel) {
        return ResponseEntity.ok(calmSlotService.findCalmOpenings(date, duration, category, energyLevel));
    }

    @GetMapping("/month")
    public ResponseEntity<Map<String, Object>> getMonthlySummary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        int targetMonth = (month != null) ? month : LocalDate.now().getMonthValue();
        return ResponseEntity.ok(service.getMonthlySummary(targetYear, targetMonth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimeBlockDto> getBlockById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getBlockById(id));
    }

    @PostMapping
    public ResponseEntity<TimeBlockDto> createBlock(@Valid @RequestBody CreateTimeBlockRequest request) {
        TimeBlockDto created = service.createBlock(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimeBlockDto> updateBlock(
            @PathVariable Long id,
            @RequestBody TimeBlockDto updates) {
        return ResponseEntity.ok(service.updateBlock(id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlock(@PathVariable Long id) {
        service.deleteBlock(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cancel-routine-date")
    public ResponseEntity<Void> cancelRoutineForDate(
            @RequestParam Long routineId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        service.cancelRoutineForDate(routineId, date);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/pause-routine-date")
    public ResponseEntity<Void> pauseAllRoutinesForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        service.pauseAllRoutinesForDate(date);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resume-routine-date")
    public ResponseEntity<Void> resumeAllRoutinesForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        service.resumeAllRoutinesForDate(date);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/purge")
    public ResponseEntity<Void> purgeAllBlocks() {
        service.purgeAllBlocks();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/batch-apply")
    public ResponseEntity<List<TimeBlockDto>> batchApplyScenario(@RequestBody List<TimeBlockDto> newBlocks) {
        return ResponseEntity.ok(service.batchApplyScenario(newBlocks));
    }
}
