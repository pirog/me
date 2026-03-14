---
name: tanaab-coding
description: Route coding, testing, and release requests to the right Tanaab coding skill.
---

# Tanaab Coding

## Overview

Use this skill as the umbrella router for work in the Tanaab coding stack. Select one primary owning skill, add companion skills only where the task crosses surfaces, and always apply `tanaab-coding-core`.

## When to Use

- The user asks for a coding, testing, or release task but the right specialization is not yet selected.
- The request may span multiple coding skills and needs routing.
- You need to decide whether `tanaab-javascript`, `tanaab-frontend`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-testing`, `tanaab-release`, `tanaab-documentation`, or `tanaab-templates` should also apply.

## When Not to Use

- Do not use this skill for non-coding tasks.
- Do not use this skill as the only skill when a specific coding skill is already clearly identified.

## Relationship to Other Skills

- Always apply `tanaab-coding-core` alongside this skill.
- Route into one or more specialized skills: `tanaab-javascript`, `tanaab-frontend`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-testing`, `tanaab-release`, `tanaab-documentation`.
- Use `tanaab-templates` only when the task is creating a new scaffold, standardizing a repeated shape, or extracting something clearly reusable.
- Choose one primary owner for the task before adding companions so skills reinforce one another instead of competing for the same surface.

## Workflow

1. Identify the implementation or maintenance surface: JavaScript/TypeScript, frontend, shell, GitHub Actions, testing, release, documentation, or reusable templates.
2. Activate `tanaab-coding-core`.
3. Select the primary owning skill using [references/routing-matrix.md](./references/routing-matrix.md).
4. Add companion skills only when the task crosses into their owned surfaces.
5. Activate `tanaab-templates` only when the task clearly needs reusable structure rather than an obvious local implementation.
6. If no specialized skill fits, keep work scoped to routing plus `tanaab-coding-core` and call out the gap.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the umbrella coding skill.
- [assets/tanaab-coding-icon.png](./assets/tanaab-coding-icon.png): UI icon for the coding entrypoint.
- [assets/tanaab-coding-stack-base.png](./assets/tanaab-coding-stack-base.png): shared finalized base icon used by the broader coding stack icon family.
- [assets/tanaab-coding-stack-base.svg](./assets/tanaab-coding-stack-base.svg): editable branded SVG source for the shared coding stack base icon.
- [assets/tanaab-coding-stack-source.svg](./assets/tanaab-coding-stack-source.svg): pre-watermark source art for the shared coding stack base icon.
- [references/routing-matrix.md](./references/routing-matrix.md): primary ownership rules, common routes, and collision rules for the stack.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm one primary owning skill was selected for the task.
- Confirm the selected specialized skills match the request.
- Confirm companion skills support the primary owner instead of overlapping it.
- Confirm `tanaab-templates` is only pulled in for real scaffolding, standardization, or reusable-extraction work.
