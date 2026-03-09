---
name: bunify
description: Migrate repositories from Node.js/npm-centric tooling to Bun-centric tooling. Use when a user asks to switch a project to Bun, remove Node/npm plumbing, update CI workflows, regenerate lockfiles, and keep release/test pipelines working during the transition.
---

# Bunify

## Overview

Use this skill to perform a phased migration from Node.js/npm to Bun with minimal behavior change. Start with plumbing changes first so CI and packaging are stable before deeper code/runtime refactors.

## 1. Update Plumbing

Apply these repository-level changes first.

1. Update package manager metadata and lockfiles.
- Set `packageManager` in `package.json` to the pinned Bun version.
- Replace `engines.node` with `engines.bun` when appropriate.
- Generate and commit `bun.lock`.
- Remove `package-lock.json` and `.node-version`.
- Add `.bun-version` and update `.tool-versions` to `bun <version>`.

1. Update build/lint scripts to Bun invocations.
- Convert scripts to `bun run ...` or `bunx --bun ...`.
- Keep script names stable (`lint`, `build`, etc.) unless the user asks otherwise.
- If bundling action code, ensure the bundle step still outputs expected artifacts (for example `dist/index.js`).
- Optionally, when a repo currently uses `@vercel/ncc` (or another JS bundler) to emit a single-file runtime bundle, evaluate replacing it with `bun build`.
- For Bun bundling that must land at `dist/index.js`, prefer `--outdir dist --entry-naming index.js` over `--outfile` if path behavior is inconsistent.
- Remove bundler-specific artifacts (for example `dist/licenses.txt`, `dist/sourcemap-register.js`) only when they are no longer required by release/compliance workflows.

1. Update GitHub Actions workflows.
- Replace `actions/setup-node` with `oven-sh/setup-bun`.
- Prefer `bun-version-file: .bun-version` over matrix Bun version variables for consistency.
- Replace install commands with `bun install --frozen-lockfile --ignore-scripts` unless lifecycle scripts are explicitly required.
- Replace `npm run ...` with `bun run ...` in all workflow jobs.
- Keep OS/version test matrices intact except for runtime manager changes.

1. Update action/release plumbing and automation metadata.
- For JavaScript actions, migrate runtime wiring to Bun-compatible execution.
- If using a composite action wrapper, pass all `INPUT_*` vars explicitly and execute with `bun`.
- Update Dependabot ecosystem from `npm` to `bun` where applicable.

1. Replace npm-specific runtime commands in repo scripts/code.
- Replace `npm install -g` helpers with `bunx --bun --package <pkg>@<version> <bin> ...`.
- Replace `npm pack --json --dry-run` with Bun equivalents (for example `bun pm pack --dry-run --ignore-scripts`) and adapt parsing.
- Move new helpers into `utils/` modules following existing module export conventions.

1. Update documentation and examples.
- Rewrite README and workflow snippets from Node/npm commands to Bun commands.
- Document any new Bun-specific inputs or configuration files.
- Keep migration notes explicit about what changed and what remains for later phases.

1. Validate before opening a PR.
- Run `bun install --frozen-lockfile --ignore-scripts`.
- Run `bun run lint`.
- Run `bun run build` (or equivalent artifact generation).
- Confirm no stale Node/npm references remain in first-party files.
- Regenerate and commit build artifacts expected by the repository.
