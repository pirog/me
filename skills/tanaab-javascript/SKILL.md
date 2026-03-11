---
name: tanaab-javascript
description: Guide JavaScript and TypeScript implementation work under the shared Tanaab coding structure, including Bun migration, ESM conversion, package metadata, and JavaScript-backed CLI or action code.
---

# Tanaab JavaScript

## Overview

Use this skill for JavaScript and TypeScript implementation work within the Tanaab coding hierarchy, including Bun adoption, module-system conversion, package metadata, bundling, and JavaScript-backed CLI or action code. Prefer ESM JavaScript on Bun today; do not default to TypeScript migration until the build and release path is defined well enough to standardize.

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
- Pair with `tanaab-vue` for Vue codebases using JavaScript or TypeScript.
- Pair with `tanaab-testing` when implementation changes need regression coverage.
- Pair with `tanaab-github-actions` when JavaScript action code and workflow wiring are both in scope.
- Pair with `tanaab-shell` when JavaScript CLIs also need shell contract or wrapper guidance.
- Use `tanaab-templates` when a reusable JavaScript or TypeScript starter or file pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the JavaScript or TypeScript surface: source files, config, runtime or package metadata, module system, build integration, CLI code, and generated types.
3. Update runtime and package plumbing when the task changes the JS runtime.
- Set `packageManager` in `package.json` to the repo's pinned Bun release when migrating to Bun.
- Replace `engines.node` with `engines.bun` when appropriate.
- Generate and commit `bun.lock`.
- Remove `package-lock.json` and `.node-version`.
- Add or update `.bun-version` to `1.3` when the repo follows the shared Bun version-file convention.
- Add or update `.tool-versions` to include `bun 1.3` and a Node compatibility entry when the repo tracks local tool versions there.
- Add or update `"type": "module"`, `main`, and `exports` when the task includes ESM conversion.
- Keep artifact paths stable when workflows or actions depend on exact filenames such as `dist/index.js`.
4. Prefer ESM JavaScript on Bun as the current default.
- Use `import` and `export` syntax instead of CommonJS forms.
- Prefer Bun to execute repo-authored JavaScript tooling and automation code instead of invoking `node` directly.
- Treat TypeScript migration as a separate planned task unless the repository already has an approved TypeScript pipeline.
5. Apply JavaScript and TypeScript code and module changes.
- Replace `require(...)` with `import ... from ...` where ESM is required.
- Replace `module.exports = ...` with `export default ...`.
- Replace `exports.foo = ...` with named exports.
- Add explicit `.js` extensions for local relative ESM imports.
- Group imports in this order: built-ins, third-party packages, local imports.
- Prefix Node built-ins with `node:`.
- Sort imports alphabetically within each present group.
- Prefer kebab-case for new repo-authored JavaScript, TypeScript, and helper filenames unless the toolchain expects a fixed conventional name.
6. Apply JavaScript implementation notes when the task touches CLIs or automation code.
- Use ESM bin scripts with `#!/usr/bin/env bun` when authoring JavaScript CLIs in this repo style.
- Prefer `colorette` for style-consistent terminal output.
- Prefer a single logging helper built on `node:util` (`format`, `inspect`) instead of scattered direct `console.*` usage.
- Prefer `node:fs/promises` for async file operations and `realpath()` for robust path comparisons.
- For repository-aware defaults, discover project root from `.git` or `package.json`, scan for marker directories, ignore large unrelated directories such as `node_modules` and `.git`, error on zero or multiple matches, and surface the resolved default in help output.
7. Replace npm-specific JavaScript runtime commands when the task includes Bun migration.
- Replace `npm install -g` helpers with `bunx --bun --package <pkg>@<version> <bin> ...`.
- Replace `npm pack --json --dry-run` with Bun equivalents such as `bun pm pack --dry-run --ignore-scripts` and adapt parsing.
- Move new reusable helpers into `utils/` modules following existing export conventions.
8. Update docs and examples when the task changes runtime or module expectations.
- Rewrite README or workflow snippets from Node/npm commands to Bun commands when appropriate.
- Document new Bun-specific inputs, configuration files, or remaining migration phases explicitly.
9. Pull from `tanaab-testing`, `tanaab-github-actions`, `tanaab-shell`, or `tanaab-templates` when the task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the JavaScript skill.
- [assets/tanaab-javascript-icon.png](./assets/tanaab-javascript-icon.png): UI icon for the JavaScript skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task actually requires JavaScript or TypeScript handling.
- Confirm this skill stayed the primary owner only for JavaScript or TypeScript surfaces.
- Confirm JavaScript module code uses ESM rather than CommonJS unless the user explicitly required CommonJS compatibility.
- Confirm repo-authored JavaScript CLI entrypoints use `#!/usr/bin/env bun` rather than a Node shebang.
- Confirm `.bun-version` and `.tool-versions` reflect the repo's Bun-first runtime policy when those files are in scope.
- Run `bun install --frozen-lockfile --ignore-scripts` when Bun plumbing changed.
- Run `bun run lint`.
- Run `bun run build` or equivalent artifact generation when build or distribution output changed.
- Re-run the relevant test or CI commands used by the repository when runtime or module behavior changed.
- Confirm no stale Node/npm or CommonJS references remain when the task explicitly migrated away from them.
- Confirm generated outputs remain executable and artifact paths stayed stable where workflows depend on them.
- Confirm cross-skill handoffs are explicit when testing, workflow wiring, shell behavior, or templates are involved.
