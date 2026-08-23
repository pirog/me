# Work on Task Maintenance Guidance

## Controlled Live Proofs

- Treat a controlled proof issue, Codex task, branch, and worktree as test evidence until the
  result has been captured.
- Clean up only an exact fixture that the user explicitly authorizes. Never infer cleanup from a
  normal `$piro-work-on-task` invocation or apply it to a real source issue.
- Archive the proof task, close the fixture issue with the accurate state reason, and remove the
  derived branch only after confirming that it has no unique commits and is not checked out.
- Let Codex reclaim app-managed worktrees after archival. Do not manually delete directories under
  the Codex worktree root merely to make a proof look clean.
- Report any retained task, issue, branch, or worktree state instead of hiding incomplete cleanup.
