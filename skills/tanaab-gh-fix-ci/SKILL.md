---
name: "tanaab-gh-fix-ci"
description: "Use when a user asks to debug or fix failing GitHub PR checks that run in GitHub Actions; use `gh` to inspect checks and logs, summarize failure context, draft a fix plan, and implement only after explicit approval. Treat external providers (for example Buildkite) as out of scope and report only the details URL."
---

# GitHub Fix CI

## Overview

Use gh to locate failing PR checks, fetch GitHub Actions logs for actionable failures, summarize the failure snippet, then propose a fix plan and implement after explicit approval.
- If a plan-oriented skill (for example `create-plan`) is available, use it; otherwise draft a concise plan inline and request approval before implementing.

Prereq: authenticate with the standard GitHub CLI once (for example, run `gh auth login`), then confirm with `gh auth status` (repo + workflow scopes are typically required).

## When to Use

- Debug or fix failing GitHub Actions checks for a PR.
- Summarize GitHub-hosted CI failures before proposing a fix.
- Triage CI only after confirming the failing provider is GitHub Actions rather than an external system.

## Workflow

1. Verify access and resolve the PR.
- Run `gh auth status` in the repo.
- If unauthenticated, ask the user to run `gh auth login` with repo and workflow scopes before proceeding.
- Prefer the current branch PR via `gh pr view --json number,url`.
- If the user provides a PR number or URL, use that directly.

2. Inspect failing checks.
- Preferred: run the bundled script, which handles gh field drift and job-log fallbacks.
- Command: `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "<number-or-url>"`
- Add `--json` when machine-friendly output is useful.
- Manual fallback: `gh pr checks <pr> --json name,state,bucket,link,startedAt,completedAt,workflow`
- If a field is rejected, rerun with the available fields reported by `gh`.
- For each failing GitHub Actions run, inspect `gh run view <run_id> --json ...` and `gh run view <run_id> --log`.
- If the run log is still in progress, fetch job logs directly with `gh api`.

3. Scope external providers correctly.
- If `detailsUrl` is not a GitHub Actions run, label it as external and only report the URL.
- Do not attempt Buildkite or other external CI providers.

4. Summarize and plan before implementation.
- Provide the failing check name, run URL, and a concise log snippet.
- Call out missing logs explicitly.
- Draft a focused fix plan and request approval before implementing.

5. Implement only after approval and then recheck.
- Apply the approved plan, summarize diffs and tests, and ask about opening a PR.
- Suggest re-running the relevant tests and `gh pr checks` to confirm the fix.

## Bundled Resources

- [scripts/inspect_pr_checks.py](./scripts/inspect_pr_checks.py): fetches failing PR checks, pulls GitHub Actions logs, and extracts a failure snippet
- Example: `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "123"`
- Example: `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "https://github.com/org/repo/pull/123" --json`
- Example: `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --max-lines 200 --context 40`

## Validation

- Confirm the failing provider is GitHub Actions before attempting deep inspection.
- Confirm the summary includes the failing check name, URL, and a useful failure snippet when available.
- Confirm no code changes are applied until the user approves the plan.
