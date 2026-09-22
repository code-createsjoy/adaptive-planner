# Brainstorm: MVP Authless Access & Re-usable Profile Assessment

**Date:** 2026-09-22

## Ideas Explored
1. **Mandatory Auth Flow (Status Quo)**: Require login/signup before opening dashboard. Adds friction for quick MVP trial and testing.
2. **Client-Only LocalStorage**: Store assessment and profile solely in browser localStorage without backend database integration. Dismissed because it breaks backend AI insights and workload analysis.
3. **Default User / Session-Bypass with Profile Re-assessment (Selected - Hướng 1)**: Bypass the login wall by binding to a persistent default user profile in local development/MVP mode. The initial onboarding assessment is optional/skippable, and the exact same assessment wizard is accessible from the Profile screen with pre-filled previous answers.

## User's Direction
- For MVP, do not force registration/login. Users should access the core planner immediately.
- Preserve the onboarding assessment test flow for initial profiling.
- In the User Profile screen, provide a "Thiết lập profile" (Setup Profile) option that re-opens the existing assessment questions (pre-filled with previously chosen answers) so users can update their preferences easily without a separate test interface.

## Open Questions
- Default user provisioning: Ensure backend automatically seeds/provides a default user (`id=1`, `email: guest@adaptive.local`) if none exists.
- Profile pre-fill: Fetch existing functional profile and answers when launching the assessment wizard from Profile settings.

## Risks
- Multi-user data collision if used in a shared deployed demo without distinct sessions (mitigated by retaining the underlying auth architecture so it can be re-enabled later).
