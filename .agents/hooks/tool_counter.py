"""Count tool calls for compact reminders and session diagnostics in Antigravity."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "lib"))
from common import emit, get_session_id, project_root, read_payload, state_dir


def main() -> None:
    payload = read_payload()
    session_id = get_session_id(payload)
    root = project_root(payload)
    path = state_dir(root) / f"tool-count-{session_id}.txt"
    try:
        count = int(path.read_text(encoding="utf-8").strip()) if path.exists() else 0
    except Exception:
        count = 0
    try:
        path.write_text(str(count + 1), encoding="utf-8")
    except Exception:
        pass

    # Emit empty result as passive observer
    emit({})


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
