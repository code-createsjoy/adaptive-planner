"""Run bounded project checks after editing source files in Antigravity."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "lib"))
from common import emit, load_config, project_root, read_payload, state_dir, touched_paths


SOURCE_SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".py"}


def run(command: list[str], cwd: Path, timeout: int) -> tuple[int, str]:
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=True if sys.platform == "win32" else False,
            check=False,
        )
        return result.returncode, (result.stdout + result.stderr).strip()
    except FileNotFoundError:
        return 0, ""
    except subprocess.TimeoutExpired:
        return 124, f"Check timed out after {timeout}s."
    except Exception as exc:
        return 1, str(exc)


def find_frontend_dir(root: Path) -> Path | None:
    for candidate in (root / "adaptive-planner-frontend", root):
        if (candidate / "package.json").exists():
            return candidate
    return None


def package_scripts(directory: Path) -> dict:
    try:
        value = json.loads((directory / "package.json").read_text(encoding="utf-8"))
        scripts = value.get("scripts") or {}
        return scripts if isinstance(scripts, dict) else {}
    except Exception:
        return {}


def main() -> None:
    payload = read_payload()
    root = project_root(payload)
    failures_file = state_dir(root) / "quality-failures.txt"

    # If this is PostInvocation, report any accumulated failures
    if "invocationNum" in payload and not payload.get("toolCall"):
        if failures_file.exists():
            try:
                failures_text = failures_file.read_text(encoding="utf-8").strip()
                if failures_text:
                    failures_file.unlink(missing_ok=True)
                    emit({
                        "injectSteps": [
                            {
                                "ephemeralMessage": f"Quality checks found issues:\n{failures_text}\nPlease fix before proceeding."
                            }
                        ]
                    })
                    return
            except Exception:
                pass
        emit({})
        return

    # PostToolUse handling
    paths = touched_paths(payload)
    if not paths or not any(path.suffix.lower() in SOURCE_SUFFIXES for path in paths):
        emit({})
        return

    failures: list[str] = []

    # 1. Python syntax check
    for path in paths:
        if path.suffix.lower() == ".py" and path.exists():
            code, output = run([sys.executable, "-m", "py_compile", str(path)], root, 15)
            if code != 0:
                failures.append(f"Python syntax error in {path.name}:\n{output[-2000:]}")

    # 2. Frontend typecheck / lint
    frontend_dir = find_frontend_dir(root)
    if frontend_dir:
        scripts = package_scripts(frontend_dir)
        has_ts = any(path.suffix.lower() in {".ts", ".tsx", ".js", ".jsx"} for path in paths)
        if has_ts and "typecheck" in scripts:
            code, output = run(["npm", "run", "typecheck", "--", "--pretty", "false"], frontend_dir, 40)
            if code != 0:
                failures.append(f"Typecheck failed:\n{output[-4000:]}")

    # 3. Optional test runner
    config = load_config(root)
    if config.get("testRunner", False) and frontend_dir:
        scripts = package_scripts(frontend_dir)
        if "test" in scripts:
            code, output = run(["npm", "test", "--", "--run"], frontend_dir, 40)
            if code != 0:
                failures.append(f"Tests failed:\n{output[-4000:]}")

    if failures:
        combined = "\n\n".join(failures)
        # Store for PostInvocation or legacy reporting
        try:
            failures_file.write_text(combined, encoding="utf-8")
        except Exception:
            pass

        # Legacy Codex format support
        if payload.get("hook_event_name"):
            emit({
                "hookSpecificOutput": {
                    "hookEventName": "PostToolUse",
                    "additionalContext": f"{combined}\nFix these issues before completion.",
                }
            })
            return

    else:
        failures_file.unlink(missing_ok=True)

    # Standard Antigravity PostToolUse response
    emit({})


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
