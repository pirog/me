---
name: tanaab-vue
description: Guide Vue implementation work under the shared Tanaab coding structure.
---

# Tanaab Vue

## Overview

Use this skill for Vue-specific implementation work within the Tanaab coding hierarchy.

## When to Use

- The request targets Vue components, Vue app structure, SFCs, composition APIs, or Vue tooling.
- The task needs framework-specific Vue decisions rather than generic CSS or shell guidance.

## When Not to Use

- Do not use this skill for non-Vue frontend work.
- Do not use this skill alone when the task is purely styling or purely JavaScript or TypeScript configuration.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Pair with `tanaab-javascript` for Vue codebases using JavaScript or TypeScript.
- Pair with `tanaab-css` for Vue styling work.
- Pair with `tanaab-testing` when Vue changes need focused regression coverage.
- Use `tanaab-templates` when a reusable Vue scaffold or component pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the Vue surface: components, app structure, state flow, templates, and build integration.
3. Apply the Vue-specific changes required by the task.
4. Pull from `tanaab-javascript`, `tanaab-css`, `tanaab-testing`, or `tanaab-templates` when the task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the Vue skill.
- [assets/tanaab-vue-icon.png](./assets/tanaab-vue-icon.png): UI icon for the Vue skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task actually requires Vue-specific handling.
- Confirm cross-skill handoffs are explicit when JavaScript, CSS, testing, or templates are involved.
