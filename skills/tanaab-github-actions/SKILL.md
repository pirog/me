---
name: tanaab-github-actions
description: Guide GitHub Actions workflow authoring and GitHub-hosted CI triage under the shared Tanaab coding structure.
---

# Tanaab GitHub Actions

## Overview

Use this skill for GitHub Actions workflow authoring and GitHub-hosted CI triage within the Tanaab coding hierarchy.

## When to Use

- The request targets GitHub Actions workflow YAML, reusable workflows, composite actions, or CI job structure.
- The task is primarily about GitHub-hosted workflow authoring rather than general shell or application code.
- The user asks to debug or fix failing GitHub Actions PR checks.
- The task updates CI or release workflows for Bun, testing, or release gates.

## When Not to Use

- Do not use this skill for external CI providers.
- Do not use this skill alone when the actual implementation change belongs primarily to shell, JavaScript, or application code.
- Do not apply code changes immediately in CI triage mode before inspecting the failing checks and getting approval on a fix plan.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Primary ownership: workflow YAML, workflow triggers, permissions, job topology, reusable workflow structure, and GitHub-hosted CI triage.
- Defer shell-step internals to `tanaab-shell`.
- Defer JavaScript action code and runtime/package changes to `tanaab-javascript`.
- Defer test content and coverage policy to `tanaab-testing`.
- Defer changelog and release-note narrative to `tanaab-release`.
- Pair with `tanaab-shell` for shell-heavy workflow steps.
- Pair with `tanaab-javascript` when JavaScript action code, bundling, or Bun runtime changes are involved.
- Pair with `tanaab-testing` when CI jobs need test or coverage gates.
- Pair with `tanaab-release` when release or deploy workflows are in scope.
- Use `tanaab-templates` when a reusable workflow scaffold or job pattern should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Determine the mode: workflow authoring or CI triage.
3. For workflow authoring or updates, scope the workflow surface: workflow files, jobs, steps, permissions, triggers, reusable workflow boundaries, and release or deploy gates.

- Replace `actions/setup-node` with `oven-sh/setup-bun` when migrating workflows to Bun.
- Prefer `bun-version-file: .bun-version` over repeating Bun version literals in multiple workflow jobs.
- When a workflow needs Bun, install it with `oven-sh/setup-bun@v2` and then run `bun install --frozen-lockfile --ignore-scripts` unless lifecycle scripts are explicitly required.
- Replace `npm run ...` with `bun run ...` in workflow jobs.
- Keep OS and version test matrices intact unless the runtime manager itself is changing.
- Preserve fixed workflow filenames and GitHub Actions loader conventions, but use kebab-case for repo-authored helper scripts and local support files.
- For JavaScript actions or composite wrappers, ensure runtime wiring still emits the expected artifacts and pass required `INPUT_*` values explicitly when the wrapper depends on them.
- Update Dependabot ecosystem settings from `npm` to `bun` where applicable.

4. For CI triage, inspect failing checks before proposing a fix.

- Run `gh auth status` in the target repository.
- If unauthenticated, ask the user to run `gh auth login` with repo and workflow scopes before proceeding.
- Prefer resolving the current branch PR with `gh pr view --json number,url` unless the user already provided a PR number or URL.
- Preferred inspection path: run the bundled script `python "<path-to-skill>/scripts/inspect-pr-checks.py" --repo "." --pr "<number-or-url>"`.
- Add `--json` when machine-readable output is useful.
- Manual fallback: use `gh pr checks`, `gh run view`, and `gh api` when the bundled script is not enough.
- If the failing provider is external rather than GitHub Actions, report the details URL and stop there.

5. Summarize and plan before implementation in CI triage mode.

- Provide the failing check name, run URL, and a concise failure snippet.
- Call out missing logs explicitly.
- Draft a focused fix plan and request approval before implementing.

6. Pull from `tanaab-shell`, `tanaab-javascript`, `tanaab-testing`, `tanaab-release`, or `tanaab-templates` when the workflow depends on shared shell logic, runtime wiring, gates, release flow, or reusable scaffolds.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the GitHub Actions skill.
- [assets/tanaab-github-actions-icon.png](./assets/tanaab-github-actions-icon.png): UI icon for the GitHub Actions skill.
- [scripts/inspect-pr-checks.py](./scripts/inspect-pr-checks.py): fetch failing PR checks, pull GitHub Actions logs, and extract a failure snippet
- [references/inspect-pr-checks-license.txt](./references/inspect-pr-checks-license.txt): license file for the bundled inspection helper

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task is actually GitHub Actions-led.
- Confirm this skill stayed the primary owner only for workflow or CI-triage surfaces.
- Confirm workflows that install Bun use `oven-sh/setup-bun@v2`, `bun-version-file: .bun-version`, and `bun install --frozen-lockfile --ignore-scripts` unless the task explicitly needs different install behavior.
- Confirm the failing provider is GitHub Actions before attempting deep CI triage.
- Confirm the summary includes the failing check name, URL, and useful failure snippet when triaging CI.
- Confirm no code changes are applied before approval when the task started in CI triage mode.
- Confirm any template use came from `tanaab-templates`.
