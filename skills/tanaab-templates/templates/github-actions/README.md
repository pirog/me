# GitHub Actions Templates

Use these templates when a Tanaab coding task needs reusable GitHub Actions workflow scaffolding.

## Available Templates

- `bun-javascript-action-smoke-workflow.yml`: starter workflow for invoking a repo-local Bun-backed JavaScript action with `uses: ./` and validating observable postconditions afterward.

## Scope

- This starter assumes the action installs Bun, builds from repo source, and then runs via `uses: ./`.
- Keep the workflow assertions focused on observable postconditions such as written files, tags, config changes, or verification state.
- Pair this template with `templates/testing/github-action-input/` when the action also needs focused unit tests for `@actions/core` input parsing.
