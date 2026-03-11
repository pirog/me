---
name: tanaab-css
description: Guide SCSS-first styling work under the shared Tanaab coding structure.
---

# Tanaab CSS

## Overview

Use this skill for stylesheet implementation work within the Tanaab coding hierarchy. Prefer SCSS over raw CSS, Less, or Stylus unless the task explicitly requires another styling format.

## When to Use

- The request targets SCSS, CSS, selectors, layout, styling layers, or stylesheet organization.
- The task is primarily visual styling rather than framework structure or scripting.

## When Not to Use

- Do not use this skill for JavaScript-only work.
- Do not use this skill for shell automation or GitHub Actions workflow authoring.
- Do not choose Less or Stylus by default when SCSS would satisfy the request.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Primary ownership: selectors, layout, tokens, SCSS or stylesheet structure, and visual styling decisions.
- Defer framework structure to `tanaab-vue` when styling is embedded in Vue components.
- Defer JavaScript-driven behavior to `tanaab-javascript`.
- Defer visual regression or style-test policy to `tanaab-testing`.
- Pair with `tanaab-vue` when styling Vue components or app layouts.
- Use `tanaab-templates` when a reusable SCSS partial, stylesheet scaffold, or component styling pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the styling surface: files, selectors, components, and layout responsibilities.
3. Prefer SCSS as the default stylesheet authoring format.
- Use `.scss` for standalone stylesheets when a preprocessor is in play.
- Prefer shared variables, mixins, and nesting discipline in SCSS instead of reaching for Less or Stylus.
- Keep plain `.css` only when the task explicitly requires raw CSS or the surrounding toolchain does not support SCSS.
4. In Vue components, prefer `<style lang="scss">` when component-scoped styling is needed.
5. Pull from `tanaab-templates` only when a reusable styling pattern should be used.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the CSS skill.
- [assets/tanaab-css-icon.png](./assets/tanaab-css-icon.png): UI icon for the CSS skill.
- [references/style-preferences.md](./references/style-preferences.md): default stylesheet format preferences for SCSS-first styling.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task is actually CSS-led.
- Confirm this skill stayed the primary owner only for styling surfaces.
- Confirm SCSS was used by default unless the user explicitly required raw CSS, Less, Stylus, or a toolchain that cannot support SCSS.
- Confirm Vue component styles use `lang="scss"` when scoped or component-level styling is introduced.
- Confirm any template use came from `tanaab-templates`.
