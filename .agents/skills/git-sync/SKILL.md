---
name: git-sync
description: "Git workflow manager for pulling, committing, and pushing code to GitHub repositories safely and effectively. Enforces Conventional Commits with concise, meaningful messages. Use whenever the user asks to pull code, push code, commit changes, sync with GitHub, or mentions phrases like 'push code', 'pull code', 'commit code', 'git push', 'git pull', 'đẩy code', 'lấy code mới', 'tạo commit', 'đồng bộ repo', 'gửi code lên github', 'sync git', 'push git'."
---

# Git Sync — Smart Git Workflow & Conventional Commit Skill

Automates and standardizes the process of `git pull`, `git add`, `git commit`, and `git push` while maintaining strict commit quality, branch safety, conflict prevention, and repository integrity.

---

## 🛠️ Modes of Operation

Activate the appropriate mode based on user intent or flags:

| Mode | Trigger Phrases / Flags | Primary Actions |
| :--- | :--- | :--- |
| **Commit Only** | `--commit`, "tạo commit", "commit code", "commit changes" | Inspect diff $\rightarrow$ Generate Conventional Commit $\rightarrow$ Stage & Commit locally. |
| **Pull Only** | `--pull`, "lấy code mới", "pull code", "update repo" | Stash dirty changes $\rightarrow$ `git pull --rebase` $\rightarrow$ Restore stash. |
| **Push Only** | `--push`, "đẩy code", "push code", "gửi lên github" | Verify upstream branch $\rightarrow$ Safety check $\rightarrow$ `git push origin <branch>`. |
| **Full Sync** *(Default)* | `--sync`, "đồng bộ repo", "sync code", "pull push code" | Safe Pull $\rightarrow$ Stage Changes $\rightarrow$ Generate Commit $\rightarrow$ Safe Push. |

---

## 🔒 Step-by-Step Execution Guide

### 1. Pre-Execution Inspection
Always begin by checking repo status and active branch:
```powershell
git status -sb
git branch --show-current
```
- Identify whether the working tree has untracked (`??`), modified (`M`), deleted (`D`), or staged (`A`) files.
- Note the current branch name.

---

### 2. Safe Pull Workflow
If the action includes pulling remote changes:
1. **Check for uncommitted changes**:
   - If working tree is dirty:
     ```powershell
     git stash push -m "temp-pre-pull-stash"
     ```
2. **Pull remote changes using rebase**:
   ```powershell
   git pull --rebase origin <current-branch>
   ```
3. **Restore stashed changes** (if stashed):
   ```powershell
   git stash pop
   ```
4. **Conflict Check**: If conflict occurs during `git stash pop` or `git pull`, immediately list conflicted files and help the user resolve them before continuing.

---

### 3. Smart Staging & Conventional Commit
When preparing a commit:

1. **Review Diffs**:
   ```powershell
   git diff --stat
   ```
2. **Stage Files**:
   - Stage all appropriate changes: `git add .` (or specific files if user requested a partial commit).
   - Verify sensitive files (e.g. `.env`, credentials, local caches) are ignored in `.gitignore`.
3. **Generate Commit Message**:
   Follow strict **Conventional Commits** standard:
   ```text
   <type>(<scope>): <ngắn gọn, tóm tắt thay đổi chính>

   - <Chi tiết hành động 1>
   - <Chi tiết hành động 2>
   ```

#### Commit Types:
- `feat`: Tính năng mới hoặc mở rộng chức năng.
- `fix`: Sửa lỗi bug, hiển thị sai, issue logic backend/frontend.
- `refactor`: Tái cấu trúc mã nguồn (không đổi tính năng bên ngoài).
- `docs`: Thêm/sửa tài liệu, README, tài liệu kế hoạch/spec.
- `style`: Định dạng code, căn chỉnh giao diện CSS/UI mà không đổi logic.
- `perf`: Tối ưu hiệu năng, giảm thời gian render, tối ưu query.
- `test`: Thêm hoặc chỉnh sửa test suites/unit tests.
- `chore`: Cấu hình build, dependencies, tooling, script, gitignore.

#### Commit Example:
```text
feat(calendar): thêm hiển thị lịch công tác và sự kiện định kỳ

- Tích hợp MonthlyCalendar component với holiday indicators
- Cập nhật WeeklyRoutine controller và unit tests tương ứng
```

4. **Execute Commit**:
   ```powershell
   git commit -m "<header>" -m "<body>"
   ```

---

### 4. Safe Push Workflow
When pushing to GitHub:

1. **Upstream Verification**:
   Check if the current branch has an upstream set:
   ```powershell
   git push -u origin <current-branch>
   ```
2. **Branch Protection Warning**:
   - If committing directly to `main` / `master` / `production`, inform the user or confirm if they prefer pushing directly or creating a feature branch.
3. **No Force Push Rule**:
   - ⚠️ **NEVER** use `git push --force` or `-f` unless explicitly requested and confirmed by the user.

---

## ⚡ Quick Decision Checklist

- [ ] Working tree checked with `git status -sb`
- [ ] Safe stash applied before pulling if local modifications exist
- [ ] Meaningful Conventional Commit header $\le 72$ chars
- [ ] Bullet points clearly describe high-impact changes
- [ ] Pushed to correct remote branch with `-u origin <branch>`
