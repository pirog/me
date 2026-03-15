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
- Do not treat this skill as required preflight for ordinary local edits or narrow bug fixes.
- Do not create template content until the task explicitly calls for it.

## Relationship to Other Skills

- Support `tanaab-coding`, `tanaab-javascript`, `tanaab-frontend`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-testing`, `tanaab-release`, and `tanaab-documentation`.
- Assume `tanaab-coding-core` is active when templates are applied to coding work.
- Primary ownership: reusable scaffolds, boilerplate, and fragments that have already proven reusable.
- Do not override behavioral ownership held by the specialized skill that defined the pattern.

## Workflow

1. Confirm which coding skill requested template support.
2. Inspect `templates/` for a reusable starting point only when the task actually calls for reusable structure, a new file shape, or explicit standardization.
3. Select and adapt the relevant template when one exists.
4. When consolidating legacy skill guidance, move truly reusable fragments here instead of leaving them buried in retired skill docs.
5. When the canonical starter lives in a dedicated GitHub template repo instead of this local `templates/` tree, prefer that upstream template rather than recreating it locally.
6. When adopting a GitHub template repo, inspect its root `TEMPLATE-SETUP.md` before customizing the repo so the setup order, cleanup expectations, and agent inputs stay aligned with the template contract.
7. If no suitable template exists, call out the gap rather than inventing a new template set implicitly.
8. Name new template files in kebab-case unless the target ecosystem requires a fixed conventional filename.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the templates skill.
- [assets/tanaab-templates-icon.png](./assets/tanaab-templates-icon.png): UI icon for the templates skill.
- [templates/](./templates/): reserved location for reusable coding templates.
- [../tanaab-coding-core/references/cli-style-rules.md](../tanaab-coding-core/references/cli-style-rules.md): shared CLI style reference for keeping shell and Bun templates aligned.

## Templates Directory

- `templates/` stores reusable code patterns and boilerplate for the Tanaab coding skills.
- Category directories exist for `documentation/`, `javascript/`, `css/`, `scss/`, `vue/`, `vitepress/`, `shell/`, `github-actions/`, `testing/`, and `release/`, but only some currently contain concrete starters.
- Today the concrete starter content lives in `templates/documentation/`, `templates/github-actions/`, `templates/javascript/cli/`, `templates/javascript/lint/`, `templates/javascript/unit/`, `templates/shell/`, and `templates/testing/`.
- Treat the other category directories as reserved homes for future templates rather than evidence of mature template coverage today.
- Use `templates/documentation/` for README standards, full README starters, GitHub Action README starters, and lightweight README wrappers that delegate durable docs to VitePress.
- Use `templates/documentation/TEMPLATE-SETUP.md` as the starter for root-level template adoption docs in GitHub repository templates. Those template repos should ship as generic but fully testable, lintable, and releasable versions of the thing they template rather than as half-wired placeholders.
- Use `templates/github-actions/` for Bun-backed JavaScript action workflow smoke-test starters, hosted-shell Leia example workflow starters, and reusable assertion-step patterns that exercise the real shipped surface.
- Use `templates/javascript/cli/` for package-level or user-facing Bun CLI starters that standardize help output, `--version`, `--debug`, shared logging helpers, and `SCRIPT_VERSION` placeholders that can be stamped by release automation.
- Use `templates/javascript/lint/` for the shared flat ESLint baseline plus the canonical `prettier.config.js`, `.prettierignore`, and `lint:eslint` / `format:check` / `format:write` / `lint` script shape that can be extended with optional TypeScript or Vue layers.
- Use `templates/shell/` for Bash and PowerShell CLI starters that standardize help output, version reporting, debug toggles, Tanaab brand colors, shared status helpers, and `SCRIPT_VERSION` assignments that can be stamped by release automation.
- Use the external GitHub template repo [`tanaabased/template-netscript`](https://github.com/tanaabased/template-netscript) when creating a new hosted Linux, macOS, or PowerShell script repo that will be published from Netlify. The expected flow is: create a new repository in the `tanaabased` org from that template, clone the new repo locally, then read `TEMPLATE-SETUP.md` because it contains the agent prompts and setup flow used to seed the template cleanly.
- Use `templates/testing/` for focused test starters such as GitHub Action input parsing specs that stub `@actions/core` cleanly and Leia-backed scenario README starters for shell or bootstrap repos.
- Use `templates/javascript/utils/` only for truly generic helper starters that can later move into a shared utilities repo or standalone packages.
- Use `templates/javascript/unit/` for single-function JavaScript unit starters that demonstrate boundary normalization, straight-line data flow, and minimal mutation.
- For skill-local helper scripts under `skills/**/scripts/`, prefer a lighter local helper layer over importing the full Bun CLI template or its third-party dependencies by default.
- Reserve `templates/scss/` for shared SCSS partials, mixins, token maps, and stylesheet starters once those patterns prove reusable.
- Reserve `templates/javascript/` for Bun-first ESM starters and reusable JavaScript support snippets once those patterns prove reusable.
- Reserve `templates/vitepress/` for reusable VitePress starters, subtheme entrypoints, shared config fragments, and page scaffolds once those patterns prove reusable.
- Keep concrete templates lean and extraction-ready; expand these directories only when the pattern proves reusable across real tasks.

## GitHub Repository Templates

- A GitHub repository template should be a working generic product surface, not just a file skeleton. It should be lintable, testable, and releasable in its own right before downstream repos adopt it.
- Prefer template repos when the reusable unit is an entire repository shape with workflows, docs, release automation, and hosted surfaces that would be awkward to recreate from scattered local snippets.
- Template repos should include a root-level `TEMPLATE-SETUP.md` that acts as both a manual adoption checklist and an AI-agent setup spec.
- `TEMPLATE-SETUP.md` should usually define the required setup inputs, the ordered adoption steps, cleanup tasks for removing template-only traces, validation commands, and the expected final summary.
- When a dedicated GitHub template repo already exists, link to it from this skill instead of cloning its entire structure into the local `templates/` tree unless the reusable asset is a standalone file-level starter.

## Validation

- Confirm the request actually benefits from reuse.
- Confirm any selected template matches the calling skill and task.
- Confirm ordinary local edits were not routed through templates by default.
- Confirm missing templates are reported as gaps rather than invented on the fly.
