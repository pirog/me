# MORNING CLOSEOUT

Run the Piro morning closeout for the current local date.
Use `$piro-morning-closeout` in archive mode and follow its complete current contract.
Managed automation id: `morning-closeout`.

## Required preflight capabilities

- `$piro-morning-closeout` and `$piro-clean-up-task` with their complete current contracts.
- Trustworthy native GitHub identity and reads for issue closures, pull-request merges, verified
  delivery relationships, and complete pagination. Apply
  [`GitHub Read Access`](../references/github-read-access.md) connector-first and require `pirog`.
  Wrong identity or incomplete, malformed, or untrustworthy final GitHub data hard fails the run.
- Read access to [`WORK_REPOS.md`](../WORK_REPOS.md). Use `pirog/*` and `tanaabased/*`, exclude
  `tanaabased/big-test-bucket`, and explicitly exclude `lando/*` for this scheduled invocation.
- Bun plus the installed `$piro-morning-closeout` helper for versioned reporting state outside Git.
- Native Codex operations for current-host task listing, exact reads, archival, and archived-task
  read-back under [`Codex Task Access`](../references/codex-task-access.md). A capped or unavailable
  Codex listing limits cleanup but does not suppress a complete GitHub report.

Use only reads during preflight. Capture the run start once before discovery. Never test readiness
with a GitHub write, task mutation, or state checkpoint.

Run the helper's `window`, `plan`, and `commit` modes through standard-input JSON as directed by the
skill. Discover GitHub from the bounded overlap, report only events inside the exact interval, and
exhaust every page. Advance the cutoff only after complete GitHub reporting passes the plan-digest
check. Preserve that reporting success if later Codex cleanup degrades or fails.

Report qualifying completed issues and merged changes independently, with every attribution reason
and shared assignment. A merge does not complete an issue. GitHub closure reports provider state,
not an independent acceptance audit. Count only verified Work size from qualifying completed issues;
list PR-only work, report tasks, body-only or unavailable sizes, and already credited issues as
exclusions. Report a reclosure without crediting the same issue's Work size twice.

For cleanup, start with `list_threads(limit=50)`, inspect pinned tasks, and work only on the current
local host. Never target this task, interrupt a running task, or unpin anything. Consider only idle
Codex-managed Git worktrees and earlier projectless reports carrying an exact managed automation
marker. Read each exact candidate, reread it immediately before mutation, and hand it separately to
`$piro-clean-up-task` in archive mode. Preserve every cleanup gate and retain blocked work.

Do not merge pull requests, close or assign issues, delete branches or worktrees, edit repositories,
or repair missing evidence through writes. Runtime reporting state is the only non-Codex mutation.

Return `# MORNING CLOSEOUT — <local YYYY-MM-DD>` with:

- `## Completed Issues`
- `## Merged Changes`
- `## Completed Work Size`
- `## Codex Cleanup`
- `## Coverage and Limitations`

State the actor, scope, exact interval, GitHub checkpoint result, independent GitHub and Codex
coverage, every exclusion, and the state deliberately left unchanged. Omit private transcripts,
local task ids, credentials, and machine-specific paths from public evidence.
