# Phase 4: Automated Tests & Verification

**Parent Plan:** [`plans/messy-input-parser/plan.md`](file:///d:/6_OJT/adaptive-planner/plans/messy-input-parser/plan.md)  
**Spec Story:** P1/P2/Success Criteria verification

---

## Test Suite Scope

### 1. Backend JUnit Tests (`AiPlannerServiceTest.java`)
Test 20 shorthand benchmarks:
1. `8h java` $\rightarrow$ Title: Học Java / Lập trình, Start: 08:00, End: 09:00 (or 09:30), Date: Today
2. `mai 7h cafe 2 tiếng` $\rightarrow$ Title: Đi cà phê, Date: Tomorrow, Start: 07:00, End: 09:00, Duration: 120m
3. `t2 8-10h hop` $\rightarrow$ Title: Cuộc họp / Trao đổi, Date: Next Monday, Start: 08:00, End: 10:00
4. `cn 14h gym` $\rightarrow$ Title: Tập gym, Date: Next Sunday, Start: 14:00
5. `mai chiều đi bơi` $\rightarrow$ Date: Tomorrow, missingFields: `["TIME"]`
6. `tối nay xem phim 2 tiếng` $\rightarrow$ Date: Today, Start: 20:00, End: 22:00
7. `thứ 6 tuần sau làm bài tập` $\rightarrow$ Date: Next Friday
8. `22h ngủ` $\rightarrow$ Title: Nghỉ ngơi / Đi ngủ, Start: 22:00
9. `mai 3h dentist` $\rightarrow$ Title: Khám nha sĩ / Bác sĩ, Start: 15:00, Date: Tomorrow
10. `19h cafe với bạn` $\rightarrow$ Title: Đi cà phê, Start: 19:00

### 2. Verification Gate
- Run `mvn test` in `adaptive-planner-backend`.
- Run `npm run build` in `adaptive-planner-frontend`.
- Validate interactive UI in browser.
