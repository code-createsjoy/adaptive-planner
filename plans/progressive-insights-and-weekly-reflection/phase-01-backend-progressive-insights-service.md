# Phase 1: Backend Progressive & Retrospective Insights Calculation Service

## Context & Objectives
Implement the backend calculation engine that evaluates both the current week's accumulated live metrics (with `EARLY` vs `CONFIRMED` data maturity tag) and the previous week's archived reflection.

## File Ownership
- [NEW] `com/adaptive/planner/dto/insights/ProgressiveInsightsDto.java`
- [NEW] `com/adaptive/planner/dto/insights/CurrentWeekProgressDto.java`
- [NEW] `com/adaptive/planner/dto/insights/LastWeekReflectionDto.java`
- [NEW] `com/adaptive/planner/dto/insights/DaypartRhythmDto.java`
- [NEW] `com/adaptive/planner/dto/insights/PatternObservationDto.java`
- [NEW] `com/adaptive/planner/service/ProgressiveInsightsService.java`
- [MODIFY] `com/adaptive/planner/controller/InsightsController.java`
- [NEW] `com/adaptive/planner/service/ProgressiveInsightsServiceTest.java`
- [MODIFY] `com/adaptive/planner/controller/InsightsControllerTest.java`

## Detailed Implementation Steps
1. **Define DTOs in package `com.adaptive.planner.dto.insights`:**
   - `ProgressiveInsightsDto`: fields `currentWeek` (`CurrentWeekProgressDto`), `lastWeek` (`LastWeekReflectionDto`).
   - `CurrentWeekProgressDto`: `weekStart`, `weekEnd`, `dayIndex` (1-7), `totalDaysInWeek` (7), `completedTasks`, `scheduledTasks`, `completionRate`, `totalFocusMinutes`, `focusSessionsCount`, `daypartRhythm` (`DaypartRhythmDto`), `pattern` (`PatternObservationDto`).
   - `DaypartRhythmDto`: `morningFocusMinutes`, `afternoonFocusMinutes`, `eveningFocusMinutes`, `dominantPeriod`.
   - `PatternObservationDto`: `maturity` (`EARLY` | `CONFIRMED`), `tag`, `observation`, `evidenceDetail`.
   - `LastWeekReflectionDto`: `weekStart`, `weekEnd`, `completedTasks`, `scheduledTasks`, `completionRate`, `totalFocusMinutes`, `dominantPattern`, `whyReason`, `suggestion` (`SuggestionDto`).
2. **Implement `ProgressiveInsightsService`:**
   - Fetch `TimeBlockEntity` records for current week (`weekStart` to `weekStart + 6 days`) and previous week (`weekStart - 7 days` to `weekStart - 1 day`).
   - Calculate live metrics for current week: total tasks, completed tasks, focus duration, daypart distribution (Morning: 06:00-12:00, Afternoon: 12:00-18:00, Evening: 18:00-24:00).
   - Evaluate pattern: If days logged <= 2, set maturity to `EARLY` with modest phrasing (*"🌱 Xu hướng ban đầu (Dựa trên N ngày)"*). If days >= 3, set maturity to `CONFIRMED`.
   - Calculate last week retrospective: summarize completions, total deep work, pattern identified, and 1-click suggestion.
3. **Expose REST Endpoint in `InsightsController`:**
   - `GET /api/insights/progressive?weekStart=YYYY-MM-DD`
4. **Unit & Controller Tests:**
   - Test early-week evaluation (Day 1-2 returns `EARLY` maturity and valid metrics).
   - Test last-week reflection generation.

## Verification
- Run tests:
  ```bash
  mvn test "-Dtest=ProgressiveInsightsServiceTest,InsightsControllerTest"
  ```
