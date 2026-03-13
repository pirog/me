---
name: tanaab-javascript
description: Guide JavaScript and TypeScript implementation work under the shared Tanaab coding structure, including Bun migration, ESM conversion, package metadata, and JavaScript-backed CLI or action code.
---

# Tanaab JavaScript

## Overview

Use this skill for JavaScript and TypeScript implementation work within the Tanaab coding hierarchy, including Bun adoption, module-system conversion, package metadata, bundling, and JavaScript-backed CLI or action code. Prefer ESM JavaScript on Bun today when the repository actually has meaningful JavaScript or TypeScript surfaces; do not default to TypeScript migration until the build and release path is defined well enough to standardize.

## When to Use

- The request targets `.js`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `package.json`, bundling, module format, runtime wiring, or typing.
- The task needs JavaScript or TypeScript structure, build integration, package metadata, or JS-runtime decisions.
- Migrate a repository from Node.js/npm to Bun.
- Convert a CommonJS JavaScript repository to ESM.
- Implement or refactor JavaScript-backed CLIs or JavaScript GitHub Action code.

## When Not to Use

- Do not use this skill for styling-only work.
- Do not use this skill for shell scripts or GitHub Actions YAML unless JavaScript action or runtime code is also involved.
- Do not use this skill for release-note writing or changelog-only work.
- Do not migrate JavaScript code to TypeScript by default unless the repository already uses TypeScript or the user explicitly asks for that migration.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Primary ownership: JavaScript and TypeScript source code, package metadata, runtime wiring, module system, bundling, and JavaScript-backed automation code.
- Defer shell-level CLI contract and wrapper behavior to `tanaab-shell`.
- Defer workflow YAML and CI job structure to `tanaab-github-actions`.
- Defer test scope and coverage policy to `tanaab-testing`.
- Defer changelog and release-note writing to `tanaab-release`.
- Pair with `tanaab-frontend` for Vue 3, VitePress 1, or other frontend codebases that also need JavaScript or TypeScript runtime work.
- Pair with `tanaab-testing` when implementation changes need regression coverage.
- Pair with `tanaab-github-actions` when JavaScript action code and workflow wiring are both in scope.
- Pair with `tanaab-shell` when JavaScript CLIs also need shell contract or wrapper guidance.
- Use `tanaab-templates` when a reusable JavaScript or TypeScript starter or file pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the JavaScript or TypeScript surface: source files, config, runtime or package metadata, module system, build integration, CLI code, and generated types.
3. When repo structure or utility extraction is in scope, apply [references/repo-structure.md](./references/repo-structure.md).

- Prefer purpose-oriented folders over implementation-type buckets when the layout is changing.
- Prefer `utils/` for extraction-ready helpers, but treat repo-shaped utilities as an explicit review point rather than an automatic violation.

4. Distinguish true CLIs from ordinary scripts.

- Treat package-level hashbang entrypoints as real CLIs: put them under `bin/` and declare them in `package.json`.
- Keep skill-local helper scripts under `skills/**/scripts/` instead of promoting them into the repo package `bin/`.
- If a file does not expose normal CLI behavior, omit the hashbang and invoke it with `bun ./path/to/script.js` or `node ./path/to/script.js`.

5. Update runtime and package plumbing when the task changes the JS runtime.

- Set `packageManager` in `package.json` to the repo's pinned Bun release when migrating to Bun.
- Replace `engines.node` with `engines.bun` when appropriate.
- Generate and commit `bun.lock`.
- Remove `package-lock.json` and `.node-version`.
- Add or update `.bun-version` to `1.3` when the repo follows the shared Bun version-file convention.
- Add or update `.tool-versions` to include `bun 1.3` and a Node compatibility entry when the repo tracks local tool versions there.
- Add or update `"type": "module"`, `main`, and `exports` when the task includes ESM conversion.
- Keep artifact paths stable when workflows or actions depend on exact filenames such as `dist/index.js`.
- For Bun-backed GitHub Actions, compile the runtime to `dist/index.js` with `bun build`, commit the built artifact, and keep `main` and `exports` aligned with that runtime path when package metadata is in scope.
- Prefer an explicit `build` script plus `prepare` or equivalent release plumbing so the committed action artifact does not drift from source.

