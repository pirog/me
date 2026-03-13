# JavaScript Action Conventions

Use these rules for GitHub Action repositories whose runtime logic is authored in JavaScript and executed with Bun under the Tanaab stack.

## Runtime Shape

- Prefer `runs.using: "composite"` even for JavaScript-backed actions so the wrapper can install Bun and execute the built runtime artifact explicitly.
- Keep the real runtime logic in ESM JavaScript files and keep `action.yml` focused on inputs, setup, and invoking the built artifact.
- Export action inputs into `INPUT_*` env vars explicitly in the composite step when the runtime code relies on `@actions/core` getters.
- Keep the entrypoint path stable, usually `${{ github.action_path }}/dist/index.js`.

## Build and Distribution

- Compile the runtime with `bun build` to `dist/index.js`.
- Prefer a build script such as `bun build ./entry.js --target=bun --format=esm --sourcemap=linked --outdir dist --entry-naming index.js`.
- Commit `dist/index.js` and related sourcemaps when action consumers load the action directly from repository refs or Marketplace tags.
- Keep `package.json` `main` and `exports` aligned to the built artifact when the repo is also published as a package.
- Use `prepare` or equivalent release plumbing so committed action artifacts do not drift from source.

## Tests and Workflows

- Keep input parsing in a dedicated helper such as `utils/get-inputs.js`.
- Unit test that helper by stubbing `@actions/core` getter methods and toggling `process.env.GITHUB_ACTIONS` so local-default and real Actions-runtime behavior are both covered.
- Use `uses: ./` in workflow-driven smoke tests for end-to-end action behavior, permissions, sync flows, or OS matrix coverage.
- Split PR workflows by surface when the repo benefits from separate lint, unit, options, and sync validation.
- Use `fetch-depth: 0` only in workflows that actually need tags, full history, or sync behavior.
- In workflow-driven smoke tests, assert observable postconditions after the action runs, such as file mutations, tags, config changes, or verification state.
- Prefer one assertion step per postcondition, use `if: always()` when later checks should still execute after a failure, and emit `::notice` or `::error` annotations with a real non-zero exit code.
- Keep assertion steps short and shell-native until the logic becomes complex enough to extract into a repo-authored helper script.
- When a workflow needs Bun, install it with `oven-sh/setup-bun@v2`, prefer `bun-version-file: .bun-version`, and run `bun install --frozen-lockfile --ignore-scripts` unless lifecycle scripts are explicitly required.

## README and Repo Metadata

- Use the GitHub Action README variant so inputs, outputs, caveats, and usage stay in `README.md`, which is the Marketplace and repository entrypoint.
- Pin Bun with `.bun-version`, `packageManager`, and optionally `.tool-versions` when the repo tracks local tool versions there.
- Prefer Dependabot entries for both `bun` and `github-actions` ecosystems when the repo depends on them.
- Dogfood the action in repo workflows when that gives useful integration coverage.
