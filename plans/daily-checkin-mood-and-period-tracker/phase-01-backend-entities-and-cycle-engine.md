# Phase 1: Backend Domain Models, Repository, DTOs & Cycle Calculation Engine

## Context & Objectives
Build the foundation for persisting daily check-ins (mood emoji, energy level, notes, period flow) and the cycle prediction calculation engine.

## File Ownership
- [NEW] `src/main/java/com/adaptive/planner/entity/DailyCheckinEntity.java`
- [NEW] `src/main/java/com/adaptive/planner/enums/PeriodFlow.java`
- [NEW] `src/main/java/com/adaptive/planner/repository/DailyCheckinRepository.java`
- [NEW] `src/main/java/com/adaptive/planner/dto/DailyCheckinDto.java`
- [NEW] `src/main/java/com/adaptive/planner/dto/CyclePredictionDto.java`
- [NEW] `src/main/java/com/adaptive/planner/service/CyclePredictionService.java`
- [NEW] `src/main/java/com/adaptive/planner/service/DailyCheckinService.java`

## Detailed Implementation Steps
1. **Create `PeriodFlow` enum:**
   - Values: `NONE`, `SPOTTING`, `LIGHT`, `MEDIUM`, `HEAVY`.
2. **Create `DailyCheckinEntity`:**
   - Fields: `id` (Long, auto-generated), `userId` (String, default "default-user"), `checkinDate` (`LocalDate`, indexed, unique per user+date), `moodEmoji` (String), `moodLabel` (String), `energyLevel` (Integer, 1-5), `note` (TEXT), `isPeriodDay` (Boolean), `flowIntensity` (Enum `PeriodFlow`), `createdAt`, `updatedAt`.
3. **Create `DailyCheckinRepository`:**
   - Methods:
     - `Optional<DailyCheckinEntity> findByUserIdAndCheckinDate(String userId, LocalDate date);`
     - `List<DailyCheckinEntity> findByUserIdAndCheckinDateBetweenOrderByCheckinDateAsc(String userId, LocalDate start, LocalDate end);`
     - `List<DailyCheckinEntity> findByUserIdAndIsPeriodDayTrueOrderByCheckinDateAsc(String userId);`
4. **Implement `CyclePredictionService`:**
   - Extract distinct period onset dates (first day of each consecutive period streak).
   - If ≥ 2 cycle onsets exist, compute average cycle length in days (e.g. 26-32 days). Default to 28 days if fewer than 2 cycles logged.
   - Average period duration defaults to 4-5 days (or historical average).
   - Project next 1-3 future period ranges (`predictedStartDate`, `predictedEndDate`, `confidenceLevel`).
5. **Implement `DailyCheckinService`:**
   - Upsert logic: If an entry exists for the user and date, update it; otherwise create a new entity.
   - Query range logic: Fetches check-ins and decorates with cycle prediction data.
   - Delete logic: Deletes check-in by date or ID.

## Verification
- Unit test `CyclePredictionServiceTest` with simulated historical period dates verifying accurate projected cycle intervals and fallback to 28 days.
- Unit test `DailyCheckinServiceTest` for CRUD operations and duplicate date handling.
