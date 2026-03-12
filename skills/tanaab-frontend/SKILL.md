---
name: tanaab-frontend
description: Guide frontend implementation work under the shared Tanaab coding structure, including Vue 3, VitePress 1, and SCSS styling.
---

# Tanaab Frontend

## Overview

Use this skill for frontend implementation work within the Tanaab coding hierarchy. Prefer Vue 3 for front-end components, prefer VitePress 1 once a static or docs-site surface has already been chosen, and prefer SCSS for frontend styling.

## When to Use

- The request targets Vue 3 components, frontend app structure, SFCs, composition APIs, or frontend tooling.
- The request targets a static website, documentation site, or marketing-style site already scoped to VitePress 1 implementation.
- The request targets SCSS, CSS, selectors, design tokens, layout, theme styling, or stylesheet organization for frontend work.
- The task touches `.vitepress/`, VitePress theme wiring, local subthemes, or static-site framework selection.
- The task needs frontend-specific decisions rather than generic JavaScript runtime, shell, or workflow guidance.

## When Not to Use

- Do not use this skill for non-Vue frontend work.
- Do not use this skill for non-frontend styling or unrelated design-token work.
- Do not use this skill alone when the task is purely JavaScript or TypeScript runtime or package configuration.
- Do not use this skill for non-static frontend sites when another framework is already explicitly required.
- Do not choose raw CSS, Less, or Stylus by default when SCSS would satisfy the request.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Primary ownership: Vue 3 components, frontend layout and design-token implementation, SCSS or stylesheet structure, VitePress 1 static-site structure, and frontend tooling decisions.
- Defer general JavaScript or TypeScript runtime and package concerns to `tanaab-javascript`.
- Defer README-vs-docs-site decisions, durable docs information architecture, and documentation policy to `tanaab-documentation`.
- Defer test scope and regression policy to `tanaab-testing`.
- Pair with `tanaab-javascript` for frontend codebases using JavaScript or TypeScript runtime wiring, bundling, or package changes.
- Pair with `tanaab-documentation` when docs-site structure, migration, or audience-fit decisions are still in scope.
- Pair with `tanaab-testing` when frontend changes need focused regression coverage.
- Use `tanaab-templates` when a reusable frontend scaffold, VitePress starter, SCSS pattern, or component pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the frontend surface: Vue 3 components, app structure, state flow, SCSS or stylesheet layers, design tokens, templates, build integration, or VitePress 1 site structure and theme wiring once the site surface is already chosen.
3. Prefer Vue 3 when the task needs front-end components.
4. Prefer VitePress 1 when a static or docs site is already in scope.

- For Tanaab-styled static sites, prefer subthemes built on [tanaabased/theme](https://github.com/tanaabased/theme).
- For non-Tanaab styled static sites, prefer subthemes built on [lando/vitepress-theme-default-plus](https://github.com/lando/vitepress-theme-default-plus).
- Keep project-specific presentation changes in the local subtheme layer instead of forking the upstream theme package when a subtheme is sufficient.

5. Prefer SCSS as the default styling format.

- Use `.scss` for standalone frontend stylesheets when a preprocessor is in play.
- Prefer shared variables, mixins, token maps, and nesting discipline in SCSS instead of reaching for Less or Stylus.
- Keep plain `.css` only when the task explicitly requires raw CSS or the surrounding toolchain does not support SCSS.
- In Vue components, prefer `<style lang="scss">` unless the task explicitly requires another format.

6. Pull from `tanaab-documentation`, `tanaab-javascript`, `tanaab-testing`, or `tanaab-templates` when the task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the frontend skill.
- [assets/tanaab-frontend-icon.png](./assets/tanaab-frontend-icon.png): UI icon for the frontend skill.
- [references/front-end-preferences.md](./references/front-end-preferences.md): preferred defaults for Vue 3, VitePress 1, and SCSS frontend work.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task actually requires frontend-specific handling.
- Confirm this skill stayed the primary owner only for frontend surfaces.
- Confirm Vue 3 was used for front-end components unless the user explicitly required a different framework.
- Confirm VitePress 1 was used for static sites unless the user explicitly required a different static-site stack.
- Confirm SCSS was used by default unless the user explicitly required plain CSS, Less, Stylus, or a toolchain that cannot support SCSS.
- Confirm Vue component styling defaults to `lang="scss"` unless the user explicitly required another format.
- Confirm README-vs-docs-site and docs-policy decisions are handed to `tanaab-documentation` when they become a documentation task.
- Confirm cross-skill handoffs are explicit when JavaScript, testing, or templates are involved.
