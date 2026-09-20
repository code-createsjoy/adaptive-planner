# Phase 04: End-to-End Verification & Edge Cases

**Parent Plan:** [plans/smart-default-adaptation/plan.md](file:///d:/6_OJT/adaptive-planner/plans/smart-default-adaptation/plan.md)  
**Spec Stories:** [P1], [P2]  

---

## 1. Goal
Validate end-to-end functionality, decision scoring fidelity across diverse edge cases (e.g. evening conflicts, bedtime defense, deadline vs priority trade-offs), and transactional rollback consistency.

---

## 2. Test Cases & Verification Matrix

| Test ID | Scenario | Expected Behavior |
| :--- | :--- | :--- |
| **TC-01** | Urgent meeting overlapping `PROTECTED` Dinner and `NORMAL` Study | Dinner is preserved/shifted to safe hour; Study is scheduled in tomorrow's calm opening. Explanation cites Protected Dinner. |
| **TC-02** | `NORMAL` task with deadline tonight vs `HIGH` task with deadline next week | Task with tonight's deadline is preserved; task with distant deadline is deferred. |
| **TC-03** | Task shifted late into the evening near `PROTECTED` Sleep (23:00) | Task is not pushed into sleep hours (23:00–07:00); instead it is staged in Tomorrow Inbox. |
| **TC-04** | User clicks `[ Apply this plan ]` then `[ ↩ Undo ]` within 10s | Schedule is immediately reverted to exact state prior to adaptation with zero leftover artifacts. |
| **TC-05** | User expands `▸ See alternatives` and selects Alternative 2 | Alternative 2 scenario is applied atomically to the database and reflected on Day Timeline. |

---

## 3. Automated & Manual Verification
- Run full backend integration tests (`mvn test`).
- Run frontend TypeScript verification (`npm run build`).
- Verify browser interaction with voice chime and smooth view transition.
