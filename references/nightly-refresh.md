# agent updates

`⬇️ UPDATE AGENT` runs at 23:00 local time on each Codex installation where Agent
System Install has activated the declaration. its persistent chat is `UPDATES` in
`REPORTS`; section and chat names contain no emoji. keep the stable `nightly-refresh` automation ID.
this remains Me's prompt-backed Codex refresh; OpenClaw command jobs own their separate execution
and report delivery. use the current trusted Me binding and runtime routes; never save a machine-specific
home, UUID, or versioned runtime path in the prompt. use `instanceRuntime inspect` for the readable
instance name shown in the card.

## procedure

1. inspect the bound Me checkout and its setup-owned Canon and OpenClaw Agent System source roots.
   record each current commit. require the expected repository origin, `main`, no unfinished Git
   operation or unmerged index, and no checkout-mutating work. use native `list_threads`, bounded
   `read_thread` activity for chats using that checkout, Git worktree metadata and relevant process
   evidence. a shared cwd or active chat alone is not proof of mutation. ordinary `ISSUE ASSIGNMENTS`
   reads and dispatch into isolated task checkouts do not hold the source checkout, including writes
   confined to managed task state outside its source/install inputs. work in another checkout alone
   does not disqualify it. hold for verified source/index mutation, setup/build/install using that
   checkout, or genuinely unresolved ownership. missing activity readback is unknown; an absent Git
   process alone does not establish safety between tool calls. local edits alone are allowed.

   record staged/unstaged metadata with NUL-delimited Git listings and retain preservation evidence
   without printing file contents or raw path trees. start with
   `git status --porcelain=v2 -z --untracked-files=normal`; scope further untracked/ignored inspection
   to incoming paths and the setup/install inputs in step 3. collapse ignored directories with
   `git ls-files --others --directory --ignored --exclude-standard -z -- <relevant-pathspecs>` when needed. do not recursively enumerate
   dependencies, generated output or `.agent-system/repositories` and managed task checkouts.
   consume listings privately; report affected paths/counts only. incomplete or truncated evidence
   remains an unknown-input hold, never a clean result.
   report skips and continue with unaffected repositories. never stash, reset, rebase, clean, resolve
   conflicts, or interrupt another task. leave intake and other schedules running.

2. recheck checkout activity and Git eligibility immediately before updating; hold if either changed.
   fetch `origin main`, resolve its fetched commit,
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
   when eligible, read and use the current Agent System Doctor → Install → Doctor skills against the
   trusted Me binding. before automation inspection/reconciliation, obtain fresh `list_projects`,
   the exact `read_thread` results required for declared targets, and `list_threads` including the
   sidebar sections. pass decoded results through the owner's lookup inputs (`projects`, `threads`,
   and `nativeInventory` for the complete sidebar inventory where required). a thread title or a
   hand-built substitute is not a native readback. refresh inputs as required before each write.
   missing lookup inputs, unreadable saved state or denied host access are inspection blockers;
   do not label them verified automation drift or absent jobs. report the actual diagnostic and
   supported next action. only complete inspection can establish aligned or drifted settings.
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

## shared model profile

the declaration selects `model: low`, inheriting both model and effort from Me's `models.low`
profile. use Agent System Doctor → Install → Doctor to rename the existing owned `NIGHTLY REFRESH`
chat to `UPDATES`, move it from `AGENT SYSTEM` to `REPORTS`, and reconcile settings in that same chat.
preserve its native chat ID/history, automation identity, 23:00 local schedule, permissions, other
automations and disabled `smoke-test`; do not add a new `thread.id` or adopt a chat by matching title.
use Install's supported `threads-sync` plan for name, group and model/effort drift, including its exact
native placement actions, receipts, refreshed sidebar inventory and replan. attempt supported existing-chat
reconciliation before prescribing manual model repair. repeat Install should report aligned settings.
if native reconciliation is blocked, busy, denied, unsupported or has incomplete readback, retain the
result and follow its supported recovery. never replace the chat, write scheduler files, use a transient
app-server override or send a model turn to clear drift. never repeat an uncertain native mutation.

verify the persisted name/group, same chat ID/history, model/effort and Agent System's saved automation
identity/schedule readback separately from merged configuration. use the authorized Install/nightly
flow against eligible designated `main` sources; routine task-work validation does not activate this change.
then record one actual refresh using the resolved profile in the same chat, including effective
execution settings, the status card and any reasoning/recovery failures. prefer the next scheduled
occurrence; a manual run proves execution only, not scheduled delivery. saved settings or a model's self-report do not
prove execution. preserve incomplete reconciliation or scheduled-run verification as outstanding work.

## report

return one concise Markdown quote block in `REPORTS` / `UPDATES` after every run, including unchanged days.
use ✅ for completed,
verified work, ⚠️ for skips or restart/context needs, and ❌ for failures. use the readable Agent System
instance name in backticks, the local occurrence date, and actual short commits. never label an
unchecked step healthy. distinguish source updates from held/failed dependency, plugin and Install
steps. missing optional plugins say `skipped / absent`; unchecked steps say `not checked` or `unknown`.
use ⚠️ overall when required work is skipped, held or unknown, and ❌ for a failed operation; reserve ✅
overall for completed verified work. successful source updates remain visible when Install is held.
keep the card compact, following this shape with actual outcomes rather than copying its healthy rows:

> ## ✅ UPDATE AGENT
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
