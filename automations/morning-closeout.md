# MORNING CLOSEOUT

Run the Piro morning closeout for the current local date.
Use `$piro-morning-closeout` in archive mode and follow its complete safety contract.
Managed automation id: `morning-closeout`.

## Required preflight capabilities

- `$piro-morning-closeout` and `$piro-clean-up-task` with their complete current contracts.
- Trustworthy GitHub identity and reads for completed issues, merged pull requests, delivery
  relationships, and complete pagination. Apply
  [`GitHub Read Access`](../references/github-read-access.md) connector-first and require `pirog`.
- Read access to [`WORK_REPOS.md`](../WORK_REPOS.md). Use `pirog/*` and `tanaabased/*`, exclude
  `tanaabased/big-test-bucket`, and exclude `lando/*` for this scheduled invocation.
- Native Codex operations for current-host active and pinned task listing, exact task reading,
  archival, and archived-task read-back under
  [`Codex Task Access`](../references/codex-task-access.md).

Use only reads during preflight. Do not begin reporting or archival when GitHub identity or required
GitHub data is unavailable, incomplete, malformed, or untrustworthy. A capped or unavailable Codex
listing limits cleanup coverage without changing independently verified GitHub results.

Capture the run start once. Report GitHub events in the exact interval after the immediately
preceding scheduled Morning Closeout boundary through the run start; Monday therefore covers the
interval since Friday at 04:00 local time. Do not claim recovery of an arbitrarily missed run.

Discover qualifying issues closed and pull requests merged across the reviewed scope. Exhaust
pagination and verify exact timestamps, actor attribution, shared responsibility, and delivery
relationships. A pull-request merge does not imply issue completion. Count only directly verified
Work size from qualifying completed issues; list pull-request-only work and unknown sizes as
exclusions.

For cleanup, start with `list_threads(limit=50)` and inspect pinned tasks. Work only on current-host
tasks. Never target this task, interrupt a running task, or unpin anything. Consider only idle
Codex-managed Git worktree tasks and earlier projectless reports carrying an exact managed
automation marker. Read each candidate, repeat the exact target read immediately before archival,
and hand it separately to `$piro-clean-up-task` in archive mode. Preserve every cleanup gate and
retain blocked work.

Do not merge pull requests, close or assign issues, delete branches or worktrees, edit repositories,
or repair missing evidence through writes.

Return `# MORNING CLOSEOUT — <local YYYY-MM-DD>` with:

- `## Completed Work`
- `## Codex Cleanup`
- `## Completed Capacity`
- `## Coverage and Limitations`

State the exact interval, repository scope, attribution reasons, Work size exclusions, independent
GitHub and Codex coverage, cleanup results, and state deliberately left unchanged. Omit private
transcripts, local task ids, credentials, and machine-specific paths from public evidence.
