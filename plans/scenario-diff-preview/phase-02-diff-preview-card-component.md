# Phase 2: Scenario Diff Preview Card Component (`ScenarioDiffPreviewCard.tsx`)

**Goal:** Implement the visual Diff Preview Card and Full Timeline Dialog.

---

## Technical Details

### File: `src/components/adaptive/ScenarioDiffPreviewCard.tsx`

1. **Header & Context:**
   - Scenario Title & Badge (`⚡ Gợi ý tối ưu`, `Dời về sau`, `Rút ngắn`).
   - Short rationale / summary from scenario (`scenario.description` or explanation).

2. **Diff Items List:**
   - Card for each affected item:
     - Activity title + detail/location.
     - `Old Time ➡️ New Time` (e.g., `19:30 – 22:00 ➡️ 20:15 – 22:15`).
     - Badge pills:
       - `➕ Mới thêm` (Emerald)
       - `⏳ Dời lùi +45m` (Amber)
       - `⏩ Dời sớm -30m` (Blue)
       - `⚡ Rút ngắn -30m` (Violet)
       - `📥 Hoãn sang ngày mai` (Rose)
       - `🛡️ Giữ nguyên / Bảo vệ` (Sky)

3. **Action Footers:**
   - Large primary button: `⚡ Áp dụng phương án này (Apply changes)`.
   - Secondary link/button: `🔍 Xem toàn bộ timeline cả ngày`.

4. **Full Timeline Modal (`ScenarioFullTimelineModal`):**
   - Renders a complete 24h timeline preview for the entire day with the scenario applied.

---

## Verification
- Visual inspection with various scenario configurations.
- Button triggers fire correct callbacks.