6. Prefer ESM JavaScript on Bun as the current default for repositories that actually have JavaScript or TypeScript tooling, runtime, or automation surfaces.

- Use `import` and `export` syntax instead of CommonJS forms.
- Prefer Bun to execute repo-authored JavaScript tooling and automation code instead of invoking `node` directly.
- Treat TypeScript migration as a separate planned task unless the repository already has an approved TypeScript pipeline.

7. When function shape or imports change, apply [references/function-data-flow.md](./references/function-data-flow.md).

- Normalize inputs at the boundary and prefer early returns and named constants for one-way data flow.
- Keep side effects at the edge and clone before mutating caller-owned arrays or objects.
- Group imports into built-in, third-party, and local blocks with `node:`-prefixed built-ins and alphabetized bindings inside each present block.
- Prefer kebab-case for new repo-authored JavaScript, TypeScript, and helper filenames unless the toolchain expects a fixed conventional name.

8. Apply JavaScript and TypeScript code and module changes.

- Replace `require(...)` with `import ... from ...` where ESM is required.
- Replace `module.exports = ...` with `export default ...`.
- Replace `exports.foo = ...` with named exports.
- Add explicit `.js` extensions for local relative ESM imports.
- Omit empty blocks, but keep a single blank line between the blocks that exist.

9. When the task touches CLIs or automation code, apply the shared CLI contract from [../tanaab-coding-core/references/cli-style-rules.md](../tanaab-coding-core/references/cli-style-rules.md) and then add JavaScript-specific behavior.

- Use ESM bin scripts with `#!/usr/bin/env bun` when authoring true JavaScript CLIs in this repo style.
- For package-level or user-facing Bun CLIs, prefer the full template pattern with `ansis`, `yargs-parser`, `--help`, `--version`, and shared logging helpers.
- For releasable Bun CLIs that may be stamped by `prepare-release-action`, keep a single top-level `let SCRIPT_VERSION;` placeholder with fallback initialization from `git describe` or a hardcoded default so `version-injector --style js` can update the entrypoint in place.
- For skill-local helper scripts under `skills/**/scripts/`, default to Bun plus built-in modules and the shared coding-core helper at `skills/tanaab-coding-core/scripts/bun-cli-support.js` before introducing extra CLI dependencies.
- Only add external CLI packages to skill-local helper scripts when the option surface, parsing rules, or output requirements are complex enough that the built-in path is no longer clear or maintainable.
- Prefer a single logging helper built on `node:util` (`format`, `inspect`) instead of scattered direct `console.*` usage.
- Prefer `node:fs/promises` for async file operations and `realpath()` for robust path comparisons.
- For repository-aware defaults, discover project root from `.git` or `package.json`, scan for marker directories, ignore large unrelated directories such as `node_modules` and `.git`, error on zero or multiple matches, and surface the resolved default in help output.

10. When standardizing lint or format config, prefer flat ESLint plus standalone Prettier.

- Keep one root ESLint config with a shared JS or Bun base and add narrow overrides for CJS, tests, templates, and optional TypeScript or Vue layers only when the repo actually uses them.
- In ESM-first repos, prefer `eslint.config.js` and `prettier.config.js` over `.mjs`.
- Keep ownership explicit: ESLint handles code-quality and static-analysis rules, while Prettier handles formatting.
- Prefer `eslint-config-prettier` plus `prettier --check` or `prettier --write` over `eslint-plugin-prettier` for shared repo defaults.
- When introducing standalone Prettier, copy or align with `templates/javascript/lint/prettier.config.js` and `templates/javascript/lint/.prettierignore` instead of inventing a repo-local style baseline.
- Treat the shared Prettier template as the formatting authority for repo defaults, including quote style, rather than falling back to generic Prettier defaults.
- Do not assume import-order plugins belong in the shared baseline; add them only when the chosen package stack explicitly supports the repo's ESLint major version.
- Use `templates/javascript/lint/` when scaffolding or normalizing this config shape across repositories, including `eslint.config.js`, `prettier.config.js`, `.prettierignore`, and the standard `lint:eslint`, `format:check`, `format:write`, and `lint` scripts.

11. Replace npm-specific JavaScript runtime commands when the task includes Bun migration.

- Replace `npm install -g` helpers with `bunx --bun --package <pkg>@<version> <bin> ...`.
- Replace `npm pack --json --dry-run` with Bun equivalents such as `bun pm pack --dry-run --ignore-scripts` and adapt parsing.

