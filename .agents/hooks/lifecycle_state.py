"""Persist lightweight Antigravity lifecycle state and session diagnostics."""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "lib"))
from common import emit, get_session_id, load_config, project_root, read_payload, state_dir


def purge_old_files(directory: Path, max_age_days: int) -> None:
    cutoff = time.time() - max(max_age_days, 1) * 86400
    for path in directory.iterdir():
        try:
            if path.is_file() and path.stat().st_mtime < cutoff:
                path.unlink()
        except OSError:
            continue


def main() -> None:
    payload = read_payload()
    root = project_root(payload)
    directory = state_dir(root)
    config = load_config(root)

    # Purge old session files
    try:
        purge_old_files(directory, int(config.get("compactDay", 3)))
    except Exception:
        pass

    session_id = get_session_id(payload)
    event = str(payload.get("hook_event_name") or "Stop")

    state = {
        "event": event,
        "conversationId": session_id,
        "workspacePaths": payload.get("workspacePaths") or [str(root)],
        "terminationReason": payload.get("terminationReason", "completed"),
        "saved_at": int(time.time()),
    }
    try:
        (directory / "last-state.md").write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass

    # Check if Stop should continue or stop
    emit({"decision": "stop"})


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
