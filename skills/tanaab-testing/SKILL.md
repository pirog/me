---
name: tanaab-testing
description: Guide test strategy, focused JavaScript and TypeScript test work, coverage policy, and CI or release test gating under the shared Tanaab coding structure.
---

# Tanaab Testing

## Overview

Use this skill for testing strategy, targeted test implementation, coverage policy, and test gating within the Tanaab coding hierarchy.

## When to Use

- The request adds, expands, or tightens test coverage for repository code.
- The task needs unit-test structure, coverage policy, or test-gate wiring in CI or release workflows.
- The user wants focused regression protection after implementation changes.
- The request specifically calls for Mocha-based unit tests or per-file coverage enforcement for JavaScript or TypeScript utility modules.

## When Not to Use

- Do not use this skill for implementation-only work that does not add or change tests.
- Do not use this skill for browser E2E or non-repository test systems unless the user asks for them explicitly.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Pair with `tanaab-javascript` for JavaScript or TypeScript test implementation.
- Pair with `tanaab-github-actions` when tests or coverage gates need CI workflow changes.
- Pair with `tanaab-release` when test results gate release readiness.
- Use `tanaab-templates` when a reusable test scaffold or fixture pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the testing surface: target modules, desired test depth, coverage expectations, and workflow gates.
3. Add minimal test dependencies.
- Add `mocha` for test execution when the repository uses the Mocha path.
- Add `c8` only when coverage enforcement or coverage reporting is required.
- Prefer built-in runtime modules such as `node:assert/strict`, `node:fs`, `node:path`, and `node:os` over extra assertion or stubbing libraries when possible.
4. Add or update focused tests.
- Create a top-level `test/` directory when introducing this style for the first time.
- For `utils/X.js`, prefer `test/X.spec.js`.
- Keep scope limited to the requested unit surface instead of expanding into integration tests.
- Name tests with `it('should ...')`.
- Keep setup and teardown local to each spec file.
- Cover normal paths, edge cases, and error paths.
5. Add or update test scripts and coverage policy.
- Add a `test` script that runs Mocha, optionally through `c8`.
- For per-file thresholds, prefer `c8 --all --include "utils/*.js" --check-coverage --per-file --lines 80 mocha "test/**/*.spec.js"` when that scope matches the repo.
6. Wire CI and release gates intentionally.
- Do not add `bun run test` to every workflow by default.
- Add `bun run test` to release, deploy, or dedicated PR validation workflows when the repository needs those gates.
- Place test steps before build, publish, or deploy steps so failures block downstream actions.
- Add a standalone PR unit-test workflow when one is needed and does not already exist.
7. Pull from `tanaab-javascript`, `tanaab-github-actions`, `tanaab-release`, or `tanaab-templates` when the task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the testing skill.
- [assets/tanaab-testing-icon.png](./assets/tanaab-testing-icon.png): UI icon for the testing skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the test scope matches the request.
- Confirm any CI or release gate changes are explicit.
- Run `bun run test`.
- Run `bun run lint` when linting is part of repo standards.
- Confirm coverage output meets the requested threshold when coverage was part of the task.
- Confirm any template use came from `tanaab-templates`.
