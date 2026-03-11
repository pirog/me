---
name: tanaab-css
description: Guide CSS implementation work under the shared Tanaab coding structure.
---

# Tanaab CSS

## Overview

Use this skill for CSS-specific implementation work within the Tanaab coding hierarchy.

## When to Use

- The request targets CSS, selectors, layout, styling layers, or stylesheet organization.
- The task is primarily visual styling rather than framework structure or scripting.

## When Not to Use

- Do not use this skill for JavaScript-only work.
- Do not use this skill for shell automation or GitHub Actions workflow authoring.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Primary ownership: selectors, layout, tokens, stylesheet structure, and visual styling decisions.
- Defer framework structure to `tanaab-vue` when styling is embedded in Vue components.
- Defer JavaScript-driven behavior to `tanaab-javascript`.
- Defer visual regression or style-test policy to `tanaab-testing`.
- Pair with `tanaab-vue` when styling Vue components or app layouts.
- Use `tanaab-templates` when a reusable stylesheet or component pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the styling surface: files, selectors, components, and layout responsibilities.
3. Apply the CSS-specific changes required by the task.
4. Pull from `tanaab-templates` only when a reusable styling pattern should be used.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the CSS skill.
- [assets/tanaab-css-icon.png](./assets/tanaab-css-icon.png): UI icon for the CSS skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task is actually CSS-led.
- Confirm this skill stayed the primary owner only for styling surfaces.
- Confirm any template use came from `tanaab-templates`.
