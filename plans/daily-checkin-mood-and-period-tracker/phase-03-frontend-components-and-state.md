# Phase 3: Frontend Types, API Client, Hooks & Daily Check-in Popover Component

## Context & Objectives
Implement frontend types, API services, state management, and the sensory-friendly `DailyCheckinPopover` component with mood emojis, notes, and period flow controls.

## File Ownership
- [MODIFY] `src/types/planner.ts`
- [MODIFY] `src/lib/api.ts`
- [NEW] `src/hooks/useDailyCheckins.ts`
- [NEW] `src/components/adaptive/DailyCheckinPopover.tsx`

## Detailed Implementation Steps
1. **Extend `src/types/planner.ts`:**
   - Define `PeriodFlow` = `'NONE' | 'SPOTTING' | 'LIGHT' | 'MEDIUM' | 'HEAVY'`.
   - Define `DailyCheckin` interface (`id`, `date`, `moodEmoji`, `moodLabel`, `energyLevel`, `note`, `isPeriodDay`, `flowIntensity`, `createdAt`, `updatedAt`).
   - Define `CyclePrediction` interface (`predictedStartDate`, `predictedEndDate`, `confidenceLevel`, `averageCycleLength`).
   - Define `ProactiveAdaptationSuggestion` interface (`hasRecommendation`, `reason`, `suggestedChanges`, `affectedBlocks`).
2. **Add API endpoints in `src/lib/api.ts`:**
   - `fetchDailyCheckins(startDate, endDate)`
   - `fetchCheckinByDate(date)`
   - `upsertDailyCheckin(checkinData)`
   - `deleteDailyCheckin(id)`
   - `fetchCyclePredictions()`
   - `evaluateProactiveAdaptation(date)`
3. **Create `src/hooks/useDailyCheckins.ts`:**
   - `useDailyCheckinsQuery(startDate, endDate)`
   - `useCyclePredictionsQuery()`
   - `useUpsertDailyCheckinMutation()` with cache invalidation for checkins and monthly calendar.
   - `useDeleteDailyCheckinMutation()`
4. **Create `src/components/adaptive/DailyCheckinPopover.tsx`:**
   - Sensory-friendly design with smooth transitions and clear visual affordances.
   - Preset quick mood emoji selector (😄 Vui vẻ, 😊 Ổn định, 🥱 Mệt mỏi, 😣 Kiệt sức, 🧘 Bình yên, 🔥 Tràn đầy năng lượng, 🌧️ Trầm lắng).
   - Energy Level Slider (1: Kiệt sức → 5: Đỉnh cao).
   - Daily reflection / short note textarea (with character counter).
   - Menstrual cycle toggle switch + Flow intensity chips (🩸 Nhẹ, Vừa, Nhiều, Đốm).
   - Action buttons: "Lưu Check-in", "Xoá", "Đóng".

## Verification
- Run TypeScript typecheck to verify interface contracts:
  ```bash
  npm run build
  ```
