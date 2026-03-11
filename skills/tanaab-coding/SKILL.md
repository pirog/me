---
name: tanaab-coding
description: Route coding, testing, and release requests to the right Tanaab coding skill.
---

# Tanaab Coding

## Overview

Use this skill as the umbrella router for work in the Tanaab coding stack. Select the right specialized skill and always apply `tanaab-coding-core`.

## When to Use

- The user asks for a coding, testing, or release task but the right specialization is not yet selected.
- The request may span multiple coding skills and needs routing.
- You need to decide whether `tanaab-javascript`, `tanaab-css`, `tanaab-vue`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-testing`, `tanaab-release`, or `tanaab-templates` should also apply.

## When Not to Use

- Do not use this skill for non-coding tasks.
- Do not use this skill as the only skill when a specific coding skill is already clearly identified.

## Relationship to Other Skills

- Always apply `tanaab-coding-core` alongside this skill.
- Route into one or more specialized skills: `tanaab-javascript`, `tanaab-css`, `tanaab-vue`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-testing`, `tanaab-release`.
- Use `tanaab-templates` when reusable scaffolding or boilerplate files are needed.

## Workflow

1. Identify the implementation or maintenance surface: JavaScript/TypeScript, CSS, Vue, shell, GitHub Actions, testing, release, or reusable templates.
2. Activate `tanaab-coding-core`.
3. Activate the specialized coding skill or skills that match the request.
4. Activate `tanaab-templates` if reusable template files are needed.
5. If no specialized skill fits, keep work scoped to routing plus `tanaab-coding-core` and call out the gap.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the umbrella coding skill.
- [assets/tanaab-coding-icon.png](./assets/tanaab-coding-icon.png): UI icon for the coding entrypoint.
- [assets/tanaab-coding-stack-base.png](./assets/tanaab-coding-stack-base.png): shared finalized base icon used by the broader coding stack icon family.
- [assets/tanaab-coding-stack-base.svg](./assets/tanaab-coding-stack-base.svg): editable branded SVG source for the shared coding stack base icon.
- [assets/tanaab-coding-stack-source.svg](./assets/tanaab-coding-stack-source.svg): pre-watermark source art for the shared coding stack base icon.
- [references/legacy-skill-migration.md](./references/legacy-skill-migration.md): proposed consolidation path from legacy skills into the coding stack.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the selected specialized skills match the request.
- Confirm `tanaab-templates` is only pulled in when templates are actually needed.
