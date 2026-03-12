---
name: tanaab-templates
description: Manage reusable template files and extracted reusable fragments for Tanaab coding skills.
---

# Tanaab Templates

## Overview

Use this skill to manage reusable template files for the Tanaab coding hierarchy and to hold reusable fragments extracted from specialized skills.

## When to Use

- A coding skill needs a reusable file, scaffold, snippet, or boilerplate pattern.
- The request should be satisfied by selecting or adapting a template rather than inventing structure from scratch.

## When Not to Use

- Do not use this skill for one-off implementation work that does not benefit from reuse.
- Do not create template content until the task explicitly calls for it.

## Relationship to Other Skills

- Support `tanaab-coding`, `tanaab-javascript`, `tanaab-frontend`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-testing`, `tanaab-release`, and `tanaab-documentation`.
- Assume `tanaab-coding-core` is active when templates are applied to coding work.
- Primary ownership: reusable scaffolds, boilerplate, and fragments that have already proven reusable.
- Do not override behavioral ownership held by the specialized skill that defined the pattern.

## Workflow

1. Confirm which coding skill requested template support.
2. Inspect `templates/` for a reusable starting point that matches the request.
3. Select and adapt the relevant template when one exists.
4. When consolidating legacy skill guidance, move truly reusable fragments here instead of leaving them buried in retired skill docs.
5. If no suitable template exists, call out the gap rather than inventing a new template set implicitly.
6. Name new template files in kebab-case unless the target ecosystem requires a fixed conventional filename.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the templates skill.
- [assets/tanaab-templates-icon.png](./assets/tanaab-templates-icon.png): UI icon for the templates skill.
- [templates/](./templates/): reserved location for reusable coding templates.
- [../tanaab-coding-core/references/cli-style-rules.md](../tanaab-coding-core/references/cli-style-rules.md): shared CLI style reference for keeping shell and Bun templates aligned.

## Templates Directory

- `templates/` stores reusable code patterns and boilerplate for the Tanaab coding skills.
- Category directories now exist for `javascript/`, `css/`, `scss/`, `vue/`, `vitepress/`, `shell/`, `github-actions/`, `testing/`, and `release/`.
- Use `templates/javascript/cli/` for Bun-first CLI starters that standardize help output, `--version`, `--debug`, and shared logging helpers.
- Use `templates/shell/` for Bash CLI starters that standardize help output, `--version`, `--debug`, `tty_tp` / `tty_ts`, and shared status helpers.
- Use `templates/javascript/utils/` only for truly generic helper starters that can later move into a shared utilities repo or standalone packages.
- Use `templates/javascript/unit/` for single-function JavaScript unit starters that demonstrate boundary normalization, straight-line data flow, and minimal mutation.
- Use `templates/scss/` for shared SCSS partials, mixins, token maps, and stylesheet starters once those patterns prove reusable.
- Use `templates/javascript/` for Bun-first ESM starters and `templates/github-actions/` for reusable Bun setup/install snippets once those patterns prove reusable.
- Use `templates/vitepress/` for reusable VitePress starters, subtheme entrypoints, shared config fragments, and page scaffolds once those patterns prove reusable.
- Keep concrete templates lean and extraction-ready; expand these directories only when the pattern proves reusable across real tasks.

## Validation

- Confirm the request actually benefits from reuse.
- Confirm any selected template matches the calling skill and task.
- Confirm missing templates are reported as gaps rather than invented on the fly.
