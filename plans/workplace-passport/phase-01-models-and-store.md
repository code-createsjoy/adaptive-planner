# Phase 1: Models & State Management

## Goal
Define TypeScript data models, initial mock seed passport, AI insight suggestions, and persistent Zustand store (`useWorkModeStore`) with translation engine.

## Target Files
- `src/features/work-mode/types.ts` [NEW]
- `src/features/work-mode/store/useWorkModeStore.ts` [NEW]

## Detailed Implementation Steps
1. **Define Data Models (`src/features/work-mode/types.ts`):**
   - `SharingVisibility`: `'private'` | `'manager'` | `'team'`.
   - `WorkPreferenceCategory`:
     - `focus`: `bestFocusTime`, `deepWorkDuration`, `meetingFreePref`, `interruptionSensitivity`, `environment`, `notes`.
     - `communication`: `channels` (string[]), `formats` (string[]), `notes`.
     - `task`: `preferences` (string[]: 'single_priority', 'micro_milestones', 'clear_deadline', 'clear_output', 'checklist', 'time_blocking'), `notes`.
     - `feedback`: `preferences` (string[]: 'private', 'direct', 'specific_examples', 'written', 'next_steps', 'processing_buffer'), `notes`.
     - `meeting`: `preferences` (string[]: 'agenda_before', 'written_summary', 'camera_optional', 'short_meetings', 'processing_time'), `notes`.
     - `contextSwitching`: `preferences` (string[]: 'fewer_switches', 'transition_buffer', 'batch_similar', 'no_back_to_back'), `notes`.
     - `strengths`: `items` (string[]: 'deep_focus', 'pattern_recognition', 'creative_thinking', 'detail_oriented', 'analytical_thinking', 'problem_solving', 'structured_work', 'research', 'technical_depth'), `notes`.
   - `WorkplacePassport`: `userId`, `categories` with data and `visibility` per category, `lastUpdated`.
   - `AiSuggestedInsight`: `id`, `category`, `insightText`, `recommendedValue`, `sourceReason`, `status`: `'pending'` | `'approved'` | `'dismissed'`.
   - `AdaptedTask`: `id`, `goal`, `deadline`, `priority`, `steps`: string[], `expectedOutput`, `suggestedFirstAction`, `originalRequest`, `createdAt`.

2. **Define Zustand Store (`useWorkModeStore.ts`):**
   - State: `activeRole`: `'employee'` | `'manager'`, `passport`: `WorkplacePassport`, `suggestedInsights`: `AiSuggestedInsight[]`, `translatedTasks`: `AdaptedTask[]`.
   - Actions:
     - `setActiveRole(role)`: switches between Employee View and Manager View.
     - `updateCategory(categoryKey, data)`: updates preference chips/text.
     - `setCategoryVisibility(categoryKey, visibility)`: updates per-card privacy.
     - `approveAiInsight(insightId)`: incorporates suggested insight into corresponding passport card and marks status approved.
     - `dismissAiInsight(insightId)`: dismisses suggestion.
     - `translateManagerTask(rawText, deadline, priority)`: generates neuro-inclusive structured `AdaptedTask`.
     - `resetToDemoPassport()`: resets store to pristine presentation state.

## Verification
- Type check passes cleanly with 0 errors.
