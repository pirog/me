# Leia Markdown Scenarios

Use this pattern when shell, bootstrap, or other operational repos need scenario coverage that is easier to express as executable shell steps than as unit tests.

## When to Use

- The main risk is end-to-end behavior, machine mutation, CLI contract, file layout, permissions, or log output.
- The repo already explains supported flows through example directories and those examples can double as runnable coverage.
- The suite may need fresh runners, secrets, or destructive setup and cleanup that do not fit a normal local `bun run test` path.

## Example Shape

- Put each scenario in its own example directory.
- Keep the scenario contract in `examples/<scenario>/README.md`.
- Use the README as both scenario documentation and executable test coverage.
- Keep fixtures beside the README so each example stays self-contained.

## README Structure

Recommended sections:

1. Title and one-paragraph summary of the scenario
2. `## Setup`
3. `## Testing`
4. `## Destroy tests`

## Scenario Rules

- Keep one scenario per README instead of combining many unrelated flows.
- Use example-local scratch paths such as `.tmp/` so setup and cleanup stay scoped.
- Prefer shell-native assertions against observable behavior such as files, symlinks, permissions, logs, exit status, and installed tools.
- Assert the user-facing contract, not internal implementation details.
- Use comments like `# should ...` so the scenario still reads like documentation.
- Always include cleanup in `Destroy tests`, even when CI runners are ephemeral.

## CI Guidance

- Prefer fresh-runner CI execution when the scenario mutates machine state, installs packages, or needs secrets.
- Matrix one workflow job per example when failures should identify the exact broken scenario quickly.
- When the distributed artifact is the real product surface, run Leia against the prepared `dist/` entrypoint rather than the raw source file.
- Prefer a repo-local `TMPDIR` for Leia runs when sandbox or runner temp behavior is unreliable.

## Boundaries

- Use Mocha or other unit tests for pure parsing, transformation, or helper logic.
- Use Leia scenarios for observable operational flows that would be awkward, misleading, or brittle as unit tests.
