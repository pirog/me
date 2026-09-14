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

Use only listing and reading during preflight. Do not begin reporting or archival when GitHub
identity or required GitHub data is unavailable, incomplete, malformed, or untrustworthy. A capped
or unavailable Codex listing limits cleanup without changing independently verified GitHub results.

Capture the run start once. Report GitHub events after the immediately preceding scheduled Morning
Closeout boundary through the run start; Monday therefore covers the interval since Friday at 04:00
local time. Do not claim recovery of an arbitrarily missed run.

Discover qualifying issues closed and pull requests merged across the reviewed scope. Exhaust
pagination and verify exact timestamps, attribution, shared responsibility, and delivery
relationships. A pull-request merge does not imply issue completion.

For Codex cleanup, start with `list_threads(limit=50)`. A valid capped result is usable partial
evidence: do not repeat the identical read, process only exact visible candidates, and state
`active-task discovery was incomplete`. An unavailable or malformed listing blocks cleanup only.

Work only on Codex tasks visible on the current local host.
Inspect active tasks and pinned tasks before selecting any candidate.
Never target this currently running task.
Never interrupt a running task.
Never unpin a task.

Consider two cleanup candidate classes:

1. Idle Codex-managed Git worktree tasks that may have completed their declared work.
2. Every earlier projectless report task whose original assignment contains one of these exact markers:
   - `Managed by pirog/me AUTOMATIONS.yaml (id: morning-closeout).`
   - `Managed by pirog/me AUTOMATIONS.yaml (id: daily-work-plan).`

Do not select a report from its title alone.
Read each candidate and prove its exact task id, environment, original assignment, and current state.
Repeat the exact target read immediately before its archival attempt.
Read or unread state is not an archival gate; record it when exposed, but do not infer it or retain an otherwise eligible earlier report because it may be unread.
For a prior managed report, treat the delivered report as its declared outcome; unchosen optional recommendations do not by themselves make that report incomplete.
Retain a report whose run failed or whose own required report output is incomplete.
Hand each exact candidate to `$piro-clean-up-task` separately in archive mode.
Apply all of Clean Up Task's preservation gates without weakening or duplicating them.
If one candidate is ineligible, retain it, record the exact blocker, and continue with independent candidates.
Stop cleanup on a native task-operation failure or other systemic failure that makes later results unsafe.

Do not merge pull requests, close issues, delete branches, prune refs, delete worktrees, or modify repository files.
Do not archive pinned, running, ambiguous, dirty disposable, or otherwise unpreserved tasks.
Archived task transcripts remain the source of truth for their preserved conversation outcomes.

For each archived work task, record its exact task id and title, repository, source issue or pull request, delivered outcome, and archival verification.
Calculate completed capacity from qualifying GitHub issues closed in the reporting interval.
Record Work size only when the exact issue exposes a verified current Work size.
Report qualifying merged pull requests as delivery without treating them as completed issues.
Sum each verified issue Work size once.
Do not estimate missing Work size or treat it as time, effort completed, or a productivity score.
Exclude pull-request-only work and unknown sizes from the sum and list those exclusions.

Return a concise report titled `# MORNING CLOSEOUT — <local YYYY-MM-DD>` with these sections:

- `## Archived Work`
- `## Retained Tasks`
- `## Completed Capacity`
- `## Coverage and Limitations`

State the exact GitHub interval, repository scope, attribution reasons, Work size exclusions, and
independent GitHub and Codex coverage. State explicitly when no cleanup task was eligible.
End by confirming the exact classes of state that were not changed.
