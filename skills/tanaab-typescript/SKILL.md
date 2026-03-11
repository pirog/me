---
name: tanaab-typescript
description: Guide Typescript implementation work under the shared Tanaab coding structure.
---

# Tanaab Typescript

## Overview

Use this skill for Typescript-specific implementation work within the Tanaab coding hierarchy.

## When to Use

- The request targets `.ts`, `.tsx`, `tsconfig`, typing, or compile-time Typescript behavior.
- The task needs Typescript structure, type-level changes, or TS-aware tooling decisions.

## When Not to Use

- Do not use this skill for styling-only work.
- Do not use this skill for shell scripts or GitHub Actions YAML unless Typescript action code is also involved.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Pair with `tanaab-vue` for Vue codebases using Typescript.
- Use `tanaab-templates` when a Typescript starter or file pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the Typescript surface: source files, config, build integration, and generated types.
3. Apply the Typescript-specific changes required by the task.
4. Pull from `tanaab-templates` only when a reusable Typescript pattern should be used.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the Typescript skill.
- [assets/tanaab-typescript-icon.png](./assets/tanaab-typescript-icon.png): UI icon for the Typescript skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task actually requires Typescript-specific handling.
- Confirm any template use came from `tanaab-templates`.
