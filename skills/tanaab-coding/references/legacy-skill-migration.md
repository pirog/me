# Legacy Skill Migration

## Overview

Use this reference to phase legacy standalone skills into the expanded Tanaab coding stack without losing their strongest guidance.

## Status

- The target stack now includes `tanaab-javascript`, `tanaab-testing`, and `tanaab-release`.
- The legacy standalone workflows have been absorbed into the target skills listed below.
- The legacy standalone skills can now be retired once live skill links are resynced.

## Target Structure

- `tanaab-coding`: umbrella router
- `tanaab-coding-core`: shared doctrine
- `tanaab-javascript`: JavaScript and TypeScript implementation, runtime, package metadata, bundling, and module-system work
- `tanaab-css`: styling and layout work
- `tanaab-vue`: Vue framework work
- `tanaab-shell`: shell scripting, CLI automation, and command-line contract work
- `tanaab-github-actions`: GitHub Actions workflow authoring and CI workflow structure
- `tanaab-testing`: test strategy, focused test implementation, coverage gates, and CI test wiring
- `tanaab-release`: changelog drafting, release preparation, and release readiness
- `tanaab-templates`: reusable templates and scaffolds

## Legacy Skill Mapping

### `tanaab-bunify`

- Move Bun runtime, `package.json`, lockfile, bundling, and module-entry guidance into `tanaab-javascript`.
- Move workflow and release-plumbing changes into `tanaab-github-actions`.
- Move shell-wrapper and command-execution details into `tanaab-shell`.
- Move reusable Bun migration snippets into `tanaab-templates`.
- Retired `tanaab-bunify` as a standalone skill after absorbing its workflow into those four skills.

### `tanaab-cli-styles`

- Move CLI contract, help-output order, env-var precedence, logging, exit-code, and safety-guard guidance into `tanaab-shell`.
- Move JavaScript-specific CLI implementation notes into `tanaab-javascript`.
- Move reusable CLI scaffolds into `tanaab-templates`.
- Retired `tanaab-cli-styles` as a standalone skill after the shell and JavaScript skills covered both contract and implementation guidance.

### `tanaab-esmify`

- Move module-system conversion, package metadata, import ordering, and ESM output guidance into `tanaab-javascript`.
- Pair that work with `tanaab-testing` when migrations need regression coverage.
- Retired `tanaab-esmify` as a standalone skill after ESM guidance was fully represented in `tanaab-javascript`.

### `tanaab-gh-fix-ci`

- Move GitHub-hosted CI inspection and failure-triage workflow into `tanaab-github-actions`.
- Keep its bundled `inspect_pr_checks.py` script with the GitHub Actions skill.
- Use `tanaab-shell`, `tanaab-javascript`, or `tanaab-testing` as follow-on skills after the failing surface is identified.
- Retired `tanaab-gh-fix-ci` as a standalone skill after `tanaab-github-actions` covered both authoring and debugging modes.

### `tanaab-mocha-tests`

- Move focused JavaScript and TypeScript unit-test guidance, coverage thresholds, and release-gate wiring into `tanaab-testing`.
- Keep Mocha-specific conventions as one testing mode rather than a standalone skill.
- Move reusable test scaffolds into `tanaab-templates`.
- Retired `tanaab-mocha-tests` as a standalone skill after `tanaab-testing` owned the test-policy surface.

### `tanaab-changelog-updates`

- Move changelog drafting, linked release-note writing, and release-summary workflow into `tanaab-release`.
- Keep release gating and workflow coordination split across `tanaab-release`, `tanaab-testing`, and `tanaab-github-actions`.
- Retired `tanaab-changelog-updates` as a standalone skill after `tanaab-release` fully owned release-facing writing.

## Applied Order

1. Absorbed `tanaab-esmify` and the JavaScript portions of `tanaab-bunify` into `tanaab-javascript`.
2. Absorbed `tanaab-cli-styles` into `tanaab-shell` and `tanaab-javascript`.
3. Absorbed `tanaab-mocha-tests` into `tanaab-testing`.
4. Absorbed `tanaab-gh-fix-ci` into `tanaab-github-actions`.
5. Absorbed `tanaab-changelog-updates` into `tanaab-release`.
6. Moved retained reusable assets and helpers into the broader coding stack.
7. Removed the legacy standalone skills after the replacement skills were updated, validated, and synced live.
