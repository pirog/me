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
- The repository serves or distributes a shell entrypoint from a hosted URL and the generated `dist/` artifact is part of the product surface.

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
3. When the task touches a command-line interface, apply the shared CLI contract from [../tanaab-coding-core/references/cli-style-rules.md](../tanaab-coding-core/references/cli-style-rules.md).

- Use the shared rules for help section order, option > env > default precedence, repeatable options, env-var documentation, status coloring, and stdout or stderr behavior.
- Reject ambiguous input.
- If a value should be option-only, reject positional arguments with a clear error message.
- For hosted shell repos, also apply [references/hosted-script-conventions.md](./references/hosted-script-conventions.md) so the generated `dist/` entrypoint, hosted URL, and docs remain aligned.

4. Add safety and scope guards.

- Add explicit guards against destructive or nonsensical self-targeting behavior.
- Fail early when required paths or resources do not exist.
- Return clear remediation instructions in failure messages.

5. Apply shell-specific implementation details.

- Keep shell entrypoints explicit about interpreter and execution context.
- Prefer kebab-case for new repo-authored shell and helper filenames unless the surrounding tool expects a fixed conventional name.
- When shell wrappers invoke repo-authored JavaScript CLI helpers, prefer Bun-backed entrypoints over calling `node` directly.
- For releasable shell CLIs that may be stamped by `prepare-release-action`, keep one top-level `SCRIPT_VERSION=...` assignment with fallback logic so `version-injector --style sh` can update the entrypoint in place.
- For URL-served shell repos, let [references/hosted-script-conventions.md](./references/hosted-script-conventions.md) define the `dist/`, hosting, and docs contract instead of restating it inline here.
- Preserve portability requirements when the repository already targets multiple shells or environments.
- When a composite action or wrapper script depends on shell execution, pass required environment variables explicitly rather than assuming inheritance.
- Run targeted `shellcheck` on changed shell scripts or reusable shell helpers before finishing.
- Treat `shellcheck` as runtime-agnostic: install or invoke it using whatever toolchain the repository naturally uses instead of assuming Bun is present.
- Use inline `shellcheck` disables only when the warning is understood, the pattern is intentional, and the disable is scoped narrowly with a short reason.

6. Pull from `tanaab-javascript`, `tanaab-testing`, `tanaab-github-actions`, `tanaab-release`, or `tanaab-templates` when the task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the shell skill.
- [assets/tanaab-shell-icon.png](./assets/tanaab-shell-icon.png): UI icon for the shell skill.
- [../tanaab-coding-core/references/cli-style-rules.md](../tanaab-coding-core/references/cli-style-rules.md): shared CLI help, color, and status-line rules used across shell and Bun CLIs.
- [references/hosted-script-conventions.md](./references/hosted-script-conventions.md): conventions for URL-served shell entrypoints, generated `dist/` surfaces, and static hosting defaults.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task is actually shell-led.
- Confirm this skill stayed the primary owner only for shell or CLI-contract surfaces.
- Confirm any CLI contract follows the shared rules in [../tanaab-coding-core/references/cli-style-rules.md](../tanaab-coding-core/references/cli-style-rules.md).
- Confirm shell entrypoints stay explicit about interpreter and execution context.
- Confirm releasable shell CLI entrypoints expose a single injection-friendly `SCRIPT_VERSION` assignment plus fallback logic, or an explicitly aligned equivalent, when `prepare-release-action` style version stamping is in scope.
- Confirm hosted shell repos follow [references/hosted-script-conventions.md](./references/hosted-script-conventions.md) when that surface changed.
- Confirm changed shell scripts or reusable shell helpers were checked with `shellcheck` when shell is a meaningful surface in the task.
- Confirm failures are actionable and non-zero.
- Confirm destructive or nonsensical target combinations are rejected early.
- Confirm any template use came from `tanaab-templates`.
