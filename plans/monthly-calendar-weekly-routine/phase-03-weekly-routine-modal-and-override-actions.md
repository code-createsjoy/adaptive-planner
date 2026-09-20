# Phase 03: Weekly Routine Setup Modal & Single-Day Override / Holiday Action Flows

## Deliverables
1. **Weekly Routine Modal / Drawer (`src/components/adaptive/WeeklyRoutineModal.tsx`):**
   - Manage recurring timetable template organized by Day of Week (Mon, Tue, Wed, Thu, Fri, Sat, Sun) or group toggles (Mon–Fri).
   - Add/edit routine items (`title`, `startTime`, `endTime`, `category`, `energyLevel`, `enabled`).
   - 1-click preset templates (e.g., "Standard Work & Focus Weekday").
2. **Vietnamese Holiday Banner on Day Timeline:**
   - If the active date is a Vietnamese public holiday, display a gentle celebratory card:
     - *"🇻🇳 Today is a Public Holiday: [Holiday Name]. Your regular schedule is still active."*
     - Action buttons: `[Keep Schedule]`, `[Pause Today's Routine]`, `[Customize Today]`.
   - Clicking `[Pause Today's Routine]` triggers single-day routine cancellation for this date without mutating the weekly template.
3. **Single-Day Override & Custom Task Actions:**
   - When user deletes or edits a routine task on a specific day, it saves an override (`overrideType: CANCELLED` or `MODIFIED`) for that date only.
   - Other weeks' routine remains completely untouched.
4. **End-to-End Build & Visual Polish:**
   - Run full frontend build (`npm run build`) and backend tests (`mvn test`).
   - Validate low cognitive load styling and fluid interactions.

## Verification
- User can define a routine for Mon-Fri and verify it appears across all weekdays in the month.
- User can cancel a task on a specific date (e.g. Oct 15) and confirm it disappears on Oct 15 while remaining visible on Oct 22 and Oct 8.
- User can pause routine on National Day (02/09) with 1 click.
