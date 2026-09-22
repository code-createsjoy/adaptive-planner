# Phase 4: Frontend Onboarding Wizard & 12-Question Functional Assessment UI

## Context & Objectives
Implement the calm, progressive first-time onboarding wizard that guides the user through Welcome, Journey Stage selection, private Neurodivergence Self-ID, an optional 12-question deterministic functional assessment, and the reveal of their personalized Functional Profile.

## File Ownership
- [NEW] `adaptive-planner-frontend/src/features/onboarding/OnboardingWizard.tsx`
- [NEW] `adaptive-planner-frontend/src/features/onboarding/components/WelcomeStep.tsx`
- [NEW] `adaptive-planner-frontend/src/features/onboarding/components/JourneyStageStep.tsx`
- [NEW] `adaptive-planner-frontend/src/features/onboarding/components/NeurodivergenceSelfIdStep.tsx`
- [NEW] `adaptive-planner-frontend/src/features/onboarding/components/FunctionalAssessmentStep.tsx`
- [NEW] `adaptive-planner-frontend/src/features/onboarding/components/FunctionalProfileRevealCard.tsx`
- [NEW] `adaptive-planner-frontend/src/features/onboarding/data/assessmentQuestions.ts`
- [NEW] `adaptive-planner-frontend/src/features/onboarding/api.ts`

## Detailed Implementation Steps
1. **Define Assessment Questions in `assessmentQuestions.ts`**:
   - 12 concise, accessible questions covering: Task Initiation (2), Attention Regulation (2), Time Awareness (2), Context Switching (2), Sensory Sensitivity (2), Need for Structure (1), Communication Preference (1).
2. **Build Wizard Steps**:
   - **Step 1 (Welcome)**: "Welcome to Modo · Let's make Modo work the way your mind works best." Includes "Get started" and "Set up later" options.
   - **Step 2 (Journey Stage)**: "Where are you right now?" (Studying, Looking for work, Starting a new job, Currently working, etc.).
   - **Step 3 (Neurodivergence Self-ID)**: "How would you describe your experience with neurodivergence?" (Diagnosed, Self-identified, Exploring, Neurotypical, Unsure, Prefer not to say) + optional condition tags. Clearly marked as private.
   - **Step 4 (Optional Assessment)**: "Would you like to explore your patterns?" (Start Assessment vs Skip for now).
     - Renders questions 1 at a time (e.g. "Question 4 of 12") with keyboard navigation and progress bar.
   - **Profile Reveal**: Displays scored dimensions (Attention, Initiation, Time Awareness, Sensory, etc.) with non-medical pattern callouts and medical disclaimer.
3. **Complete Onboarding Action**:
   - Persists completed profile to backend, updates user `onboardingCompleted = true` in `useAuthStore`, and transitions smoothly to Dashboard.

## Verification
```bash
cd d:/6_OJT/adaptive-planner/adaptive-planner-frontend
npm run build
```
