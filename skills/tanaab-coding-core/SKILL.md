---
name: tanaab-coding-core
description: Apply the shared engineering doctrine for all Tanaab coding tasks.
---

# Tanaab Coding Core

## Overview

Use this skill as the universal engineering doctrine for all Tanaab coding tasks.

## When to Use

- Apply this skill to every coding task in the Tanaab coding hierarchy.
- Use this skill whenever `tanaab-coding` or a specialized Tanaab coding skill is active.

## When Not to Use

- Do not use this skill for non-coding tasks.
- Do not treat this skill as a replacement for a language- or tool-specific skill when specialized guidance is needed.

## Relationship to Other Skills

- `tanaab-coding` should always activate this skill.
- `tanaab-typescript`, `tanaab-css`, `tanaab-vue`, `tanaab-shell`, and `tanaab-github-actions` assume this skill is active.
- `tanaab-templates` can supply reusable files that still follow this skill's doctrine.

## Coding Principles

TODO: Define coding principles.

## Engineering Philosophy

TODO: Define engineering philosophy.

## Workflow

1. Activate this skill for every Tanaab coding task.
2. Apply the shared doctrine from `## Coding Principles` and `## Engineering Philosophy` once those sections are defined.
3. Hand domain-specific implementation details to the relevant specialized skill.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the shared coding doctrine skill.
- [assets/tanaab-coding-core-icon.png](./assets/tanaab-coding-core-icon.png): UI icon for the coding-core skill.

## Validation

- Confirm this skill is active whenever a Tanaab coding skill is used.
- Confirm specialized skills are layered on top of this skill rather than replacing it.
- Leave `## Coding Principles` and `## Engineering Philosophy` at TODO until intentionally defined.
