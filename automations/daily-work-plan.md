# DAILY WORK PLAN

Prepare the Piro daily work plan for the current local date.
This is a projectless planning task; do not edit repository files.
Managed automation id: `daily-work-plan`.

## Required preflight capabilities

- `$piro-plan-work` and `$piro-find-work` with their complete current contracts.
- Native GitHub connector reads authenticated as `pirog`, including complete issue and pull-request
  discovery within the approved scope. Apply [`GitHub Read Access`](../references/github-read-access.md)
  connector-first; verify the CLI route only if connector recovery or a required Work size fallback
  actually reaches it.
- Native Codex task listing and exact reading under
  [`Codex Task Access`](../references/codex-task-access.md). This is preferred commitment evidence,
  but the plan-only degradation below may continue when trustworthy complete coverage is unavailable.
- Readable `WORK_REPOS.md`, `GOALS.md`, and `ACTORS.md` sources from the installed Piroplugin.

Do not begin Plan Work after a hard shared-preflight failure. Wrong identity, unavailable required
GitHub discovery after recovery, or malformed or untrustworthy final provider data fails closed.
A valid capped Codex listing is soft degradation: process exact visible commitments, report partial
coverage, keep remaining and total capacity unknown, and recommend at most one issue. Do not repeat
the identical capped read.

If Codex task listing is completely unavailable after bounded recovery but GitHub discovery works,
continue to one clearly conditional, read-only issue recommendation. State that existing commitments
and remaining capacity are unknown and do not claim that no active commitment exists. A conditional
plan never authorizes queueing or creation.

Do not substitute local session files, UI inspection, Computer History, or another non-authoritative
surface for native task evidence.

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

Do not run Find Work when Codex commitment coverage is partial or unavailable because remaining
capacity is not verified.

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
