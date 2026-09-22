# Phase 2: Frontend Data Types, API Clients & React Query Hooks

## Context & Objectives
Define frontend TypeScript types matching the backend cognitive load DTOs and build TanStack Query hooks to fetch assessments and rebalance options with cache invalidation on timetable modifications.

## File Ownership
- [MODIFY] `src/types/planner.ts`
- [MODIFY] `src/lib/api.ts`
- [NEW] `src/hooks/useCognitiveLoad.ts`

## Detailed Implementation Steps
1. **Define TypeScript Types in `src/types/planner.ts`:**
   - `CognitiveLoadLevel`: `'LIGHT' | 'MODERATE' | 'HEAVY'`
   - `CognitiveMetrics`: `{ totalTasks: number; meetingCount: number; backToBackCount: number; contextSwitchCount: number; highFocusHours: number; totalBufferMinutes: number; deadlineCount: number; }`
   - `CognitiveLoadAssessment`: `{ date: string; score: number; level: CognitiveLoadLevel; summary: string; bulletPoints: string[]; metrics: CognitiveMetrics; isDemanding: boolean; }`
   - `QuickRebalanceOption`: `{ id: string; type: string; title: string; description: string; estimatedLoadReduction: number; diff: { movedBlockCount: number; bufferAddedMinutes: number; deferredBlockCount: number; }; proposedBlocks: TimeBlock[]; }`
   - `QuickRebalanceProposal`: `{ date: string; loadScore: number; options: QuickRebalanceOption[]; }`
2. **Add API endpoints in `src/lib/api.ts`:**
   - `getWorkloadAssessment(date: string): Promise<CognitiveLoadAssessment>`
   - `getQuickRebalanceOptions(date: string): Promise<QuickRebalanceProposal>`
3. **Build `src/hooks/useCognitiveLoad.ts`:**
   - `useWorkloadAssessmentQuery(date: string)`
   - `useQuickRebalanceOptionsQuery(date: string)`
   - Hook to apply a quick rebalance proposal (`useApplyQuickRebalanceMutation`) utilizing `batchApplyScenarioMutation`.

## Verification
- Run typecheck:
  ```bash
  npm run build
  ```
