# Phase 4: Navigation Integration, Role Switcher & E2E Validation

## Goal
Integrate the Work Mode feature into `AdaptiveApp.tsx` sidebar navigation, embed an interactive Role Switcher (`Thai (Employee View)` ⇄ `Manager View`), and perform end-to-end browser validation.

## Target Files
- `src/features/work-mode/components/WorkModeView.tsx` [NEW]
- `src/features/work-mode/components/RoleSwitcherWidget.tsx` [NEW]
- `src/features/work-mode/index.ts` [NEW]
- `src/components/adaptive/AdaptiveApp.tsx` [MODIFY]

## Detailed Implementation Steps
1. **`RoleSwitcherWidget.tsx`:**
   - Top banner widget with smooth animated toggle:
     - 🪪 **Employee View (Thai)**: Shows full Workplace Passport editor, chip selectors, privacy toggles, and private AI insights.
     - 👔 **Manager View**: Shows "How to Work with Thai" actionable summary, filtered by Thai's privacy settings, and the "Assign & Translate Task" tool.

2. **`WorkModeView.tsx`:**
   - Main wrapper rendering the header, role switcher, and either `WorkplacePassportView` or `ManagerWorkWithMeView` based on active role.

3. **`AdaptiveApp.tsx` Navigation Integration:**
   - Add `{ id: "work-mode", label: "Work Mode", icon: Briefcase }` (or `IdCard` / `Sparkles`) to sidebar `navigation` array.
   - Update `ViewId` type.
   - Render `<WorkModeView />` when `view === "work-mode"`.

4. **End-to-End Presentation Workflow Validation:**
   - Step 1: Open "Work Mode" from sidebar.
   - Step 2: In Employee View, customize focus block to 9:00-11:00 AM, select strengths (Deep focus, Pattern recognition), and set Communication to "Share with team".
   - Step 3: Approve the private AI insight suggestion ("Add to Passport").
   - Step 4: Toggle Role Switcher to Manager View.
   - Step 5: Verify Manager View reflects approved items and strictly hides any private items.
   - Step 6: Click "Assign & Translate Task", pick sample task *"Prepare competitor research"*, click Translate.
   - Step 7: Verify structured micro-milestones and click "Add to My Timeline".
   - Step 8: Open Day Timeline and verify the adapted task blocks appear.

## Verification
- Clean build with 0 TypeScript errors.
- Browser test recording confirming all 3 MVP flows.
