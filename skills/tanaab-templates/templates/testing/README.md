# Testing Templates

Use these templates when a Tanaab coding task needs a reusable test starter.

## Available Templates

- `github-action-input/README.md`: guidance for focused JavaScript GitHub Action input parsing tests.
- `github-action-input/get-inputs.spec.js`: Mocha starter for stubbing `@actions/core` getters and restoring env state cleanly.
- `leia-markdown-example/README.md`: starter scenario README for Leia-backed shell or bootstrap examples that double as executable documentation.

## Choosing a Template

- Use the GitHub Action input template when the action has a dedicated `get-inputs.js` or similar helper that wraps `@actions/core` getters.
- Keep this unit-test pattern focused on input normalization and fallback behavior.
- Pair it with workflow-driven `uses: ./` smoke tests when the action needs real runner, checkout, permissions, or matrix coverage.
- Use the Leia markdown example template when the repo needs end-to-end shell, bootstrap, or hosted-script scenarios that are easier to express as executable README steps than as unit tests.
- Keep Leia scenarios scoped to one observable flow, use example-local `.tmp/` scratch paths, and pair them with a dedicated workflow when the suite mutates machine state or needs secrets.
- Format Leia steps as fenced code blocks with one `# should ...` header per test, commands directly below the header, and blank lines only between tests.
