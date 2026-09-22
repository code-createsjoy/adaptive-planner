# Phase 2: Backend REST APIs, Proactive AI Adaptation Controller & Unit Tests

## Context & Objectives
Expose REST endpoints for frontend integration and implement proactive workload evaluation when low energy or period days are recorded.

## File Ownership
- [NEW] `src/main/java/com/adaptive/planner/controller/DailyCheckinController.java`
- [NEW] `src/main/java/com/adaptive/planner/dto/ProactiveAdaptationRequest.java`
- [NEW] `src/main/java/com/adaptive/planner/dto/ProactiveAdaptationResponse.java`
- [MODIFY] `src/main/java/com/adaptive/planner/service/DailyCheckinService.java`
- [NEW] `src/test/java/com/adaptive/planner/controller/DailyCheckinControllerTest.java`
- [NEW] `src/test/java/com/adaptive/planner/service/DailyCheckinServiceTest.java`
- [NEW] `src/test/java/com/adaptive/planner/service/CyclePredictionServiceTest.java`

## Detailed Implementation Steps
1. **Define Proactive Adaptation Request & Response:**
   - Evaluates scheduled `TimeBlock` items for the checkin date.
   - If `energyLevel <= 2` or `isPeriodDay == true`, identifies high-energy tasks (category `work`, `urgent`, energy `high`, or duration > 90m).
   - Generates recommendation explanation (e.g. "Phát hiện thể trạng mệt mỏi vào ngày chu kỳ. Đề xuất chuyển 2 tác vụ Deep Work sang ngày mai và chèn thêm 30 phút nghỉ ngơi.") and specific proposed block diffs.
2. **Implement `DailyCheckinController`:**
   - `GET /api/daily-checkins`: parameters `startDate`, `endDate`, returns list of `DailyCheckinDto`.
   - `GET /api/daily-checkins/{date}`: returns check-in for specific date.
   - `POST /api/daily-checkins`: validates and saves/updates check-in.
   - `DELETE /api/daily-checkins/{id}` or `DELETE /api/daily-checkins/by-date/{date}`.
   - `GET /api/daily-checkins/cycle-prediction`: returns upcoming cycle prediction windows.
   - `POST /api/daily-checkins/evaluate-adaptation`: takes date and check-in details, returns proactive rescheduling recommendation if applicable.
3. **Write Unit & Integration Tests:**
   - `DailyCheckinControllerTest`: MockMvc tests for GET, POST, DELETE, and cycle-prediction endpoints.
   - `DailyCheckinServiceTest`: verify range lookups, updates, and adaptation suggestions.
   - `CyclePredictionServiceTest`: test edge cases (0 logs, 1 log, irregular intervals, overlapping periods).

## Verification
- Run all backend tests:
  ```bash
  mvn clean test -Dtest=DailyCheckinControllerTest,DailyCheckinServiceTest,CyclePredictionServiceTest
  ```
