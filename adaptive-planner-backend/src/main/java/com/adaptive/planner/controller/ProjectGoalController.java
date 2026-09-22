package com.adaptive.planner.controller;

import com.adaptive.planner.dto.ApplyGoalScenarioRequest;
import com.adaptive.planner.dto.ProjectGoalDto;
import com.adaptive.planner.dto.ProjectSubtaskDto;
import com.adaptive.planner.service.ProjectGoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectGoalController {

    private final ProjectGoalService projectGoalService;

    @GetMapping
    public ResponseEntity<List<ProjectGoalDto>> getAllGoals() {
        return ResponseEntity.ok(projectGoalService.getAllGoals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectGoalDto> getGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(projectGoalService.getGoalById(id));
    }

    @GetMapping("/today")
    public ResponseEntity<List<ProjectSubtaskDto>> getTodaySubtasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(projectGoalService.getTodaySubtasks(date));
    }

    @PatchMapping("/subtasks/{subtaskId}/toggle")
    public ResponseEntity<ProjectSubtaskDto> toggleSubtask(
            @PathVariable Long subtaskId,
            @RequestBody(required = false) Map<String, Boolean> body
    ) {
        Boolean completed = (body != null) ? body.get("completed") : null;
        return ResponseEntity.ok(projectGoalService.toggleSubtask(subtaskId, completed));
    }

    @PostMapping("/apply-scenario")
    public ResponseEntity<ProjectGoalDto> applyScenario(@RequestBody ApplyGoalScenarioRequest request) {
        return ResponseEntity.ok(projectGoalService.applyGoalScenario(request));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ProjectGoalDto> completeProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectGoalService.completeProject(id));
    }
}
