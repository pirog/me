---
name: tanaab-coding-core
description: Apply the shared engineering doctrine for all tasks in the Tanaab coding stack.
---

# Tanaab Coding Core

## Overview

Use this skill as the universal engineering doctrine for all tasks in the Tanaab coding stack.

## When to Use

- Apply this skill to every task in the Tanaab coding hierarchy.
- Use this skill whenever `tanaab-coding` or a specialized Tanaab coding skill is active.

## When Not to Use

- Do not use this skill for non-coding tasks.
- Do not treat this skill as a replacement for a language- or tool-specific skill when specialized guidance is needed.

## Relationship to Other Skills

- `tanaab-coding` should always activate this skill.
- `tanaab-javascript`, `tanaab-css`, `tanaab-vue`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-testing`, and `tanaab-release` assume this skill is active.
- `tanaab-templates` can supply reusable files that still follow this skill's doctrine.

## Coding Principles

- Make the smallest change that fully solves the task.
- Preserve external behavior and public interfaces unless the user explicitly asks for a behavior change.
- Keep one clear source of truth for configuration, generated artifacts, and workflow decisions.
- Prefer kebab-case for repo-authored filenames unless a tool or ecosystem requires a fixed conventional name such as `package.json`, `openai.yaml`, `SKILL.md`, `README.md`, `CHANGELOG.md`, `LICENSE`, or `Brewfile`.
- Make operational intent explicit in code, scripts, and workflows instead of relying on hidden assumptions.
- Validate the changed surface with the narrowest reliable checks first, then broaden validation when risk justifies it.
- Leave the repository easier to reason about than you found it: less drift, less duplication, and clearer boundaries.

## Engineering Philosophy

- Route by primary ownership first, then add companion skills only where the task crosses surfaces.
- Fix foundations before polish: runtime, build, test, CI, and release plumbing come before stylistic refinement.
- Treat tests, CI, release notes, and automation as product surfaces, not support work.
- Prefer deterministic, repo-local tooling and explicit configuration over magical implicit behavior.
- Promote patterns into `tanaab-templates` only after they prove reusable in real tasks.
- Make cross-skill handoffs explicit whenever one skill owns the artifact and another owns surrounding policy or integration.

## Workflow

1. Activate this skill for every task in the Tanaab coding stack.
2. Apply the shared doctrine from `## Coding Principles` and `## Engineering Philosophy` once those sections are defined.
3. Hand domain-specific implementation details to the relevant specialized skill.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the shared coding doctrine skill.
- [assets/tanaab-coding-core-icon.png](./assets/tanaab-coding-core-icon.png): UI icon for the coding-core skill.

## Validation

- Confirm this skill is active whenever a skill in the Tanaab coding stack is used.
- Confirm specialized skills are layered on top of this skill rather than replacing it.
- Confirm stack decisions follow the primary-owner model rather than splitting ownership ambiguously.
- Confirm new repo-authored files use kebab-case unless a fixed conventional filename is required by the tool or ecosystem.
