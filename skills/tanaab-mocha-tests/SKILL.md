---
name: tanaab-mocha-tests
description: Add focused Mocha unit tests for JavaScript utility modules with minimal dependencies and enforce coverage thresholds. Use when a user asks to add/expand unit tests, structure tests under a dedicated test folder, enforce naming conventions (for example `X.spec.js` and `should ...` test names), and gate release/deploy workflows with test checks.
---

# Mocha Tests

## Overview

Use this skill to implement Part III-style unit testing with Mocha while keeping dependency footprint low and CI policy explicit.

## When to Use

- Add focused Mocha tests for JavaScript utility modules.
- Introduce or tighten release-gating test coverage.
- Standardize test folder layout and naming conventions.

## When Not to Use

- Do not use this skill for broad integration-test suites, browser E2E work, or non-JavaScript test stacks.
- Do not use this skill when the request is only to migrate runtime or module format without adding or changing tests.

## Relationship to Other Skills

- Pair with `tanaab-esmify` or `tanaab-bunify` after migrations that need targeted regression coverage.
- Pair with `tanaab-cli-styles` when CLI changes need dedicated utility or argument-parsing tests.

## Workflow

1. Add minimal test dependencies.
- Add `mocha` for test execution.
- Add `c8` only when coverage enforcement/reporting is required.
- Prefer built-in Node modules (`node:assert/strict`, `node:fs`, `node:path`, `node:os`) over extra assertion/stubbing libraries.

2. Add one test file per utility module.
- Create a top-level `test/` directory.
- For every `utils/X.js`, create `test/X.spec.js`.
- Keep scope limited to utility units only when requested; do not expand into integration tests.

3. Follow naming and style conventions.
- Name tests with `it('should ...')`.
- Keep test setup/teardown local to each spec file.
- Cover normal paths, edge cases, and error paths so each targeted file reaches at least 80% coverage.

4. Add test scripts in package metadata.
- Add a `test` script that runs mocha (optionally through c8 coverage checks).
- For per-file thresholds, prefer:
`c8 --all --include "utils/*.js" --check-coverage --per-file --lines 80 mocha "test/**/*.spec.js"`

5. Wire CI as a release or deploy gate.
- Do not add `bun run test` to every workflow by default.
- Add `bun run test` only to workflows that roll a release or deploy artifacts.
- Place the test step before build/publish/deploy steps so failures block deployment.
- If it does not exist add a standalon PR unit-test workflow file to run the unit tests

## Bundled Resources

- No bundled scripts. Apply the testing workflow directly in the target repository.

## Validation

- Run `bun run test`.
- Run `bun run lint` if linting is part of repo standards.
- Confirm test coverage output meets requested thresholds.
