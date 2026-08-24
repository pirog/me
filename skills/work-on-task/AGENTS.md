# Work on Task Maintenance Guidance

## Controlled Live Proofs

- Treat a controlled proof issue, Codex task, branch, and worktree as test evidence until the
  result has been captured.
- Use `tanaabased/big-test-bucket` for organization-owned manual and GitHub integration proofs, and
  use `pirog/me` when a personal-repository fallback needs explicit coverage.
- Clean up only an exact fixture that the user explicitly authorizes. Never infer cleanup from a
  normal `$piro-work-on-task` invocation or apply it to a real source issue.
- Use `$piro-clean-up-task` for eligibility assessment and archival of an exact finished proof task.
  Its PR profile owns extra merge evidence only when the proof produced a pull request; do not
  duplicate its task and environment cleanup rules here.
- Close a disposable proof issue only after exact user authorization and with the accurate state
  reason. Issue closure remains separate from task archival.
- Report any retained task, issue, branch, or worktree state instead of hiding incomplete cleanup.
