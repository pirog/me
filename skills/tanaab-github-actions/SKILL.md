---
name: tanaab-github-actions
description: Guide GitHub Actions workflow authoring under the shared Tanaab coding structure.
---

# Tanaab GitHub Actions

## Overview

Use this skill for GitHub Actions workflow authoring within the Tanaab coding hierarchy.

## When to Use

- The request targets GitHub Actions workflow YAML, reusable workflows, composite actions, or CI job structure.
- The task is primarily about GitHub-hosted workflow authoring rather than general shell or application code.

## When Not to Use

- Do not use this skill for external CI providers.
- Do not use this skill alone when the actual implementation change belongs primarily to shell, Typescript, or application code.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Pair with `tanaab-shell` for shell-heavy workflow steps.
- Use `tanaab-templates` when a reusable workflow scaffold or job pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the workflow surface: workflow files, jobs, steps, permissions, triggers, and reusable workflow boundaries.
3. Apply the GitHub Actions-specific changes required by the task.
4. Pull from `tanaab-shell` or `tanaab-templates` when the workflow depends on shared shell logic or reusable scaffolds.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the GitHub Actions skill.
- [assets/tanaab-github-actions-icon.png](./assets/tanaab-github-actions-icon.png): UI icon for the GitHub Actions skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task is actually GitHub Actions-led.
- Confirm any template use came from `tanaab-templates`.
