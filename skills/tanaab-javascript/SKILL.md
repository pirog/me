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
- Pair with `tanaab-frontend` for Vue 3, VitePress 1, or other frontend codebases that also need JavaScript or TypeScript runtime work.
- Pair with `tanaab-testing` when implementation changes need regression coverage.
- Pair with `tanaab-github-actions` when JavaScript action code and workflow wiring are both in scope.
- Pair with `tanaab-shell` when JavaScript CLIs also need shell contract or wrapper guidance.
- Use `tanaab-templates` when a reusable JavaScript or TypeScript starter or file pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the JavaScript or TypeScript surface: source files, config, runtime or package metadata, module system, build integration, CLI code, and generated types.
3. Organize code by purpose before introducing or expanding folders.
- Prefer purpose-oriented folders such as `cli/`, `ux/`, `plugins/`, `build/`, `release/`, or other behavior-driven groupings.
- Avoid organizing code primarily by implementation type with buckets such as `components/`, `classes/`, or `helpers/` when a purpose-driven structure would be clearer.
- Keep repo-specific logic close to the owning purpose folder instead of drifting into a generic catch-all.
- In small Bun or Node repos with only a few JavaScript files, keeping repo-specific scripts at the root is acceptable.
4. Use `utils/` only for truly generic helpers.
- Each `utils/` file should export one main function.
- That function should be portable across repositories with minimal or no rewrite.
- Do not put repo-specific vocabulary, product names, workflow assumptions, or repository-only behavior into `utils/`.
- Treat `utils/` modules as future extraction candidates for a shared utilities repo or standalone packages.
5. Distinguish true CLIs from ordinary scripts.
- If a Bun or Node file has a hashbang, treat it as a CLI entrypoint.
- Put true JavaScript CLIs under `bin/` and declare them in `package.json`.
- Only treat a file as a CLI when it behaves like one: help or usage text, options, arguments, or other direct user-facing command behavior.
- Skill-local helper scripts under `skills/**/scripts/` are different: keep them bundled with the skill instead of moving them into the repo package `bin/`.
- If a file does not expose normal CLI behavior, treat it as a script instead: omit the hashbang and invoke it with `bun ./path/to/script.js` or `node ./path/to/script.js`.
6. Update runtime and package plumbing when the task changes the JS runtime.
- Set `packageManager` in `package.json` to the repo's pinned Bun release when migrating to Bun.
- Replace `engines.node` with `engines.bun` when appropriate.
- Generate and commit `bun.lock`.
- Remove `package-lock.json` and `.node-version`.
- Add or update `.bun-version` to `1.3` when the repo follows the shared Bun version-file convention.
- Add or update `.tool-versions` to include `bun 1.3` and a Node compatibility entry when the repo tracks local tool versions there.
- Add or update `"type": "module"`, `main`, and `exports` when the task includes ESM conversion.
- Keep artifact paths stable when workflows or actions depend on exact filenames such as `dist/index.js`.
7. Prefer ESM JavaScript on Bun as the current default.
- Use `import` and `export` syntax instead of CommonJS forms.
- Prefer Bun to execute repo-authored JavaScript tooling and automation code instead of invoking `node` directly.
- Treat TypeScript migration as a separate planned task unless the repository already has an approved TypeScript pipeline.
8. Shape JavaScript units for readability and one-way data flow.
- Normalize raw inputs and options near the top of the function or method.
- Prefer early returns for empty, invalid, or trivial edge cases so the main path stays readable.
- Derive named constants in order instead of repeatedly rewriting the same variable.
- Default to `const`; use mutable working variables only when mutation is materially clearer or required.
- Keep side-effectful work at the boundary. Read files, environment variables, process state, or child-process output near the edge, then hand parsed data to smaller helpers.
- Clone before mutating arrays or objects that came from outside the current function.
- For utility modules, prefer one main exported function per file and keep the file centered on one transformation, lookup, parser, loader, or formatter.
9. Apply JavaScript and TypeScript code and module changes.
- Replace `require(...)` with `import ... from ...` where ESM is required.
- Replace `module.exports = ...` with `export default ...`.
- Replace `exports.foo = ...` with named exports.
- Add explicit `.js` extensions for local relative ESM imports.
- Group imports in three blank-line-separated blocks: Node built-ins, third-party packages, then local or repo-provided modules.
- Prefix Node built-ins with `node:`.
- Sort each present block alphabetically by imported binding name.
- Omit empty blocks, but keep a single blank line between the blocks that exist.
- Prefer kebab-case for new repo-authored JavaScript, TypeScript, and helper filenames unless the toolchain expects a fixed conventional name.
10. Apply JavaScript implementation notes when the task touches CLIs or automation code.
- Use ESM bin scripts with `#!/usr/bin/env bun` when authoring true JavaScript CLIs in this repo style.
- Prefer `colorette` for style-consistent terminal output.
- Prefer a single logging helper built on `node:util` (`format`, `inspect`) instead of scattered direct `console.*` usage.
- Prefer `node:fs/promises` for async file operations and `realpath()` for robust path comparisons.
- For repository-aware defaults, discover project root from `.git` or `package.json`, scan for marker directories, ignore large unrelated directories such as `node_modules` and `.git`, error on zero or multiple matches, and surface the resolved default in help output.
11. Replace npm-specific JavaScript runtime commands when the task includes Bun migration.
- Replace `npm install -g` helpers with `bunx --bun --package <pkg>@<version> <bin> ...`.
- Replace `npm pack --json --dry-run` with Bun equivalents such as `bun pm pack --dry-run --ignore-scripts` and adapt parsing.
12. Update docs and examples when the task changes runtime or module expectations.
- Rewrite README or workflow snippets from Node/npm commands to Bun commands when appropriate.
- Document new Bun-specific inputs, configuration files, or remaining migration phases explicitly.
13. Pull from `tanaab-testing`, `tanaab-github-actions`, `tanaab-shell`, or `tanaab-templates` when the task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the JavaScript skill.
- [assets/tanaab-javascript-icon.png](./assets/tanaab-javascript-icon.png): UI icon for the JavaScript skill.
- [references/repo-structure.md](./references/repo-structure.md): preferred purpose-driven repo structure and `utils/` boundaries for JavaScript projects.
- [references/function-data-flow.md](./references/function-data-flow.md): preferred JavaScript unit shape for one-way data flow, minimal mutation, and grouped imports.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task actually requires JavaScript or TypeScript handling.
- Confirm this skill stayed the primary owner only for JavaScript or TypeScript surfaces.
- Confirm JavaScript module code uses ESM rather than CommonJS unless the user explicitly required CommonJS compatibility.
- Confirm repo-authored JavaScript CLI entrypoints use `#!/usr/bin/env bun` rather than a Node shebang.
- Confirm `.bun-version` and `.tool-versions` reflect the repo's Bun-first runtime policy when those files are in scope.
- Confirm code is organized by purpose rather than by implementation type when the task touches repo structure.
- Confirm `utils/` modules are single-purpose, single-export, generic helpers without repo-specific language.
- Confirm functions normalize input at the boundary, keep data flow mostly one-way, and minimize mutable working variables.
- Confirm arrays or objects from outside the current function are not mutated without cloning or other explicit isolation.
- Confirm small repos are not forced into unnecessary folder sprawl when only a few JavaScript files exist.
- Confirm only true CLIs live under `bin/` and carry a hashbang, and that non-CLI scripts are run via `bun ./path/to/script.js` or `node ./path/to/script.js`.
- Confirm skill-bundled scripts remain under the skill's own `scripts/` directory instead of being promoted into the repo package `bin/`.
- Confirm imports use present built-in, external, and local blocks separated by single blank lines and ordered alphabetically within each block.
- Run `bun install --frozen-lockfile --ignore-scripts` when Bun plumbing changed.
- Run `bun run lint`.
- Run `bun run build` or equivalent artifact generation when build or distribution output changed.
- Re-run the relevant test or CI commands used by the repository when runtime or module behavior changed.
- Confirm no stale Node/npm or CommonJS references remain when the task explicitly migrated away from them.
- Confirm generated outputs remain executable and artifact paths stayed stable where workflows depend on them.
- Confirm cross-skill handoffs are explicit when testing, workflow wiring, shell behavior, or templates are involved.
