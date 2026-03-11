---
name: tanaab-shell
description: Guide shell scripting and command-line automation under the shared Tanaab coding structure.
---

# Tanaab Shell

## Overview

Use this skill for shell scripting and command-line automation within the Tanaab coding hierarchy.

## When to Use

- The request targets shell scripts, command wrappers, terminal automation, or scripting glue.
- The task is primarily about shell behavior rather than Typescript, CSS, or Vue implementation.

## When Not to Use

- Do not use this skill for non-shell application logic.
- Do not use this skill for GitHub Actions workflow structure unless the change is specifically shell-step logic.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Pair with `tanaab-github-actions` when workflow steps depend on shell scripts.
- Use `tanaab-templates` when a reusable script scaffold or shell snippet should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the shell surface: script entrypoint, environment, portability, and execution context.
3. Apply the shell-specific changes required by the task.
4. Pull from `tanaab-templates` only when a reusable shell scaffold should be used.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the shell skill.
- [assets/tanaab-shell-icon.png](./assets/tanaab-shell-icon.png): UI icon for the shell skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task is actually shell-led.
- Confirm any template use came from `tanaab-templates`.
