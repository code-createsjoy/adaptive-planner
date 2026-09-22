---
name: project-context-scan
description: "Rapidly build an evidence-backed mental model of an unfamiliar or recently changed codebase. Use this skill whenever the user asks to scan, inspect, onboard to, summarize, understand, map, or get context on a project/repository before planning, debugging, reviewing, or implementing—even if they only say ‘check this repo’, ‘what is this project?’, ‘đọc qua project’, or ‘nắm context codebase’."
---

# Project Context Scan

Build a useful mental model of a repository quickly without pretending to have read the entire codebase. Start broad, follow high-signal paths, and attach evidence to important conclusions.

## Operating principles

- Stay read-only unless the user separately asks for changes.
- Prefer repository evidence over assumptions based on framework conventions.
- Separate **facts**, **inferences**, and **unknowns**. A filename alone is weak evidence.
- Optimize for information gain: manifests, instructions, entrypoints, boundaries, and representative flows matter more than exhaustive file reading.
- Respect the nearest applicable `AGENTS.md` or equivalent repository instructions before inspecting files in that scope.
- Preserve privacy. Do not open `.env`, credential stores, private keys, tokens, or obvious secret files. Environment examples may be inspected, but report variable names only—never values.
- Do not install dependencies, start services, run builds/tests/migrations, or use the network during a context scan unless the user explicitly asks.
- Write the report in the user's language unless they request another language.

## Choose the scan shape

Infer the narrowest useful shape from the request:

- **Overview scan**: the user wants to understand the whole project. Map major components and trace one representative end-to-end path.
- **Task-focused scan**: the user mentions a feature, bug, file, or intended change. Map the repository briefly, then spend most of the budget tracing that concern and its tests.
- **Refresh scan**: prior context exists but the repository changed. Inspect Git state and changed files first, then update only affected parts of the mental model.

If the user gives no scope, use an overview scan. Do not stop for clarification unless multiple repository roots make the target genuinely ambiguous.

## Workflow

### 1. Establish scope and rules

1. Resolve the working directory and, when available, the Git root.
2. Find repository instruction files (`AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, or local equivalents). Read every instruction file applicable to the files you will inspect.
3. Check `git status --short` and the current branch when Git is available. Treat all existing changes as user work; never modify or clean them during the scan.
4. State the chosen scan shape and any explicit boundary, such as a subproject or feature.

### 2. Build a bounded inventory

Run the bundled inventory helper first when Python is available:

```bash
python <skill-directory>/scripts/project_inventory.py --root <project-root>
```

The helper reads names and metadata, not file contents. If it cannot run, use `rg --files` plus shallow directory listings. Exclude generated/vendor/cache directories such as `.git`, `node_modules`, `dist`, `build`, `target`, `.next`, `.venv`, and coverage output.

Use the inventory to identify:

- repository shape: single app, monorepo, library, service collection, or infrastructure repo;
- languages and frameworks, confirmed by manifests/configuration;
- major components and likely ownership boundaries;
- likely entrypoints, documentation, tests, CI/CD, containers, database/schema, and planning artifacts.

### 3. Read high-signal files

Read in this order, stopping when additional files no longer change the model materially:

1. applicable repository instructions;
2. root README/product docs and workspace manifests;
3. component manifests and primary runtime configuration;
4. application entrypoints, routing/API registration, and dependency wiring;
5. one representative domain flow and its nearest tests;
6. task-relevant changed files or active plans, when applicable.

Default budget: about 15 high-signal files or 4,000 lines, whichever comes first. This is a heuristic, not a quota. Exceed it only when the repository is a monorepo or a claim cannot otherwise be verified. Prefer targeted searches and partial reads over dumping large files.

### 4. Trace behavior, not just folders

For an overview scan, trace one important vertical slice:

```text
entrypoint/UI or API -> state/controller -> domain/service -> persistence/external boundary -> test
```

For a task-focused scan, trace the user-mentioned behavior instead. Record where data enters, where decisions happen, where side effects occur, and how the behavior is verified. If a link is inferred rather than observed, label it as an inference.

### 5. Cross-check the model

Before reporting:

- confirm framework and version claims from manifests or lock/config files;
- confirm run/test commands from scripts, build files, CI, or docs;
- compare documented architecture with actual entrypoints and dependencies;
- note dirty worktree changes that may make documentation stale;
- avoid claiming a feature is complete merely because files or plans exist;
- cite important claims with repository-relative `path:line` evidence when line numbers are practical.

## Report format

Keep the report compact enough to use as working context. Use this structure:

```markdown
# Project context: <name>

## 30-second summary
<what it is, who/what it serves, and its current shape>

## Architecture map
<major components and how they connect; use a tiny tree or flow only if useful>

## Runtime and data flow
<entrypoints, representative vertical slice, persistence/external systems>

## Developer workflow
<verified install/run/test/build commands and important conventions>

## Current working state
<branch, dirty areas, active plans, and what appears in progress>

## Risks and unknowns
<uncertainties, conflicting evidence, missing docs/tests/config>

## Best next reads
<3-7 files, each with one reason>
```

For a task-focused scan, add `## Task impact map` before risks with likely files, tests, and dependency edges. Omit empty sections. End with a one-sentence readiness statement: what is understood well enough to do next, and what still needs verification.

## Quality bar

A successful scan lets another agent begin useful work without rescanning the whole repository. It should:

- identify the actual component boundaries and runtime entrypoints;
- explain at least one real execution/data path;
- surface repository-specific instructions and verified commands;
- acknowledge uncommitted work without overwriting or attributing it;
- make uncertainty visible;
- stay concise and evidence-backed.

## Common failure modes

- **File-tree narration**: listing directories without explaining behavior. Trace a flow instead.
- **Manifest overconfidence**: dependencies show capability, not necessarily active use. Verify imports/wiring.
- **README parroting**: documentation may lag. Cross-check it against code and Git state.
- **Secret exposure**: never inspect or reproduce secret values.
- **Unbounded archaeology**: stop once the model supports the requested next action; list deeper reads as recommendations.
