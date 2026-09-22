# Phase 1: Diff Calculation Engine (`calculateScheduleDiff.ts`)

**Goal:** Create a robust, pure TypeScript utility to compare baseline timetable blocks with scenario blocks and pending tasks.

---

## Technical Details

### File: `src/lib/calculateScheduleDiff.ts`

```typescript
export type DiffChangeType = 
  | 'NEW'
  | 'SHIFT_LATER'
  | 'SHIFT_EARLIER'
  | 'COMPRESSED'
  | 'DEFERRED'
  | 'UNCHANGED_PROTECTED';

export interface ScheduleDiffItem {
  id: string;
  title: string;
  oldStartTime?: string;
  oldEndTime?: string;
  newStartTime?: string;
  newEndTime?: string;
  changeType: DiffChangeType;
  deltaMinutes?: number;
  durationDeltaMinutes?: number;
  badgeLabel: string;
  badgeColor: string;
  category?: string;
  energyLevel?: string;
  detail?: string;
}

export interface ScheduleDiffResult {
  items: ScheduleDiffItem[];
  hasChanges: boolean;
  totalShiftedCount: number;
  totalCompressedCount: number;
  totalDeferredCount: number;
  newAddedCount: number;
}
```

### Matching Logic:
1. Identify the new task (matches `pendingActivity.title` or marked as newly introduced in scenario).
2. For each baseline block in `currentBlocks`:
   - Match with corresponding block in `scenario.blocks` by `id` or `sourceRoutineId` or exact title.
   - If not in `scenario.blocks`: mark as `DEFERRED` (e.g. moved to tomorrow/inbox).
   - If in `scenario.blocks`:
     - Compare `startTime` & `endTime`.
     - If start shifted later: `SHIFT_LATER` (e.g. `+45m`).
     - If start shifted earlier: `SHIFT_EARLIER` (e.g. `-30m`).
     - If duration decreased without start shift: `COMPRESSED`.
     - If unchanged: `UNCHANGED_PROTECTED` (only displayed if protected/vital or in full timeline).

---

## Verification
- Validate calculation with edge cases:
  - Exact time match (no diff).
  - Shifted start time.
  - Shortened duration.
  - Deferred to inbox/tomorrow.
