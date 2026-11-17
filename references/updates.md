# updates

`⬇️ UPDATE` runs at 23:00 local time on each Codex installation where Agent
System Install has activated the declaration. its persistent chat is `UPDATES` in
`REPORTS`; section and chat names contain no emoji. its cadence-neutral automation ID is `update`.
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

3. refresh eligible plugins one at a time through Me's existing setup helper. run from
   the bound Me checkout through native command authorization, using the same plugin
   arguments declared in `.agent-system/setup-agent.yaml`:

   | checkout     | refresh command                                                                         |
   | ------------ | --------------------------------------------------------------------------------------- |
   | Me           | `bun scripts/setup.js refresh plugin me piroplugin`                                     |
   | Canon        | `bun scripts/setup.js refresh plugin canon tanaab optional`                             |
   | Agent System | `bun scripts/setup.js refresh plugin openclaw-agent-system agent-system optional build` |

   the helper checks the plugin, repairs only drift, and verifies the result using
   Codex Tools. keep Agent System last because it can replace the installed runtime.

   check inputs before running each command. verify the plugin arguments against the
   expected merged declaration. allow edits outside what the operation consumes. a local
   UPDATE prompt edit can hold Me's plugin payload and schedule work while Canon and
   Agent System remain eligible. keep `TASKS.md` out of these checks. verify local edits
   and staging remain preserved after each operation.

   for each plugin, require safe target checkout and source inputs as in steps 1–2. check
   its package/lockfile, scripts, build source, installable package and
   `package.json#codexTools` managed paths. account for staged and unstaged edits,
   renames/deletions, and relevant untracked/ignored inputs. every plugin also uses Me's
   `scripts/setup.js`, its transitive imports, the setup declaration, Me's inspection
   CLI and the required host tools. prove those are safe independently of Me's plugin
   eligibility. hold the consuming steps if a shared executable or declaration changed
   unsafely. inspect Git metadata before running any helper and never execute a modified
   helper to determine whether it is safe. ordinary generated output and installed
   dependencies alone are expected. missing or unexpectedly changed prerequisites
   require a hold where their safety cannot be established.

   a missing source link can restow the entire AI package. before running a refresh with a missing link
   also check Me's `dotfiles/ai`, destination ownership and shared link inputs. a healthy
   existing link does not require restowing. hold unexpected links or occupied paths.
   the helper stops the selected refresh on a blocked check. verify current
   shared prerequisites after a step that could change them. continue to an independent
   eligible peer after a known step-local hold or failure. stop affected work for stale
   binding, native denial, uncertain effects, or a shared prerequisite that cannot be
   verified. retain earlier verified work and never repeat an uncertain mutation.

4. after eligible source pulls, dependency installs/builds and plugin/cache refreshes have
   completed or reached a recorded hold/failure, read and use the current Agent System
   Doctor → Install → Doctor skills against the trusted Me binding. the first Doctor
   inspects the post-refresh state. both Doctors include supported setup, saved automation
   definitions and persisted intake/pickup readiness; selected setup checks do not replace them.

   check the manifest, setup declarations, commands/imports, Brewfile, dotfiles, generated
   configuration and plugin inputs before the phases that consume them. a repository's
   refresh hold or failure alone does not hold the lifecycle: establish which inputs are
   unsafe or unavailable. continue safe inspection and independent automation work through
   their existing owners. if full Install would consume a held input, retain that Install
   hold without undoing or preventing the independent refreshes already completed.
   never execute an unsafe check or bypass a recorded hold, denial or uncertain mutation.

   use full Install for declared host/agent setup and its complete native automation
   reconciliation, including chat/schedule preparation, native writes and saved-state
   verification when needed. let Install check declared steps and apply only drift;
   leave healthy plugins unchanged and do not repeat their dependency/build/cache work.
   preserve installation identity, `smoke-test` disabled and unrelated schedules. respect
   Install's existing stop-on-failure behavior; do not retry a failed step through a direct
   helper or substitute selected workspace repairs for Install.

   finish with the full final Doctor when safe and permitted, including after a held or
   failed Install. report incomplete or unavailable findings as pending, never healthy.
   use fresh trusted runtime context after self-refresh and for Install's automation
   handoff; if unavailable, retain completed work and follow step 6.

