# Phase 2: Employee Workplace Passport UI

## Goal
Build the rich, low-stimulation, glassmorphic Workplace Passport interface ("My Work Mode") where employees customize their preferences across all 7 categories and manage granular per-card privacy.

## Target Files
- `src/features/work-mode/components/WorkplacePassportView.tsx` [NEW]
- `src/features/work-mode/components/PassportCategoryCard.tsx` [NEW]
- `src/features/work-mode/components/PrivacyBadgeSelector.tsx` [NEW]
- `src/features/work-mode/components/PrivateInsightBanner.tsx` [NEW]

## Detailed Implementation Steps
1. **`PrivacyBadgeSelector.tsx`:**
   - Dropdown/Popover selector with 3 options:
     - 🔒 `Private` (Visible only to you)
     - 👔 `Share with manager` (Visible to direct manager)
     - 👥 `Share with team` (Visible to entire team)
   - Tinted badge with distinct icon and hover explanation.

2. **`PassportCategoryCard.tsx`:**
   - Reusable card component with squircle container, category icon, title, description, and top-right `PrivacyBadgeSelector`.
   - Chip selectors for quick multi-select options (active state: tinted primary accent with checkmark).
   - Text input for custom notes / examples.
   - Expandable / collapsible for smooth progressive disclosure.

3. **`PrivateInsightBanner.tsx`:**
   - Calm AI suggestions card: *"✨ Modo noticed that you complete deep focus sessions more consistently between 9 AM and 11 AM."*
   - Interactive actions: `[Add to Passport]` (updates focus card & adds badge), `[Not now]`, `[Don't suggest this again]`.
   - Clear privacy reassuring note: *"🔒 This observation is strictly private to you. Your manager cannot see this until you approve."*

4. **`WorkplacePassportView.tsx`:**
   - Top banner: Passport introduction, privacy guarantee banner, and completion progress.
   - Grid of 7 cards: Focus, Communication, Task Preferences, Feedback, Meetings, Context Switching, Strengths.
   - Reset Demo & Export Summary actions.

## Verification
- Verify chip toggles, privacy dropdown selection, and instant state reactivity.
