# Codex Task Access

use this reference to discover and read Codex tasks, or follow the temporary native routes below
when explicitly requested. listing alone authorizes no mutation. Agent System Task Launch owns
GitHub issue startup; Task Retirement owns Agent System-managed retirement, including recovery.
never use the native routes to bypass invalid managed ownership or a native denial.

## temporary native task guidance

these routes preserve existing PR startup and unmanaged Codex cleanup while Agent System adds
[PR launch](https://github.com/tanaabased/openclaw-agent-system/issues/507) and
[native task retirement](https://github.com/tanaabased/openclaw-agent-system/issues/508).
remove this temporary guidance through [#147](https://github.com/pirog/me/issues/147) only after
**both** replacements are released, installed, and demonstrated. closed issues alone are insufficient.

### start work on an existing PR

1. require an explicit startup request for one open GitHub PR. verify its base and head repositories
   match and the active identity can push there; forks remain unsupported. use the task evidence
   rules below to find and read an exact matching chat, reusing it instead of creating a duplicate.
   stop on ambiguous ownership or incomplete evidence that prevents a safe creation decision.
2. resolve one saved Git-backed Codex project by its normalized Git `origin`, not its label. if
   missing, inspect `~/tanaab/<repo>` and give an exact clone command only if that path is absent,
   manual project-registration instructions, and a retry prompt containing the PR URL and folder.
   report conflicting paths or multiple matching projects; do not overwrite, clone, or register them.
3. before using the raw head branch in any command, refspec, prompt, or task field, require
   `^[A-Za-z0-9][A-Za-z0-9._/-]*$`, then `git check-ref-format --branch`. reject unsafe or invalid
   values. fetch only its exact `refs/heads/<branch>:refs/remotes/origin/<branch>` from `origin`,
   and require the fetched commit to equal GitHub's reported full hexadecimal head commit.
4. follow [model routing](./model-routing.md), applying both resolved model and effort through native
   task creation. create one native worktree chat from that verified remote-tracking ref, without
   creating a branch. have the chat attach the original PR, verify origin and detached `HEAD` against
   the fetched/GitHub commit, then begin read-only assessment, review, and planning. verify requested
   versus effective settings when supported; retain partial setup and report unavailable readback.
5. later authorized implementation stays on that PR: re-fetch and verify its head before edits,
   then push without force to `HEAD:refs/heads/<validated-branch>`. stop if the remote advanced or
   the push would not fast-forward. never create a replacement branch or PR.

### archive an unmanaged Codex chat

1. require one explicitly selected finished chat and read its exact identity, original assignment,
   declared outcome, current status, and native environment. readiness inspection alone does not
   authorize archival. stop for running, current, pinned, shared, recurring, ambiguous, or uncertain
   targets, or unresolved work contradicting completion. apply recurring-task preservation below.
2. establish native custody: Codex-managed disposable worktree, retained local/permanent checkout, or
   conversation/non-Git environment. inspect Git `HEAD`, branch, status including untracked files,
   containing refs, and worktree users where applicable. incidental issue/PR links are not deliverables.
   distinguish preservation of an outcome from checkout retention:
   - conversation outcomes remain in restorable chat history. verify explicitly declared external
     artifacts exist in a durable location that survives any checkout reclamation.
   - retained local/permanent checkouts remain untouched. report dirty, untracked, detached, or
     unpublished state; it alone does not block archival of an explicitly finished outcome.
   - disposable Git worktrees must be clean and their `HEAD` preserved by a named local branch/tag
     or a verified live remote branch. stale remote-tracking refs alone are insufficient. native
     recovery snapshots are additional protection, never a substitute for these gates.
3. when a PR is the declared completed deliverable, require it merged, its base/head repositories
   to match the task's Git origin, its base to be the repository's current default branch, and a
   recorded final head, merge commit, and merge
   time. validate branch values as above; refresh only the exact default-branch tracking ref without
   writing `FETCH_HEAD`, and prove it contains the merge commit. for a disposable checkout, also
   verify GitHub compare from task `HEAD` to final PR head is `identical` or `ahead`, `behind_by: 0`,
   with merge base equal to task `HEAD`. this permits later incorporated PR commits and squash merges
   while blocking ahead/divergent work. validate commit IDs as full hexadecimal values before use.
4. present the target, preservation evidence, any failed gates, exact ref refreshes, and expected
   retained/reclaimed resources. with explicit archival authorization and all applicable gates
   passed, refresh the exact target and recurring/pinned/shared checks immediately before native
   archival. read back archived state through native inventory; report checkout reclamation
   separately, including protected or pending resources. reconcile uncertain effects without blind
   retries. never delete raw checkouts, branches, artifacts, or GitHub state.

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
