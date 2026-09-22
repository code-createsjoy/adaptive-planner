# Plan: Peer-to-Peer Chat & Interactive Social Scheduling

Mode: --fast
Risk: normal — Multi-file UI components and client Zustand store with timeline auto-sync; no backend schema or auth modifications.

## Overview
Implement an interactive Peer-to-Peer Chat view with built-in social scheduling. Users can add friends by Gmail, chat 1-1, send meeting invitations with rich cards, and accept/decline invites that instantly create `social` category TimeBlocks on their adaptive calendar. A quick account switcher widget enables seamless 2-way presentation demo between `Thai` and `Minh`.

## Phase Breakdown

- [x] **Phase 1:** [phase-01-state-and-models.md](./phase-01-state-and-models.md) — Define TypeScript interfaces and Zustand store (`useP2PChatStore`) with mock contacts, message history, invitation state, and demo account switching.
- [x] **Phase 2:** [phase-02-ui-components.md](./phase-02-ui-components.md) — Build `FriendsChatView`, `FriendListPane`, `ChatConversationPane`, `ScheduleInviteCard`, `InviteScheduleModal`, and `AddFriendModal`.
- [x] **Phase 3:** [phase-03-integration-and-calendar-sync.md](./phase-03-integration-and-calendar-sync.md) — Integrate into `AdaptiveApp.tsx` sidebar navigation, wire up calendar `TimeBlock` auto-creation on invitation acceptance, and verify persona switching.

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-23 00:06
**Phase in progress:** Complete
**Status:** All 3 phases implemented and verified passing in browser subagent.

### Decisions made this session
- Created persistent client-side Zustand store `useP2PChatStore` with demo mock personas (`Thai`, `Minh`, `Lan`), seed conversation, and quick persona toggle.
- Built interactive `ScheduleInviteCard` with calendar conflict checking and timeline auto-sync on `Accept & Sync`.
- Added `👥 Friends & Chat` navigation tab with unread badge counter in desktop sidebar and mobile navigation.

### Next immediate action
- Ready for user presentation and demo.
