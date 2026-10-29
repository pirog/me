# nightly refresh

`🌙 NIGHTLY REFRESH` runs at 23:00 local time on each Codex installation where Agent
System Install has activated the declaration. its persistent chat is `NIGHTLY REFRESH` in
`AGENT SYSTEM`. use the current trusted Me binding and runtime routes; never save a machine-specific
home, UUID, or versioned runtime path in the prompt. use `instanceRuntime inspect` for the readable
instance name shown in the card.

## procedure

1. inspect the bound Me checkout and its setup-owned Canon and OpenClaw Agent System source roots.
   record each current commit. require the expected repository origin, `main`, no unfinished Git
   operation or unmerged index, and no active work in that checkout. use current native chat/worktree
   and process evidence; if ownership is unclear, skip it. work in a separate checkout alone does
   not disqualify a source update. local edits alone are allowed. record staged/unstaged changes and
   relevant untracked/ignored paths without exposing their contents; use NUL-delimited Git listings.
   report skips and continue with unaffected repositories. never stash, reset, rebase, clean, resolve
   conflicts, or interrupt another task. leave other schedules running.
2. recheck eligibility immediately before updating. fetch `origin main`, resolve its fetched commit,
   and require `git merge-base --is-ancestor HEAD <fetched-commit>` to succeed. then run:

   ```sh
   git merge --ff-only --no-autostash --no-overwrite-ignore <fetched-commit>
   ```

   use the verified fetched commit, not an unchecked moving ref. require Git to support these flags;
   never weaken them to get past a failure. record the resulting commit, including unchanged revisions,
   and verify local file contents and staging were preserved. divergence, locally ahead `main`,
   obstruction, overlap and denied access stop this repository's update and dependent installation;
   continue with unaffected repositories. ordinary Git refusals leave the checkout in place, though
   fetch may update remote-tracking information. on any failure inspect HEAD, index and working files
   against the recorded state. an interrupted command or filesystem error may leave partial changes:
   stop and report uncertainty rather than attempting rollback. never force, autostash or resolve it.
   keep a successful source update if a later installation fails.

3. separately check installation eligibility after the source update and again before each mutating
   step. a safe fast-forward does not make modified local inputs safe to execute or install. account
   for staged and unstaged edits, renames/deletions, and relevant untracked/ignored inputs. `TASKS.md`
   is scratch outside the managed payload: edits only there permit the full refresh. for other paths,
   establish that they are unrelated to the step; hold unknown or affected inputs and report why.

   use the existing owners to identify inputs: Me's `scripts/setup.js` and imported helpers for every
   repair; each target's package/lockfile, build scripts/source, installable package and
   `package.json#codexTools` managed paths; and Me's `dotfiles/ai` if a missing plugin link requires
   Stow. do not execute a locally modified helper to decide whether it is safe. ordinary installed
   ignored dependencies/generated output alone are not an obstruction, but hold unexpected local
   inputs affecting execution or installation. retain any affected inputs as an Install hold for
   step 4; source updates already completed remain in place.

   Agent System Install owns plugin repair and live cache synchronization for all three repositories.
   do not invoke `scripts/setup.js apply plugin`, `codex:sync`, or Codex Tools install/sync directly.
   let Install run dependency installation, builds, and cache synchronization only for declared
   steps needing repair; leave healthy plugins unchanged. a missing optional plugin remains absent
   and must be reported as skipped, not installed or aligned.

4. check eligibility for the full Agent System Install separately: its host/agent setup declarations
   can execute Brewfile, dotfiles, generated configuration and plugin repairs. inspect the manifest,
   guidance, setup declarations, commands/imports and their inputs before invoking those skills.
   hold Install when any required source update or installation input was held, or when it could execute/install
   modified or unknown local inputs; report the affected paths. `TASKS.md` alone does not hold Install.
   when eligible, use the existing Agent System Doctor → Install → Doctor skills against the trusted Me binding.
   Install includes its normal automation plan, native save, acknowledgment, and readback; a setup
   subprocess alone does not reconcile schedules. apply declared changes through that owner, preserve
   `smoke-test` disabled, and do not temporarily pause jobs for maintenance. stop on a failed or denied
   Install operation and report earlier successes; never bypass its owner to finish a failed step.
5. if hooks need review, inspect the changed definitions and executable changes against the previously
   trusted source. for the existing hooks with unchanged purpose, event/matcher scope, approval
   authority, and credential access, use native Codex CLI `/hooks`, review each definition, press its
   displayed trust control, and verify `Trusted`. broader or unclear changes need operator review.
   never edit trust storage or use bypass flags. if trust is needed to continue step 4, do this first.
6. report actual results. synced caches and trusted hooks do not prove an already-loaded chat adopted
   the new runtime. use fresh trusted context when the supported lifecycle supplies it; otherwise
   report `restart/context needed` and any unfinished Doctor or automation reconciliation. do not
   guess a replacement executable after an old runtime path disappears. do not restart the desktop
   app automatically. this warning is an acceptable first-run outcome, not a reason to pause jobs.

keep each attempt to about 15 minutes: give subprocesses only the remaining time and stop launching
new work when it is exhausted. only clearly transient network failures may retry, up to three times
with 1/2/4-minute waits. retain completed steps in the chat and retry only the failed operation after
checking its outcome; do not repeat an uncertain native write or denied approval. this is a run budget,
not a guarantee that a native approval call can be interrupted. ordinary failures get a report and
can be checked again on the next occurrence; native denials require their normal recovery.

## temporary Luna pilot

the declaration requests `gpt-6-luna` / `medium` through `overrides.codex`. keep the existing
`NIGHTLY REFRESH` chat/history, 23:00 local schedule, permissions, other automations and disabled
`smoke-test`. if Install reports `automation-thread-model-drift`, stop for the operator to select
the requested model and effort through that chat's native controls, then replan Install. retain its
manual handoff if those controls or persisted readback are unavailable. never replace the chat,
write scheduler files, use a transient app-server override or send a model turn to clear drift.

verify the persisted native model/effort and Agent System's saved automation readback separately.
then record one actual refresh on Luna in the same chat, including effective execution settings,
the status card and any reasoning/recovery failures. prefer the next scheduled occurrence; a manual
run proves execution only, not scheduled delivery. saved settings or a model's self-report do not
prove execution. preserve an incomplete pilot as outstanding work.

## report

return one Markdown quote block after every run, including unchanged days. use ✅ for completed,
verified work, ⚠️ for skips or restart/context needs, and ❌ for failures. use the readable Agent System
instance name in backticks, the local occurrence date, and actual short commits. never label an
unchecked step healthy. distinguish source updates from held/failed dependency, plugin and Install
steps. keep the card compact, following this shape:

> ## ✅ NIGHTLY REFRESH
>
> **instance:** `readable instance name` · YYYY-MM-DD
>
> | repository   | source / commit            | dependencies / build | Codex plugin / cache |
> | :----------- | :------------------------- | :------------------- | :------------------- |
> | Agent System | updated `before` → `after` | synced               | enabled / aligned    |
> | Canon        | unchanged `commit`         | installed            | enabled / aligned    |
> | Me           | unchanged `commit`         | installed            | enabled / aligned    |
>
> **Doctor → Install → Doctor:** actual outcomes, including saved automation alignment
>
> **hooks / loaded context:** actual trust and adoption status
>
> **attention:** only if needed; state the failed step and next action
