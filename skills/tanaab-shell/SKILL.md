---
name: tanaab-shell
description: Guide shell scripting, command-line automation, and CLI contract work under the shared Tanaab coding structure.
---

# Tanaab Shell

## Overview

Use this skill for shell scripting, command-line automation, and CLI contract work within the Tanaab coding hierarchy.

## When to Use

- The request targets shell scripts, command wrappers, terminal automation, or scripting glue.
- The task is primarily about shell behavior, CLI contract, help output, logging, or safety guards rather than JavaScript, CSS, or Vue implementation.

## When Not to Use

- Do not use this skill for non-shell application logic.
- Do not use this skill for GitHub Actions workflow structure unless the change is specifically shell-step logic.
- Do not use this skill when the request is primarily about runtime migration, test policy, or changelog writing rather than shell or CLI behavior.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Primary ownership: shell scripts, direct command execution, wrapper behavior, CLI contract, help output, logging conventions, and shell safety guards.
- Defer JavaScript or TypeScript implementation details to `tanaab-javascript`.
- Defer workflow YAML, triggers, permissions, and job structure to `tanaab-github-actions`.
- Defer test-scope and coverage-policy decisions to `tanaab-testing`.
- Defer changelog and release-note writing to `tanaab-release`.
- Pair with `tanaab-github-actions` when workflow steps depend on shell scripts.
- Pair with `tanaab-javascript` when a CLI is implemented in JavaScript but needs shell-facing UX and wrapper guidance.
- Pair with `tanaab-testing` when CLI behavior needs focused regression coverage.
- Pair with `tanaab-release` when release automation is shell-driven.
- Use `tanaab-templates` when a reusable script scaffold or shell snippet should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the shell surface: script entrypoint, environment, portability, execution context, and whether the task also defines a CLI contract.
3. Build a stable CLI contract when the task touches a command-line interface.
- Use this precedence order for user-provided values: explicit CLI option, environment variable override, auto-detected default.
- Reject ambiguous input.
- If a value should be option-only, reject positional arguments with a clear error message.
4. Shape help output consistently when the tool exposes help text.
- Print help sections in this order: `Usage`, `Options`, `Environment Variables`.
- Wrap `Options` and `Environment Variables` section headers in the `tp` style when Tanaab terminal color helpers exist.
- Show computed defaults in help output whenever possible.
5. Standardize logging and exit behavior.
- Write normal command output to `stdout`.
- Write failures to `stderr`.
- Use non-zero exit codes for failures.
- Keep error messages concise and actionable.
- When terminal style helpers such as `tty_tp`, `tty_ts`, `tty_dim`, `tty_bold`, `tty_green`, `tty_red`, or `tty_yellow` already exist, use them consistently on the key verb or target instead of coloring whole sentences.
6. Add safety and scope guards.
- Add explicit guards against destructive or nonsensical self-targeting behavior.
- Fail early when required paths or resources do not exist.
- Return clear remediation instructions in failure messages.
7. Apply shell-specific implementation details.
- Keep shell entrypoints explicit about interpreter and execution context.
- Prefer kebab-case for new repo-authored shell and helper filenames unless the surrounding tool expects a fixed conventional name.
- When shell wrappers invoke repo-authored JavaScript CLI helpers, prefer Bun-backed entrypoints over calling `node` directly.
- Preserve portability requirements when the repository already targets multiple shells or environments.
- When a composite action or wrapper script depends on shell execution, pass required environment variables explicitly rather than assuming inheritance.
8. Pull from `tanaab-javascript`, `tanaab-testing`, `tanaab-github-actions`, `tanaab-release`, or `tanaab-templates` when the task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the shell skill.
- [assets/tanaab-shell-icon.png](./assets/tanaab-shell-icon.png): UI icon for the shell skill.
- [../tanaab-coding-core/references/cli-style-rules.md](../tanaab-coding-core/references/cli-style-rules.md): shared CLI help, color, and status-line rules used across shell and Bun CLIs.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task is actually shell-led.
- Confirm this skill stayed the primary owner only for shell or CLI-contract surfaces.
- Confirm the CLI uses explicit option > env var > auto-detected default precedence when that contract exists.
- Confirm help output exposes the right sections and surfaces computed defaults where useful.
- Confirm failures are actionable and non-zero.
- Confirm destructive or nonsensical target combinations are rejected early.
- Confirm any template use came from `tanaab-templates`.
