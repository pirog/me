# MORNING CLOSEOUT

Run the Piro morning closeout for the current local date.
Use `$piro-morning-closeout` in archive mode and follow its complete safety contract.

Work only on Codex tasks visible on the current local host.
Inspect active tasks and pinned tasks before selecting any candidate.
Never target this currently running task.
Never interrupt a running task.
Never unpin a task.

Consider two candidate classes:

1. Idle Codex-managed Git worktree tasks that may have completed their declared work.
2. Every earlier projectless report task whose original assignment contains one of these exact markers:
   - `Managed by pirog/me AUTOMATIONS.yaml (id: morning-closeout).`
   - `Managed by pirog/me AUTOMATIONS.yaml (id: daily-work-plan).`

Do not select a report from its title alone.
Read each candidate and prove its exact task id, environment, original assignment, and current state.
Read or unread state is not an archival gate; record it when exposed, but do not infer it or retain an otherwise eligible earlier report because it may be unread.
For a prior managed report, treat the delivered report as its declared outcome; unchosen optional recommendations do not by themselves make that report incomplete.
Retain a report whose run failed or whose own required report output is incomplete.
Hand each exact candidate to `$piro-clean-up-task` separately in archive mode.
Apply all of Clean Up Task's preservation gates without weakening or duplicating them.
If one candidate is ineligible, retain it, record the exact blocker, and continue with independent candidates.
Stop the run on a native task-operation failure or other systemic failure that makes later results unsafe.

Do not merge pull requests, close issues, delete branches, prune refs, delete worktrees, or modify repository files.
Do not archive pinned, running, ambiguous, dirty disposable, or otherwise unpreserved tasks.
Archived task transcripts remain the source of truth for their preserved conversation outcomes.

For each archived work task, record its exact task id and title, repository, source issue or pull request, delivered outcome, and archival verification.
Record Work size only when the exact source issue exposes a verified current Work size.
Sum only those verified issue Work sizes.
Do not estimate missing Work size or treat it as time, effort completed, or a productivity score.
Exclude report-only tasks, pull-request-only tasks, and unknown sizes from the sum and list those exclusions.

Return a concise report titled `# MORNING CLOSEOUT — <local YYYY-MM-DD>` with these sections:

- `## Archived Work`
- `## Retained Tasks`
- `## Completed Capacity`
- `## Coverage and Limitations`

State explicitly when no task was eligible.
State whether active-task discovery was complete.
End by confirming the exact classes of state that were not changed.
