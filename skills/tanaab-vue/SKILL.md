---
name: tanaab-vue
description: Guide Vue 3 component work and VitePress 1 static-site work under the shared Tanaab coding structure.
---

# Tanaab Vue

## Overview

Use this skill for Vue-specific implementation work within the Tanaab coding hierarchy. Prefer Vue 3 for front-end components and prefer VitePress 1 for static websites.

## When to Use

- The request targets Vue 3 components, Vue app structure, SFCs, composition APIs, or Vue tooling.
- The request targets a static website, documentation site, or marketing-style site built on VitePress 1.
- The task touches `.vitepress/`, VitePress theme wiring, local subthemes, or static-site framework selection.
- The task needs framework-specific Vue decisions rather than generic CSS or shell guidance.

## When Not to Use

- Do not use this skill for non-Vue frontend work.
- Do not use this skill alone when the task is purely styling or purely JavaScript or TypeScript configuration.
- Do not use this skill for non-static frontend sites when another framework is already explicitly required.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Primary ownership: Vue 3 components, SFC structure, state flow, Vue app structure, VitePress 1 static-site structure, and Vue-specific tooling decisions.
- Defer general JavaScript or TypeScript runtime and package concerns to `tanaab-javascript`.
- Defer styling ownership to `tanaab-css`.
- Defer test scope and regression policy to `tanaab-testing`.
- Pair with `tanaab-javascript` for Vue codebases using JavaScript or TypeScript.
- Pair with `tanaab-css` for VitePress theme styling and design-token work.
- Pair with `tanaab-css` for Vue styling work.
- Pair with `tanaab-testing` when Vue changes need focused regression coverage.
- Use `tanaab-templates` when a reusable Vue scaffold, VitePress starter, or component pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the Vue surface: Vue 3 components, app structure, state flow, templates, build integration, or VitePress 1 site structure and theme wiring.
3. Prefer Vue 3 when the task needs front-end components.
4. Prefer VitePress 1 when the task is a static website.
- For Tanaab-styled static sites, prefer subthemes built on [tanaabased/theme](https://github.com/tanaabased/theme).
- For non-Tanaab styled static sites, prefer subthemes built on [lando/vitepress-theme-default-plus](https://github.com/lando/vitepress-theme-default-plus).
- Keep project-specific presentation changes in the local subtheme layer instead of forking the upstream theme package when a subtheme is sufficient.
5. Pull from `tanaab-javascript`, `tanaab-css`, `tanaab-testing`, or `tanaab-templates` when the task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the Vue skill.
- [assets/tanaab-vue-icon.png](./assets/tanaab-vue-icon.png): UI icon for the Vue skill.
- [references/front-end-preferences.md](./references/front-end-preferences.md): preferred framework defaults for Vue 3 components and VitePress 1 static sites.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task actually requires Vue-specific handling.
- Confirm this skill stayed the primary owner only for Vue-specific surfaces.
- Confirm Vue 3 was used for front-end components unless the user explicitly required a different framework.
- Confirm VitePress 1 was used for static sites unless the user explicitly required a different static-site stack.
- Confirm cross-skill handoffs are explicit when JavaScript, CSS, testing, or templates are involved.
