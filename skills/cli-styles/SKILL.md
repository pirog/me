---
name: cli-styles
description: Define and enforce consistent command-line UX and implementation patterns for developer CLIs across languages. Use when creating or updating CLI tools, bin scripts, argument parsing, help output, env var overrides, auto-detected defaults, colored logging, error handling, and exit code behavior.
---

# CLI Styles

## Build a Stable CLI Contract

Use this order of precedence for user-provided values:
1. Explicit CLI option (`--flag`)
2. Environment variable override
3. Auto-detected default

Reject ambiguous input. If a value should be option-only, reject positional arguments with a clear error message.

## Shape Help Output Consistently

Print help with this section order:
1. `Usage`
2. `Options`
3. `Environment Variables`

Show computed defaults in help output whenever possible (for example, a path discovered from repository structure).

## Logging and Exit Behavior

Write normal command output to `stdout` and failures to `stderr`.
Use non-zero exit codes for failures.
Use concise, actionable error messages.

### Color Conventions

When a shell CLI already defines terminal style helpers (for example `tty_tp`, `tty_ts`, `tty_dim`, `tty_bold`), apply them consistently to direct user-facing action/status messages without over-coloring the whole script.

- **Planned or in-progress actions**: Wrap the main verb/action in the primary action color (for example `tty_tp`).
- **Targets of those actions**: Wrap the main object, path, package list, or destination in the secondary target color (for example `tty_ts`).
- **Helper context**: Use a dim color (for example `tty_dim`) for defaults, explanatory parentheticals, or secondary context.
- **Already-completed actions**: Wrap the main past-tense verb in `tty_bold`.
- **Completed result or status**: Use `tty_green` for intended/successful results, `tty_red` for failed/unintended results, and `tty_yellow` when the outcome is uncertain or cautionary.

Keep `debug`, `usage`, and similar non-action message classes comparatively clean. Prefer color on the key verb and target, not on the entire sentence.

## Safety and Scope Guards

Add explicit guards against destructive or nonsensical self-targeting behavior.
Fail early when required paths or resources do not exist.
Return clear remediation instructions in failure messages.

## Language Notes

### .js

Use ESM bin scripts with a shebang:

```js
#!/usr/bin/env node
```

Prefer `colorette` for style-consistent terminal output.
Prefer a single logging helper using `node:util` (`format`, `inspect`) instead of direct `console.*` usage.
Prefer `node:fs/promises` for async file operations and `realpath()` for robust path comparisons.

For repository-aware defaults (for example docs root):
1. Discover project search root from `.git` or `package.json`
2. Recursively scan for marker directories (for example `.vitepress`)
3. Ignore large/unrelated directories (for example `node_modules`, `.git`)
4. Error if zero or multiple matches
5. Show the resolved default in help output

### .py

Add Python implementation notes as this style guide expands.

### .go

Add Go implementation notes as this style guide expands.

### .rs

Add Rust implementation notes as this style guide expands.