5. if hooks need review, inspect the changed definitions and executable changes against the previously
   trusted source. for the existing hooks with unchanged purpose, event/matcher scope, approval
   authority, and credential access, use native Codex CLI `/hooks`, review each definition, press its
   displayed trust control, and verify `Trusted`. broader or unclear changes need operator review.
   never edit trust storage or use bypass flags. if trust is needed for an operation, do this first.
6. report actual results. synced caches and trusted hooks do not prove an already-loaded chat adopted
   the new runtime. use fresh trusted context when the supported lifecycle supplies it. if missing
   context prevents required work, report the unfinished step and needed action as a warning.
   otherwise, existing chats retaining earlier context is an informational repository note, not an
   update failure or a requirement to open a new chat. do not guess a replacement executable after
   an old runtime path disappears or restart the desktop app automatically.

keep each attempt to about 15 minutes: give subprocesses only the remaining time and stop launching
new work when it is exhausted. only clearly transient network failures may retry, up to three times
with 1/2/4-minute waits. retain completed steps in the chat and retry only the failed operation after
checking its outcome; do not repeat an uncertain native write or denied approval. this is a run budget,
not a guarantee that a native approval call can be interrupted. ordinary failures get a report and
can be checked again on the next occurrence; native denials require their normal recovery.

## declared automation settings

the declaration selects `model: low`, inheriting both model and effort from Me's `models.low`
profile. Agent System Install owns reconciliation of the declared schedule, chat placement and
model/effort settings. routine updates use that result; they do not add a separate model-alignment
audit or require an extra execution to prove the profile or scheduled delivery. targeted acceptance
testing belongs to an explicitly requested change or validation task.

## report

return one concise Markdown quote block in `REPORTS` / `UPDATES` after every run, including unchanged
days. use the two tables below in one card: repository outcomes with their own hooks and notes,
then `me check` for first Doctor, Install and final Doctor. use the readable instance name,
local occurrence date and actual short commits. keep notes beside the affected entry rather than
adding a separate attention or hooks footer.

use these statuses for each repository and Me check; the header reflects the worst unresolved
outcome across both tables, including hooks (❌ before ⚠️ before ✅):

- ✅ completed and verified, or already current. no unnecessary install/build is required for green.
- ⚠️ required work is held, skipped or unknown, including hooks awaiting trust. name the affected
  step and next action in its notes; never call an unchecked step healthy.
- ❌ an operation failed and remains unresolved. preserve successful earlier phases in the result.

an intentionally disabled job, absent optional plugin or lack of hooks is not a warning. show
`— skipped / absent` or `— none` where applicable without implying installation or trust.
routine advice about existing chats retaining earlier context does not downgrade success.
if a permitted retry resolves a failure and verifies the result, report the final status and briefly
note recovery. these reporting rules do not authorize retries or bypass holds or denials.

use the existing helper results: `unchanged` verifies the cache was already aligned; `refreshed`
verifies it after repair; `prepared` confirms dependency/build work only. distinguish source changes
from installed results and identify the actual failed phase (`prepare-failed`, `install-failed`,
`cache-failed`, `verify-failed`, `check-blocked` or link hold). do not add duplicate verification.

report hooks per repository: `✅ trusted` after verified trust, `✅ unchanged` when existing trusted
definitions and handlers did not change, `⚠️ trust needed`, `⚠️ unknown`, or `— none` when absent.
the repository status includes its hook outcome. Me check notes retain setup, native automation
and intake/pickup findings, including anything held or unchecked. use actual outcomes rather than
copying the example's healthy rows:

> ## ✅ UPDATE · RUN RESULTS
>
> **instance:** `readable instance name` · YYYY-MM-DD
>
> | repository   | status     | source / installed result                    | hooks        | notes                                                         |
> | ------------ | ---------- | -------------------------------------------- | ------------ | ------------------------------------------------------------- |
> | Agent System | ✅ updated | `before` → `after`; build and cache verified | ✅ unchanged | existing chats may retain earlier context; no restart needed. |
> | Canon        | ✅ current | `commit`; cache aligned                      | — none       | no dependency or build work needed.                           |
> | Me           | ✅ current | `commit`; cache aligned                      | ✅ unchanged | preserved the local `TASKS.md` edit.                          |
>
> | me check     | status     | notes                                             |
> | ------------ | ---------- | ------------------------------------------------- |
> | first Doctor | ✅ healthy | setup healthy; intake ready; automations aligned. |
> | Install      | ✅ aligned | no setup or schedule changes needed.              |
> | final Doctor | ✅ healthy | no remaining drift or pending repairs.            |
