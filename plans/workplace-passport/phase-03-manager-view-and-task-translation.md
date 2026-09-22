# Phase 3: Manager View & AI Task Translation

## Goal
Build the Manager "How to Work with Me" Guide and the interactive AI Task Translation interface that translates raw manager tasks into structured neuro-inclusive task cards with 1-click timeline synchronization.

## Target Files
- `src/features/work-mode/components/ManagerWorkWithMeView.tsx` [NEW]
- `src/features/work-mode/components/TaskTranslationModal.tsx` [NEW]
- `src/features/work-mode/components/AdaptedTaskCard.tsx` [NEW]

## Detailed Implementation Steps
1. **`ManagerWorkWithMeView.tsx`:**
   - Filters employee passport: displays ONLY categories where `visibility !== 'private'`.
   - Structured summary cards:
     - 📌 **Best ways to assign work:** (e.g. Single priority, micro-milestones, clear expected output).
     - 💬 **Communication Guide:** (e.g. Written bullet points preferred, document decisions).
     - ⏳ **Focus Times & Meeting Boundaries:** (e.g. 9:00–11:00 AM focus block, provide agenda before meetings).
     - 💡 **Feedback Delivery:** (e.g. Private feedback with specific examples and next steps).
     - ⭐ **Highlighted Cognitive Strengths:** (e.g. Deep focus, pattern recognition, problem solving).
   - "Assign & Translate Task" primary action button.

2. **`TaskTranslationModal.tsx`:**
   - Manager input form: Raw task description (e.g. *"Prepare competitor research and presentation by Friday"*), deadline, priority level.
   - Quick preset sample prompts for fast demo presentation (*"Competitor analysis deck"*, *"Refactor authentication module"*, *"Quarterly retrospective prep"*).
   - "Translate Task with Modo AI" button with smooth loading state.

3. **`AdaptedTaskCard.tsx`:**
   - Visual output card showing:
     - Goal & Priority Badge
     - Deadline
     - Structured Micro-Steps (Checklist format)
     - Concrete Expected Output
     - **Suggested First Action** (executive dysfunction starter)
     - Original Request badge: *"Adapted by Modo based on your Work Mode preferences"*
   - Action: `[Add to My Timeline]` → invokes `useCreateTimeBlockMutation` creating corresponding `focus` TimeBlocks directly into the user's Day Timeline.

## Verification
- Verify private cards are omitted from Manager view.
- Verify task translation renders all 6 components and timeline creation works.
