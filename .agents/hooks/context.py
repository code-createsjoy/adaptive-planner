"""Inject concise project context at supported Antigravity lifecycle events."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "lib"))
from common import emit, get_session_id, load_config, project_root, read_payload, state_dir


DEV_RULES = "Repository rules: YAGNI, KISS, deterministic rendering, verify before completion."


def language_context(config: dict) -> str:
    language = config.get("language") or {}
    parts: list[str] = []
    if language.get("conversation"):
        parts.append(f"Respond to the user in {language['conversation']}.")
    if language.get("files"):
        parts.append(f"Write code and documentation in {language['files']} unless the user requests otherwise.")
    return " ".join(parts)


def compact_reminder(payload: dict, config: dict, root: Path) -> str:
    mode = config.get("cavemanMode") or {}
    if mode.get("enabled", True) is False:
        return ""
    session_id = get_session_id(payload)
    counter = state_dir(root) / f"tool-count-{session_id}.txt"
    try:
        count = int(counter.read_text(encoding="utf-8").strip())
    except Exception:
        return ""
    thresholds = mode.get("threshold") or {}
    red = int(thresholds.get("red", 100))
    orange = int(thresholds.get("orange", 50))
    if count >= red:
        return f"Context pressure is high after {count} local tool calls; keep responses terse and plan before editing."
    if count >= orange:
        return f"Consider compacting or concluding active task at the next phase boundary ({count} local tool calls)."
    return ""


def main() -> None:
    payload = read_payload()
    root = project_root(payload)
    config = load_config(root)
    language = language_context(config)

    parts: list[str] = [DEV_RULES]
    if language:
        parts.append(language)

    last_state = state_dir(root) / "last-state.md"
    if last_state.exists():
        try:
            text = last_state.read_text(encoding="utf-8").strip()
            if text:
                parts.append(f"Previous lifecycle state: {text[:800]}")
        except Exception:
            pass

    reminder = compact_reminder(payload, config, root)
    if reminder:
        parts.append(reminder)

    full_message = " ".join(part for part in parts if part)

    # Legacy Codex support
    event = payload.get("hook_event_name")
    if event:
        emit({
            "hookSpecificOutput": {
                "hookEventName": event,
                "additionalContext": full_message,
            }
        })
        return

    # Antigravity format (PreInvocation)
    emit({
        "injectSteps": [
            {
                "ephemeralMessage": full_message
            }
        ]
    })


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
