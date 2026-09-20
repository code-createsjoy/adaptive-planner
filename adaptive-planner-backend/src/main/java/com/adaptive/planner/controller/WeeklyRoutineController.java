package com.adaptive.planner.controller;

import com.adaptive.planner.dto.CreateWeeklyRoutineRequest;
import com.adaptive.planner.dto.WeeklyRoutineDto;
import com.adaptive.planner.service.WeeklyRoutineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/routines")
@RequiredArgsConstructor
public class WeeklyRoutineController {

    private final WeeklyRoutineService routineService;

    @GetMapping
    public ResponseEntity<List<WeeklyRoutineDto>> getAllRoutines(
            @RequestParam(required = false) DayOfWeek dayOfWeek) {
        if (dayOfWeek != null) {
            return ResponseEntity.ok(routineService.getActiveRoutinesForDay(dayOfWeek));
        }
        return ResponseEntity.ok(routineService.getAllRoutines());
    }

    @PostMapping
    public ResponseEntity<List<WeeklyRoutineDto>> createRoutines(@Valid @RequestBody CreateWeeklyRoutineRequest request) {
        List<WeeklyRoutineDto> created = routineService.createRoutines(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<List<WeeklyRoutineDto>> updateRoutine(
            @PathVariable Long id,
            @RequestBody WeeklyRoutineDto updates,
            @RequestParam(defaultValue = "false") boolean updateAllMatching) {
        return ResponseEntity.ok(routineService.updateRoutineWithScope(id, updates, updateAllMatching));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<WeeklyRoutineDto> toggleRoutine(@PathVariable Long id) {
        return ResponseEntity.ok(routineService.toggleRoutine(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoutine(@PathVariable Long id) {
        routineService.deleteRoutine(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/copy-day")
    public ResponseEntity<List<WeeklyRoutineDto>> copyDayRoutines(
            @RequestParam DayOfWeek fromDay,
            @RequestParam List<DayOfWeek> toDays,
            @RequestParam(defaultValue = "false") boolean overwrite) {
        return ResponseEntity.ok(routineService.copyDayRoutines(fromDay, toDays, overwrite));
    }

    @PostMapping("/{id}/copy-to-days")
    public ResponseEntity<List<WeeklyRoutineDto>> copyRoutineToDays(
            @PathVariable Long id,
            @RequestParam List<DayOfWeek> targetDays) {
        return ResponseEntity.ok(routineService.copyRoutineToDays(id, targetDays));
    }
}
