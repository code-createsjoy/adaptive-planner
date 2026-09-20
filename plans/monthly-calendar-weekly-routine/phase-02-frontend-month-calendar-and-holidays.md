# Phase 02: Frontend Monthly Calendar View & Holiday Badges

## Deliverables
1. **API Client & Hooks:**
   - Extend `src/services/api.ts` with `getMonthlyBlocks(year, month)`, `getRoutines()`, `createRoutine()`, `updateRoutine()`, `deleteRoutine()`, `getHolidays(year, month)`.
   - Add TanStack Query hooks: `useMonthlyCalendarQuery`, `useHolidaysQuery`, `useRoutinesQuery`.
2. **Monthly Calendar Component (`src/components/adaptive/MonthCalendarView.tsx`):**
   - Clean 7-column grid (Mon $\rightarrow$ Sun).
   - Month & Year switcher (Previous month, Next month, Today shortcut).
   - Day cells with:
     - Date number (subtle styling).
     - Indicator for "Today" (glowing ring).
     - Indicator for "Selected Date" (solid accent pill/highlight).
     - Workload dots (`●` 1-2 tasks, `●●` 3-4 tasks, `●●●` 5+ tasks).
     - Festive badge `🇻🇳` with tooltip/label for Vietnamese National Holidays.
3. **App View Switching & Date Selection:**
   - Add View Switcher in Header/Navbar: `📅 Month Calendar` $\leftrightarrow$ `⏱ Day Timeline`.
   - Clicking any date cell in the Month Calendar auto-selects that date and transitions to the Day Timeline for that date.

## Verification
- Responsive month rendering across different months (e.g. September, October, February).
- Correct mapping of Vietnamese holidays (e.g. 02/09, 30/04, 01/05, etc.).
- Fast date switching without lag.
