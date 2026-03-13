# Testing Templates

Use these templates when a Tanaab coding task needs a reusable test starter.

## Available Templates

- `github-action-input/README.md`: guidance for focused JavaScript GitHub Action input parsing tests.
- `github-action-input/get-inputs.spec.js`: Mocha starter for stubbing `@actions/core` getters and restoring env state cleanly.

## Choosing a Template

- Use the GitHub Action input template when the action has a dedicated `get-inputs.js` or similar helper that wraps `@actions/core` getters.
- Keep this unit-test pattern focused on input normalization and fallback behavior.
- Pair it with workflow-driven `uses: ./` smoke tests when the action needs real runner, checkout, permissions, or matrix coverage.
