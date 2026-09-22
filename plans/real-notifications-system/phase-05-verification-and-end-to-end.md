# Phase 5: Verification & End-to-End Testing

**Goal**: Execute comprehensive automated testing, manual sanity verification, performance audit, and end-to-end regression validation.

---

## 1. Scope & Deliverables

1. **Automated Backend Tests**:
   - `mvn clean test` covering `NotificationControllerTest`, `NotificationServiceTest`, and all other 33+ existing backend tests.
2. **Frontend Build & Lint**:
   - `npm run build` validating clean TypeScript compilation, bundle size, and 0 runtime errors.
3. **End-to-End Sanity Scenarios**:
   - Verify unread count badge matches database count across reloads.
   - Verify timetable block countdown triggers in-app toast at configured early time.
   - Verify marking notifications as read / mark all as read works instantly.
   - Verify clicking action CTA navigates to the exact intended modal/screen.
   - Verify zero duplicate alerts on tab refocus or component rerenders.

---

## 2. Verification Gate
- 100% backend unit and integration tests PASS.
- 0 frontend build errors.
