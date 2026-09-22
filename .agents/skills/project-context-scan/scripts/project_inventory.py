#!/usr/bin/env python3
"""Produce a fast, content-free inventory of a software project."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
from collections import Counter
from pathlib import Path


IGNORED_DIRS = {
    ".git", ".hg", ".svn", ".idea", ".vscode", ".venv", "venv",
    "node_modules", "vendor", "dist", "build", "target", "out", ".next",
    ".nuxt", ".output", ".turbo", ".cache", "coverage", "__pycache__", ".pytest_cache",
    ".mypy_cache", ".gradle", "bin", "obj",
}

MANIFEST_NAMES = {
    "package.json", "pnpm-workspace.yaml", "turbo.json", "nx.json",
    "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle",
    "settings.gradle.kts", "pyproject.toml", "requirements.txt", "Pipfile",
    "poetry.lock", "Cargo.toml", "go.mod", "Gemfile", "composer.json",
    "mix.exs", "deno.json", "deno.jsonc", "bunfig.toml",
}

DOC_NAMES = {
    "readme.md", "readme.rst", "readme.txt", "agents.md", "claude.md",
    "contributing.md", "architecture.md", "prd.md", "changelog.md",
}

ENTRYPOINT_NAMES = {
    "main.py", "app.py", "manage.py", "index.js", "index.ts", "index.tsx",
    "main.js", "main.ts", "main.tsx", "server.js", "server.ts", "program.cs",
    "application.java", "main.go", "lib.rs", "main.rs",
}

CONFIG_NAMES = {
    "dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yml",
    "compose.yaml", "makefile", "justfile", "vite.config.ts", "vite.config.js",
    "next.config.js", "next.config.mjs", "tsconfig.json", "application.yml",
    "application.yaml", "application.properties",
}


def rel(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def git_info(root: Path) -> dict[str, object]:
    def run(*args: str) -> str | None:
        try:
            result = subprocess.run(
                ["git", "-C", str(root), *args],
                capture_output=True,
                text=True,
                timeout=3,
                check=False,
            )
        except (OSError, subprocess.TimeoutExpired):
            return None
        return result.stdout.strip() if result.returncode == 0 else None

    top = run("rev-parse", "--show-toplevel")
    if top is None:
        return {"is_repository": False}
    status = run("status", "--short")
    lines = status.splitlines() if status is not None else []
    return {
        "is_repository": True,
        "root": Path(top).as_posix(),
        "branch": run("branch", "--show-current") or "(detached or unknown)",
        "dirty_paths": len(lines) if status is not None else None,
        "status_available": status is not None,
        "status_sample": lines[:20],
        "status_truncated": len(lines) > 20,
    }


def inventory(root: Path, max_files: int) -> dict[str, object]:
    extension_counts: Counter[str] = Counter()
    top_level_counts: Counter[str] = Counter()
    manifests: list[str] = []
    docs: list[str] = []
    entrypoints: list[str] = []
    configs: list[str] = []
    test_files: list[str] = []
    total = 0
    truncated = False

    for current, dirs, files in os.walk(root):
        dirs[:] = sorted(d for d in dirs if d not in IGNORED_DIRS)
        current_path = Path(current)
        for filename in sorted(files):
            path = current_path / filename
            relative = rel(path, root)
            total += 1
            if total > max_files:
                truncated = True
                break

            parts = Path(relative).parts
            top_level_counts[parts[0] if len(parts) > 1 else "(root)"] += 1
            suffix = path.suffix.lower() or "(no extension)"
            extension_counts[suffix] += 1
            lower = filename.lower()

            if filename in MANIFEST_NAMES:
                manifests.append(relative)
            if lower in DOC_NAMES:
                docs.append(relative)
            if lower in ENTRYPOINT_NAMES or lower.endswith("application.java"):
                entrypoints.append(relative)
            if lower in CONFIG_NAMES or ".github" in {part.lower() for part in parts}:
                configs.append(relative)
            if (
                "test" in {part.lower() for part in parts}
                or "tests" in {part.lower() for part in parts}
                or lower.startswith("test_")
                or ".test." in lower
                or ".spec." in lower
                or lower.endswith("test.java")
            ):
                if len(test_files) < 30:
                    test_files.append(relative)
        if truncated:
            break

    return {
        "root": root.as_posix(),
        "files_scanned": min(total, max_files),
        "truncated": truncated,
        "ignored_directories": sorted(IGNORED_DIRS),
        "top_level_file_counts": top_level_counts.most_common(20),
        "extension_counts": extension_counts.most_common(20),
        "manifests": manifests[:40],
        "documentation_and_instructions": docs[:40],
        "likely_entrypoints": entrypoints[:40],
        "runtime_and_build_config": configs[:40],
        "test_file_sample": test_files,
        "git": git_info(root),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Project root to inventory")
    parser.add_argument(
        "--max-files", type=int, default=50_000,
        help="Stop after this many files (default: 50000)",
    )
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        parser.error(f"not a directory: {root}")
    if args.max_files < 1:
        parser.error("--max-files must be positive")

    print(json.dumps(inventory(root, args.max_files), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
