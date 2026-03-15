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
- `tanaab-javascript`, `tanaab-frontend`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-testing`, `tanaab-release`, and `tanaab-documentation` assume this skill is active.
- `tanaab-templates` can supply reusable files that still follow this skill's doctrine.

## Coding Principles

- Make the smallest change that fully solves the task.
- Preserve external behavior and public interfaces unless the user explicitly asks for a behavior change.
- Keep one clear source of truth for configuration, generated artifacts, and workflow decisions.
- Keep one clear source of truth for linting and formatting: ESLint owns code-quality rules and Prettier owns formatting.
- Prefer kebab-case for repo-authored filenames unless a tool or ecosystem requires a fixed conventional name such as `package.json`, `openai.yaml`, `SKILL.md`, `README.md`, `CHANGELOG.md`, `LICENSE`, or `Brewfile`.
- Prefer ESM JavaScript over CommonJS for new and migrated JavaScript surfaces.
- Prefer Bun as the primary JavaScript runtime and package manager in repositories that have meaningful JavaScript or TypeScript tooling, CLI, docs, or automation surfaces, while still using `node:*` built-in modules where Bun provides Node-compatible support.
- Prefer SCSS over raw CSS, Less, or Stylus for stylesheet authoring when a preprocessor is appropriate.
- Organize repository code by purpose and behavior rather than by implementation type.
- Prefer `utils/` for helpers that are generic, portable, and plausible extraction candidates across repositories.
- Normalize raw inputs and options once at the function boundary so downstream logic can work against one stable shape.
- Prefer straight-line data flow: derive named constants in order and move toward the return value instead of repeatedly rewriting a working variable.
- Prefer early returns for empty, invalid, or trivial edge cases when they simplify the main path.
- Default to `const` and minimize mutable working variables. Introduce mutation only when it is required by the API or clearly improves readability.
- When mutation is necessary, confine it to a cloned object or local scratch value instead of mutating caller-owned inputs.
- Keep pure transformation separate from side effects such as filesystem access, environment mutation, process control, network calls, and child-process execution.
- In small Bun or Node repos with only a few JavaScript files, keeping repo-specific scripts at the root is acceptable.
- Treat hashbang-bearing Bun or Node files as true CLI entrypoints at the repository package level: they belong in `bin/` and should be declared in `package.json`.
- Skill-bundled helper scripts under `skills/**/scripts/` are exempt from the repo-level `bin/` convention and should stay local to the owning skill.
- Make operational intent explicit in code, scripts, and workflows instead of relying on hidden assumptions.
- Validate the changed surface with the narrowest reliable checks first, then broaden validation when risk justifies it.
- For touched shell scripts or non-trivial shell logic, that narrow validation often includes targeted `shellcheck`, regardless of whether the repository uses Bun.
- Leave the repository easier to reason about than you found it: less drift, less duplication, and clearer boundaries.

## Engineering Philosophy

- Route by primary ownership first, then add companion skills only where the task crosses surfaces.
- Fix foundations before polish: runtime, build, test, CI, and release plumbing come before stylistic refinement.
- Treat tests, CI, release notes, and automation as product surfaces, not support work.
- Treat generated `dist/` artifacts, hosted script URLs, and other distributed entrypoints as product surfaces when users run or download them directly.
- Prefer deterministic, repo-local tooling and explicit configuration over magical implicit behavior.
- Prefer the obvious local solution over a more abstract reusable one unless reuse is already proven, a matching template already exists, or the user explicitly asks for standardization.
- When a build or release step materially reshapes the user-facing artifact, prefer validating that prepared artifact instead of only validating source-tree files.
- When a JS or Bun repo introduces standalone Prettier, copy or align with `templates/javascript/lint/prettier.config.js` and `.prettierignore` instead of inventing local style defaults.
- When a releasable CLI needs stamped version output, prefer one injection-friendly top-level `SCRIPT_VERSION` declaration or assignment line in the entrypoint rather than scattering hardcoded version literals across helpers or docs.
- Do not introduce Bun into a repository that has no meaningful JavaScript or TypeScript surface just to satisfy stack consistency; use it when the repo actually carries JS or TS tooling or automation value.
- Treat TypeScript migration as an explicit follow-on decision until the build and release path is standardized well enough to scaffold it confidently.
- Keep generic utilities small, extraction-ready, and low-coupling so they can later move into a shared utilities repo or standalone packages.
- Treat tightly coupled `utils/` files as a warning to review, not an automatic failure. Some repos naturally have repo-shaped helpers, especially around GitHub Actions, release automation, or CLI plumbing.
- When a `utils/` file is repo-shaped, make an explicit call: either it is probably okay because the coupling is narrow and inherent to the repo surface, or the logic should move back toward the owning purpose folder.
- Let data enter at the boundary, get normalized once, flow through small named transformations, and return in one direction.
- Prefer explanation by function shape and naming over comment-heavy code.
- Prefer returning derived data over mutating ambient global state inside generic code.
- Promote patterns into `tanaab-templates` only after they prove reusable in real tasks.
- Make cross-skill handoffs explicit whenever one skill owns the artifact and another owns surrounding policy or integration.

## Workflow

1. Activate this skill for every task in the Tanaab coding stack.
2. Apply the shared doctrine from `## Coding Principles` and `## Engineering Philosophy` once those sections are defined.
3. Hand domain-specific implementation details to the relevant specialized skill.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the shared coding doctrine skill.
- [assets/tanaab-coding-core-icon.png](./assets/tanaab-coding-core-icon.png): UI icon for the coding-core skill.
- [references/cli-style-rules.md](./references/cli-style-rules.md): shared Bash and Bun CLI help, color, and status-line rules for the stack.
- [scripts/bun-cli-support.js](./scripts/bun-cli-support.js): shared lightweight Bun CLI helper for skill-local helper scripts across the stack.

