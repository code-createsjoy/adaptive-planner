# Antigravity Repository Support & Customizations

Thư mục `.agents/` chứa toàn bộ cấu hình **Antigravity Customization System** cho dự án này, bao gồm:
- **Skills** (`.agents/skills/`): Các kỹ năng hỗ trợ quy trình công việc chuyên biệt (brainstorm, cook, plan, fix, code-review, git-sync,...).
- **Lifecycle Hooks** (`.agents/hooks.json` & `.agents/hooks/`): Các hook tự động can thiệp vào vòng đời hoạt động của Antigravity Agent.

---

## 1. Lifecycle Hooks (`hooks.json`)

Cấu hình các bộ lắng nghe sự kiện vòng đời:

1. **`context-injector` (`PreInvocation`)**:
   - Tự động nạp quy tắc phát triển (`DEV_RULES`), cấu hình ngôn ngữ, cảnh báo áp lực context và trạng thái phiên trước đó (`last-state.md`) trước khi model xử lý yêu cầu.

2. **`privacy-guard` (`PreToolUse`)**:
   - Chặn các thao tác cố ý đọc, chỉnh sửa hoặc thực thi lệnh liên quan đến file nhạy cảm (`.env`, private keys, secrets, credentials, id_rsa,...) trong các tool `write_to_file`, `replace_file_content`, `view_file`, `run_command`.

3. **`tool-counter` (`PreToolUse`)**:
   - Đếm số lượng tool call trong phiên làm việc để phục vụ cảnh báo context pressure.

4. **`quality-checker` (`PostToolUse`, `PostInvocation`)**:
   - Tự động kiểm tra cú pháp Python (`py_compile`), TypeScript / ESLint khi các file nguồn được chỉnh sửa, cảnh báo kịp thời nếu xuất hiện lỗi build/typecheck.

5. **`lifecycle-manager` (`Stop`)**:
   - Lưu trữ trạng thái phiên làm việc vào `session-data/last-state.md` khi tác vụ hoàn thành và dọn dẹp các file phiên làm việc cũ.

---

## 2. Kiểm thử và vận hành

Tất cả các script trong `.agents/hooks/` nhận dữ liệu context JSON qua **stdin** và xuất kết quả chuẩn qua **stdout** theo hợp đồng của Antigravity Hooks.
