# GitHub Actions Templates

Use these templates when a Tanaab coding task needs reusable GitHub Actions workflow scaffolding.

## Available Templates

- `bun-javascript-action-smoke-workflow.yml`: starter workflow for invoking a repo-local Bun-backed JavaScript action with `uses: ./` and validating observable postconditions afterward.
- `hosted-shell-leia-example-tests.yml`: starter workflow for running Leia-backed example matrices against a prepared hosted-shell `dist/` entrypoint.

## Scope

- The Bun JavaScript action smoke workflow assumes the action installs Bun, builds from repo source, and then runs via `uses: ./`.
- Keep workflow assertions focused on observable postconditions such as written files, tags, config changes, or verification state.
- Pair the Bun JavaScript action smoke workflow with `templates/testing/github-action-input/` when the action also needs focused unit tests for `@actions/core` input parsing.
- The hosted-shell Leia workflow assumes the repo builds a `dist/` directory, prepares the distributed shell entrypoint before smoke tests, and runs each example README as its own matrix job.
- Adapt the install step, distribution-prep step, and Leia invocation to the repo's actual toolchain rather than assuming Bun or `prepare-release-action`.
- Pair the hosted-shell Leia workflow with `templates/testing/leia-markdown-example/README.md` when the repo needs executable example docs with `Setup`, `Testing`, and `Destroy tests` sections.
