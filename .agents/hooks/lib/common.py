"""Shared helpers for repository-local Antigravity lifecycle hooks."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


def read_payload() -> dict[str, Any]:
    """Read JSON payload passed via stdin."""
    try:
        value = json.load(sys.stdin)
        return value if isinstance(value, dict) else {}
    except Exception:
        return {}


def project_root(payload: dict[str, Any] | None = None) -> Path:
    """Determine the project root directory."""
    if payload:
        workspace_paths = payload.get("workspacePaths") or []
        if isinstance(workspace_paths, list) and workspace_paths:
            candidate = Path(workspace_paths[0]).resolve()
            if candidate.exists():
                return candidate

        cwd = payload.get("cwd")
        if cwd:
            candidate = Path(cwd).resolve()
            if candidate.exists():
                return candidate

    # Default to current directory and traverse up to git root if present
    start = Path(os.getcwd()).resolve()
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=start,
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        if result.returncode == 0 and result.stdout.strip():
            return Path(result.stdout.strip()).resolve()
    except Exception:
        pass

    for candidate in (start, *start.parents):
        if (candidate / ".git").exists() or (candidate / ".agents").exists():
            return candidate
    return start


def load_config(root: Path) -> dict[str, Any]:
    """Load configuration from .ck.json or .agents/config.json if available."""
    for config_file in (root / ".agents" / "config.json", root / ".ck.json"):
        if config_file.exists():
            try:
                value = json.loads(config_file.read_text(encoding="utf-8-sig"))
                if isinstance(value, dict):
                    return value
            except Exception:
                pass
    return {}


def state_dir(root: Path) -> Path:
    """Return path to session state directory."""
    path = root / ".agents" / "session-data"
    path.mkdir(parents=True, exist_ok=True)
    return path


def emit(value: dict[str, Any]) -> None:
    """Emit JSON response to stdout."""
    print(json.dumps(value, ensure_ascii=False))


def get_session_id(payload: dict[str, Any]) -> str:
    """Get sanitized conversation/session id from payload."""
    raw = str(
        payload.get("conversationId")
        or payload.get("session_id")
        or payload.get("sessionId")
        or "default"
    )
    return re.sub(r"[^\w\-]", "_", raw)


_PATCH_PATH_RE = re.compile(r"^\*\*\* (?:Add|Update|Delete) File:\s*(.+?)\s*$", re.MULTILINE)


def touched_paths(payload: dict[str, Any]) -> list[Path]:
    """Extract list of touched file paths from Antigravity and Codex tool calls."""
    raw_paths: list[str] = []

    # 1. Antigravity format: toolCall: {"name": "...", "args": {...}}
    tool_call = payload.get("toolCall")
    if isinstance(tool_call, dict):
        args = tool_call.get("args") or {}
        if isinstance(args, dict):
            # Targets for write_to_file, replace_file_content, multi_replace_file_content
            for key in ("TargetFile", "targetFile", "target_file", "AbsolutePath", "absolutePath", "absolute_path", "FilePath", "filePath", "file_path"):
                val = args.get(key)
                if isinstance(val, str) and val.strip():
                    raw_paths.append(val.strip())

    # 2. Codex / legacy format: tool_input: {"file_path": "...", "command": "..."}
    tool_input = payload.get("tool_input")
    if isinstance(tool_input, dict):
        for key in ("file_path", "path", "TargetFile", "AbsolutePath"):
            value = tool_input.get(key)
            if isinstance(value, str) and value.strip():
                raw_paths.append(value.strip())

        command = tool_input.get("command")
        if isinstance(command, str):
            raw_paths.extend(match.strip() for match in _PATCH_PATH_RE.findall(command))

    root = project_root(payload)
    result: list[Path] = []
    seen: set[str] = set()
    for raw in raw_paths:
        candidate = Path(raw)
        if not candidate.is_absolute():
            candidate = root / candidate
        normalized = str(candidate.resolve(strict=False)).lower()
        if normalized not in seen:
            seen.add(normalized)
            result.append(candidate)
    return result


def extract_command(payload: dict[str, Any]) -> str:
    """Extract command string from run_command or legacy tool calls."""
    # Antigravity format
    tool_call = payload.get("toolCall")
    if isinstance(tool_call, dict):
        args = tool_call.get("args") or {}
        if isinstance(args, dict):
            cmd = args.get("CommandLine") or args.get("commandLine") or args.get("command")
            if isinstance(cmd, str):
                return cmd

    # Legacy format
    tool_input = payload.get("tool_input")
    if isinstance(tool_input, dict):
        cmd = tool_input.get("command") or tool_input.get("CommandLine")
        if isinstance(cmd, str):
            return cmd

    return ""
