---
name: tanaab-coding
description: Route coding requests to the right Tanaab coding skill.
---

# Tanaab Coding

## Overview

Use this skill as the umbrella router for Tanaab coding work. Select the right specialized skill and always apply `tanaab-coding-core`.

## When to Use

- The user asks for a coding task but the language, framework, or tool specialization is not yet selected.
- The request may span multiple coding skills and needs routing.
- You need to decide whether `tanaab-typescript`, `tanaab-css`, `tanaab-vue`, `tanaab-shell`, `tanaab-github-actions`, or `tanaab-templates` should also apply.

## When Not to Use

- Do not use this skill for non-coding tasks.
- Do not use this skill as the only skill when a specific coding skill is already clearly identified.

## Relationship to Other Skills

- Always apply `tanaab-coding-core` alongside this skill.
- Route into one or more specialized skills: `tanaab-typescript`, `tanaab-css`, `tanaab-vue`, `tanaab-shell`, `tanaab-github-actions`.
- Use `tanaab-templates` when reusable scaffolding or boilerplate files are needed.

## Workflow

1. Identify the implementation surface: language, framework, build tool, styling layer, shell environment, or CI workflow.
2. Activate `tanaab-coding-core`.
3. Activate the specialized coding skill or skills that match the request.
4. Activate `tanaab-templates` if reusable template files are needed.
5. If no specialized skill fits, keep work scoped to routing plus `tanaab-coding-core` and call out the gap.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the umbrella coding skill.
- [assets/tanaab-coding-icon.png](./assets/tanaab-coding-icon.png): UI icon for the coding entrypoint.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the selected specialized skills match the request.
- Confirm `tanaab-templates` is only pulled in when templates are actually needed.