## Validation

- Confirm this skill is active whenever a skill in the Tanaab coding stack is used.
- Confirm specialized skills are layered on top of this skill rather than replacing it.
- Confirm stack decisions follow the primary-owner model rather than splitting ownership ambiguously.
- Confirm new repo-authored files use kebab-case unless a fixed conventional filename is required by the tool or ecosystem.
- Confirm JavaScript surfaces default to ESM and Bun when the repository actually has JavaScript or TypeScript tooling or runtime surfaces, unless the user explicitly asked for another runtime or module format.
- Confirm JS or Bun lint and format work keeps ownership clear: ESLint for code-quality rules, Prettier for formatting.
- Confirm JS or Bun repos standardized on lint or format use the shared `prettier.config.js` and `.prettierignore` template files, or an explicitly aligned equivalent, rather than ad hoc local Prettier style.
- Confirm the task did not widen into reusable-template or shared-doctrine work unless the user asked for it or the existing duplication was already causing the current problem.
- Confirm stylesheet work defaults to SCSS unless the user explicitly required plain CSS or another styling format.
- Confirm user-facing distributed artifacts were validated directly when the repository ships a generated or hosted entrypoint instead of raw source files.
- Confirm code is organized by purpose, and that any `utils/` entries are intentionally placed: ideally generic and portable, or explicitly justified as narrow repo-shaped helpers.
- Confirm repo-shaped `utils/` files were reviewed as a warning case and either accepted intentionally or moved closer to the owning purpose surface.
- Confirm functions normalize input at the boundary, keep data flow mostly one-way, and minimize mutable working variables.
- Confirm caller-owned inputs are not mutated unless the code explicitly clones or isolates that mutation.
- Confirm non-CLI Bun or Node scripts do not carry a hashbang and are invoked via `bun ./script.js` or `node ./script.js` instead.
- Confirm touched shell scripts or reusable shell helpers get `shellcheck` when shell is a real maintained surface in the task.
- Confirm releasable CLI entrypoints expose one injection-friendly top-level `SCRIPT_VERSION` declaration or assignment line, or an explicitly aligned equivalent, when release stamping is part of the task.
