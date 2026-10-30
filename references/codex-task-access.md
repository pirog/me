# Codex Task Access

use this reference to discover and read Codex tasks and preserve recurring tasks during maintenance.
listing alone authorizes no mutation. Agent System Task Launch owns issue and same-repository PR
startup; Task Retirement owns managed retirement and explicitly selected unmanaged chat cleanup,
including their native disposal and recovery contracts. these general safeguards do not add a managed
preservation audit to explicit unmanaged cleanup. never bypass invalid managed ownership or a native denial.

## Listing and recovery

1. Start with the current supported maximum:

   ```text
   list_threads(limit=50)
   ```

   Do not begin with `limit=100`. If a future caller-originated argument mistake is rejected, correct
   it once from the validation response and retry once.

2. Treat a valid response with 50 non-pinned tasks and no cursor, total, or completeness marker as
   partial evidence. The operation succeeded, but hidden active or pending tasks may remain. Do not
   repeat the identical capped read merely to reconfirm the cap.

3. Retry a genuine transport failure, unavailable source, or malformed response within a maximum of
   three total attempts. Stop retrying when the same final result cannot become more trustworthy. An
   unavailable listing may be a soft degradation only for an owning read-only workflow that
   explicitly permits a conditional result; a malformed or untrustworthy final response is a hard
   failure.

## Exact task evidence

- Inspect the visible active, pending, and pinned candidates relevant to the workflow. Do not infer
  exact ownership, source, environment, state, or completion from listing titles or summaries.
- Call `read_thread` for each visible candidate before using it in a commitment, duplicate,
  eligibility, or preservation decision. Use the surfaced `hostId` when required.
- Under incomplete coverage, map only commitments proved by exact visible task reads. Report that
  unseen commitments may exist and never claim an empty or complete task surface.
- Missing optional task metadata may degrade one candidate. An ambiguous identity or untrustworthy
  exact read must not be converted into an empty state.

## Mutation boundary

A workflow may use partial coverage for an explicitly permitted read-only result. Immediately before
any later task creation, archival, or other mutation, repeat the owning workflow's strongest required
duplicate or target verification and read the exact target again. A failed exact read, ambiguous
target, unsafe environment, or destructive uncertainty blocks that mutation. Partial planning
coverage never carries forward as mutation authorization.

### Recurring-task preservation

Before archival, inspect native automation metadata or read the current host's saved
`$CODEX_HOME/automations/*/automation.toml` definitions (default `~/.codex/automations`). Do not
edit those files. Protect every `target_thread_id`, including paused and unmanaged heartbeats.
A heartbeat invocation in the exact task history also identifies a persistent automation task:
retain it even if its saved schedule is missing. A completed turn is not a completed recurring task.

Refresh this check immediately before archival. If automation state cannot be read reliably, skip
cleanup and report the limitation; independent reporting can continue. Never pause, delete, detach,
or archive a recurring task as routine cleanup. Retiring one needs an explicit automation-retirement
request. Only a proven standalone run, not its persistent automation task, can be a prior-report
cleanup candidate.
