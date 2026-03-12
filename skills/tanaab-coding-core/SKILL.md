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
- Prefer kebab-case for repo-authored filenames unless a tool or ecosystem requires a fixed conventional name such as `package.json`, `openai.yaml`, `SKILL.md`, `README.md`, `CHANGELOG.md`, `LICENSE`, or `Brewfile`.
- Prefer ESM JavaScript over CommonJS for new and migrated JavaScript surfaces.
- Prefer Bun as the primary JavaScript runtime and package manager, while still using `node:*` built-in modules where Bun provides Node-compatible support.
- Prefer SCSS over raw CSS, Less, or Stylus for stylesheet authoring when a preprocessor is appropriate.
- Organize repository code by purpose and behavior rather than by implementation type.
- Reserve `utils/` for generic, portable helpers that can move across repositories with minimal or no rewrite.
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
- Leave the repository easier to reason about than you found it: less drift, less duplication, and clearer boundaries.

## Engineering Philosophy

- Route by primary ownership first, then add companion skills only where the task crosses surfaces.
- Fix foundations before polish: runtime, build, test, CI, and release plumbing come before stylistic refinement.
- Treat tests, CI, release notes, and automation as product surfaces, not support work.
- Prefer deterministic, repo-local tooling and explicit configuration over magical implicit behavior.
- Treat TypeScript migration as an explicit follow-on decision until the build and release path is standardized well enough to scaffold it confidently.
- Keep generic utilities small, extraction-ready, and free of repo-specific language so they can later move into a shared utilities repo or standalone packages.
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

## Validation

- Confirm this skill is active whenever a skill in the Tanaab coding stack is used.
- Confirm specialized skills are layered on top of this skill rather than replacing it.
- Confirm stack decisions follow the primary-owner model rather than splitting ownership ambiguously.
- Confirm new repo-authored files use kebab-case unless a fixed conventional filename is required by the tool or ecosystem.
- Confirm JavaScript surfaces default to ESM and Bun unless the user explicitly asked for another runtime or module format.
- Confirm stylesheet work defaults to SCSS unless the user explicitly required plain CSS or another styling format.
- Confirm code is organized by purpose, and that any `utils/` entries are genuinely generic and portable rather than repo-specific.
- Confirm functions normalize input at the boundary, keep data flow mostly one-way, and minimize mutable working variables.
- Confirm caller-owned inputs are not mutated unless the code explicitly clones or isolates that mutation.
- Confirm non-CLI Bun or Node scripts do not carry a hashbang and are invoked via `bun ./script.js` or `node ./script.js` instead.