12. Update docs and examples when the task changes runtime or module expectations.

- Rewrite README or workflow snippets from Node/npm commands to Bun commands when appropriate.
- Document new Bun-specific inputs, configuration files, or remaining migration phases explicitly.
- For GitHub Action repos, pair this with [../tanaab-github-actions/references/javascript-action-conventions.md](../tanaab-github-actions/references/javascript-action-conventions.md) so runtime code, composite wrapper wiring, and committed artifacts stay aligned.

13. Pull from `tanaab-testing`, `tanaab-github-actions`, `tanaab-shell`, or `tanaab-templates` when the task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the JavaScript skill.
- [assets/tanaab-javascript-icon.png](./assets/tanaab-javascript-icon.png): UI icon for the JavaScript skill.
- [references/repo-structure.md](./references/repo-structure.md): preferred purpose-driven repo structure and `utils/` boundaries for JavaScript projects.
- [references/function-data-flow.md](./references/function-data-flow.md): preferred JavaScript unit shape for one-way data flow, minimal mutation, and grouped imports.
- [../tanaab-coding-core/references/cli-style-rules.md](../tanaab-coding-core/references/cli-style-rules.md): shared CLI help, color, and status-line rules used across shell and Bun CLIs.
- [../tanaab-github-actions/references/javascript-action-conventions.md](../tanaab-github-actions/references/javascript-action-conventions.md): preferred runtime, bundling, and artifact rules for Bun-backed JavaScript GitHub Actions.
- [../tanaab-templates/templates/javascript/lint/README.md](../tanaab-templates/templates/javascript/lint/README.md): shared ESLint, Prettier, `.prettierignore`, and script baseline for JS, Bun, TS, and Vue repos.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task actually requires JavaScript or TypeScript handling.
- Confirm this skill stayed the primary owner only for JavaScript or TypeScript surfaces.
- Confirm JavaScript module code uses ESM rather than CommonJS unless the user explicitly required CommonJS compatibility.
- Confirm repo-authored JavaScript CLI entrypoints use `#!/usr/bin/env bun` rather than a Node shebang, and that non-CLI scripts omit a hashbang.
- Confirm any CLI contract or help output touched by the task follows [../tanaab-coding-core/references/cli-style-rules.md](../tanaab-coding-core/references/cli-style-rules.md).
- Confirm releasable Bun CLI entrypoints expose a single injection-friendly `SCRIPT_VERSION` placeholder plus fallback logic, or an explicitly aligned equivalent, when `prepare-release-action` style version stamping is in scope.
- Confirm lint or format standardization uses a root flat ESLint config and standalone Prettier rather than embedding formatting checks into ESLint by default.
- Confirm standalone Prettier uses the shared `templates/javascript/lint/prettier.config.js` and `.prettierignore` baseline, or an explicitly aligned equivalent, instead of ad hoc local style.
- Confirm repo scripts align with the shared `lint:eslint`, `format:check`, `format:write`, and `lint` shape when lint or format standardization was in scope.
- Confirm repo-structure and `utils/` decisions follow [references/repo-structure.md](./references/repo-structure.md) when that surface was in scope.
- Confirm function shape, mutation discipline, and import grouping follow [references/function-data-flow.md](./references/function-data-flow.md) when those surfaces were in scope.
- Confirm `.bun-version` and `.tool-versions` reflect the repo's Bun-first runtime policy when those files are in scope.
- Confirm skill-bundled scripts remain under the skill's own `scripts/` directory instead of being promoted into the repo package `bin/`.
- Run `bun install --frozen-lockfile --ignore-scripts` when Bun plumbing changed.
- Run `bun run lint`.
- Run `bun run build` or equivalent artifact generation when build or distribution output changed.
- Re-run the relevant test or CI commands used by the repository when runtime or module behavior changed.
- Confirm no stale Node/npm or CommonJS references remain when the task explicitly migrated away from them.
- Confirm generated outputs remain executable and artifact paths stayed stable where workflows depend on them.
- Confirm Bun-backed GitHub Actions use `bun build` to emit a stable `dist/index.js` artifact when that runtime surface changed.
- Confirm cross-skill handoffs are explicit when testing, workflow wiring, shell behavior, or templates are involved.
