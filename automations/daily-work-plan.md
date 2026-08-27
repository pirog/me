# DAILY WORK PLAN

Prepare the Piro daily work plan for the current local date.
This is a projectless planning task; do not edit repository files.
Managed automation id: `daily-work-plan`.

## Required preflight capabilities

- `$piro-plan-work` and `$piro-find-work` with their complete current contracts.
- Native GitHub read operations authenticated as `pirog`, including complete issue and pull-request
  discovery within the approved scope, plus authenticated `gh api` access for the canonical Work size
  fallback. Prove connector and CLI access independently through `GitHub Read Access`.
- A complete current-host active and pending Codex task listing plus exact task reading for commitment
  and duplicate checks. A valid listing that reaches its supported maximum without pagination, a
  total, or a completeness marker remains incomplete after its one confirmation read and fails this
  task-specific readiness requirement.
- Readable `WORK_REPOS.md`, `GOALS.md`, and `ACTORS.md` sources from the installed Piroplugin.

Do not begin Plan Work when the shared automation preflight fails.
Do not substitute local session files, UI inspection, Computer History, or another non-authoritative
surface for complete native task coverage.

First use `$piro-plan-work` in plan-only mode with these explicit inputs:

- actor: `pirog`
- horizon: daily
- Work size target: `10`
- maximum newly recommended issue tasks: `2`
- objective: use the current `GOALS.md` objective and near-term priorities
- repository scope: use the default scopes in `WORK_REPOS.md`
- current-invocation decision scope: explicitly exclude `lando/*`

Search assigned issues and pull-request attention completely within that approved scope.
Count existing active issue commitments against the Work size target.
Keep pull-request attention in its separate unbudgeted lane.
Prefer a useful underfilled plan to weakly aligned filler.
Do not queue Codex tasks, assign issues, or mutate GitHub during the scheduled run.

Use `$piro-find-work` only when all of these conditions hold after Plan Work:

1. Verified daily capacity remains.
2. There is no actionable assigned issue or pull-request attention to recommend.
3. Assigned-work discovery completed without a blocking evidence gap.

When the fallback applies, run Find Work read-only with these explicit inputs:

- actor filter: `pirog` only
- horizon: daily
- per-actor Work size target: the verified remaining daily capacity, up to `10`
- maximum recommendations: `2`
- repository scope: use the default scopes in `WORK_REPOS.md`
- current-invocation decision scope: explicitly exclude `lando/*`
- alignment: use `pirog`'s reviewed goals source, including `GOALS.md`

Do not assign any recommended issue.
Explain that Find Work is a fallback recommendation set, not today's executable plan yet.
Ask me to assign the exact issues I choose and reply in this task.
After I confirm assignments in a later turn, verify them and rerun `$piro-plan-work` before offering to queue anything.

Return a concise report titled `# DAILY WORK PLAN — <local YYYY-MM-DD>`.
Preserve the headings required by the skill that produced the report.
Lead with the recommended plan or the exact reason no plan is available.
End with the single next decision I need to make.
