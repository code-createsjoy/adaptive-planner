# Phase 01: Backend Routine, Holiday Engine & Date-scoped TimeBlock APIs

## Deliverables
1. **Mock Seed Purge:** Remove legacy hardcoded mock timeblocks in `TimeBlockService.java`.
2. **WeeklyRoutine Domain:**
   - Create `WeeklyRoutineEntity`: `id`, `dayOfWeek` (`DayOfWeek` enum: `MONDAY`..`SUNDAY`), `startTime`, `endTime`, `title`, `category`, `energyLevel`, `priority`, `detail`, `enabled`.
   - Create `WeeklyRoutineRepository`, `WeeklyRoutineDto`, `WeeklyRoutineService`, `WeeklyRoutineController` (`/api/routines`).
3. **TimeBlockEntity Date Enhancement:**
   - Add fields: `date` (`LocalDate` nullable/default today), `sourceType` (`ROUTINE`, `CUSTOM`, `AI_ADDED`, `AI_RESCHEDULED`), `sourceRoutineId` (`Long`), `overrideType` (`NONE`, `MODIFIED`, `CANCELLED`).
   - Add repository query methods: `findByDate(LocalDate date)`, `findByDateBetween(LocalDate start, LocalDate end)`.
4. **Vietnamese Holiday Engine:**
   - Create `HolidayService` & `HolidayDto` supporting Solar holidays (01/01 Tết Dương lịch, 30/04 Giải phóng, 01/05 Quốc tế Lao động, 02/09 Quốc khánh) and statutory Lunar holidays (Tết Nguyên Đán từ 29/30 tháng Chạp đến mùng 3-5 Tết, 10/03 Giỗ Tổ Hùng Vương).
   - Expose endpoint `GET /api/holidays?year=YYYY&month=M`.
5. **Timeline Projection API:**
   - Enhance `GET /api/timeblocks?date=YYYY-MM-DD` to merge active `WeeklyRoutine` entries for that day of week with persisted `TimeBlock` overrides for that specific date.
   - Endpoint `POST /api/timeblocks/pause-routine-date?date=YYYY-MM-DD` to cancel all routine items on a single date with 1 click.

## Verification
- Unit & integration tests for routine CRUD, holiday detection, and date-specific projection.
- `mvn test` $\rightarrow$ `BUILD SUCCESS`.
