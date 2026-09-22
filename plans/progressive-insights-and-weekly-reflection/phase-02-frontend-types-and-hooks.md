# Phase 2: Frontend Data Types, API Clients & React Query Hooks

## Context & Objectives
Define TypeScript interfaces matching the backend `ProgressiveInsightsDto`, wire the REST client call in `api.ts`, and create dedicated React Query hooks for fetching progressive insights with caching and optimistic updates.

## File Ownership
- [NEW/MODIFY] `adaptive-planner-frontend/src/features/insights/types.ts`
- [MODIFY] `adaptive-planner-frontend/src/lib/api.ts`
- [NEW/MODIFY] `adaptive-planner-frontend/src/features/insights/hooks/useProgressiveInsights.ts`

## Detailed Implementation Steps

1. **Define TypeScript Types in `src/features/insights/types.ts`:**
   ```typescript
   export type DominantPeriod = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'BALANCED';
   export type PatternMaturity = 'EARLY' | 'CONFIRMED';

   export interface DaypartRhythm {
     morningFocusMinutes: number;
     afternoonFocusMinutes: number;
     eveningFocusMinutes: number;
     dominantPeriod: DominantPeriod;
   }

   export interface PatternObservation {
     maturity: PatternMaturity;
     tag: string;
     observation: string;
     evidenceDetail: string;
   }

   export interface CurrentWeekProgress {
     weekStart: string;
     weekEnd: string;
     dayIndex: number;
     totalDaysInWeek: number;
     completedTasks: number;
     scheduledTasks: number;
     completionRate: number;
     totalFocusMinutes: number;
     focusSessionsCount: number;
     daypartRhythm: DaypartRhythm;
     pattern: PatternObservation;
   }

   export interface LastWeekSuggestion {
     id: string;
     title: string;
     description: string;
     actionLabel: string;
   }

   export interface LastWeekReflection {
     weekStart: string;
     weekEnd: string;
     completedTasks: number;
     scheduledTasks: number;
     completionRate: number;
     totalFocusMinutes: number;
     dominantPattern: string;
     whyReason: string;
     suggestion?: LastWeekSuggestion;
   }

   export interface ProgressiveInsightsData {
     currentWeek: CurrentWeekProgress;
     lastWeek: LastWeekReflection;
   }
   ```

2. **Add API Method in `src/lib/api.ts`:**
   ```typescript
   getProgressiveInsights: (weekStart: string): Promise<ProgressiveInsightsData> =>
     fetchApi<ProgressiveInsightsData>(`/api/insights/progressive?weekStart=${weekStart}`),
   ```

3. **Implement React Query Hook in `useProgressiveInsights.ts`:**
   ```typescript
   export function useProgressiveInsights(weekStart: string) {
     return useQuery({
       queryKey: ['insights', 'progressive', weekStart],
       queryFn: () => api.getProgressiveInsights(weekStart),
       staleTime: 60 * 1000, // 1 minute
     });
   }
   ```

## Verification
- Run frontend typecheck:
  ```bash
  cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend
  npm run build
  ```
