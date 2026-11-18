# updates

`⬇️ SYSTEM UPDATE` runs at 23:00 local time on each Codex installation where Agent
System Install has activated the declaration. its persistent chat is `SYSTEM UPDATE` in
`REPORTS`. the automation ID is `system-update`.
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
   update prompt edit can hold Me's plugin payload and schedule work while Canon and
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

return two separate Markdown blockquotes in `REPORTS` / `SYSTEM UPDATE` after every run, including
unchanged, incomplete, and failed runs. separate them with a blank line outside the quotes.

### verdict card

keep all eight rows together in the order shown below. use a status emoji and a short result for
each check. keep versions, paths and phase details in the status report.

- `❌ SYSTEM UPDATE · FAILED` if any required operation failed and remains unresolved.
- `⚠️ SYSTEM UPDATE · INCOMPLETE` if required work or evidence is held, skipped, or unverified,
  including hooks awaiting trust, and no required operation failed.
- `✅ SYSTEM UPDATE · PASSED` if the required checks completed and were verified, including an
  already-current installation.

use the same precedence for the rows. a verified absent optional plugin, inapplicable dependency,
intentionally disabled job, or verified lack of hooks does not downgrade the result. use
`— absent` or `— not applicable` where relevant. if a permitted retry succeeds, use the verified
final result. include a **Notes** list below the rows only when needed, ordered ❌ errors, ⚠️
warnings, then ℹ️ information. name the affected check and the next action when there is one.
recovered failures and routine advice about earlier chat context are informational.

> ## ✅ SYSTEM UPDATE · PASSED
>
> - ✅ **Environment** — verified
> - ✅ **Dependencies** — verified
> - ✅ **Dotfiles** — verified
> - ✅ **Me** — current
> - ✅ **Agent System** — current
> - ✅ **Canon** — current
> - ✅ **Identity** — verified
> - ✅ **Doctor → Install → Doctor** — completed

### status report

always follow the verdict with exactly one `ℹ️ STATUS REPORT`, regardless of debug. keep every
section below, using H3 headings and unordered lists with bold field labels. replace the
placeholders with observed values and preserve successful steps when another step is held or
fails. report unavailable values as held, failed, unverified, absent, or inapplicable as appropriate.
keep raw logs and credentials out of both cards.

use the current run's evidence within the existing budget:

- **Environment** — use the trusted binding and instance inspection, the observed OS, and the
  actual task shell. verify the task shell separately from the login shell setting.
- **Dependencies** — match the local Homebrew installed inventory to the applicable entries in
  the bound `Brewfile`. give each applicable brew and cask its own row and observed version.
  label `codex` as OpenAI Codex CLI and `codex-app` as Codex Desktop. report Me's installed
  `@tanaab/codex-tools` from its local package metadata. a package range in `package.json`
  does not verify the installed version.
- **Dotfiles** — use the Stow setup check and its package set. report the actual source directory
  and Me source revision. only list packages as verified when the check covers them.
- **Me**, **Agent System**, and **Canon** — use each verified source root and resulting commit.
  show an exact tag, a tag plus commit count and short SHA, or a short SHA for an untagged source.
  compare HEAD to the `origin/main` commit fetched in this run. report aligned, ahead, behind,
  or diverged where verified, and unverified when the fetch or comparison did not finish.
  use the installed identity, version, and resolved cache directory from the existing Codex Tools
  status evidence or its read-only status command after the input safety checks. keep the actual
  checkout name, including `openclaw-agent-system` in its path.
- **Identity** — use the verified GitHub login and effective Git author and committer identities.
  report the verified transport and observed Git signing status. distinguish signing configuration
  from evidence of a verified signature. no test commit is required.
- **Doctor and Install** — report the first Doctor, what Install actually reconciled (including
  an already-aligned result), and the final Doctor's setup, saved-automation alignment, and
  intake/pickup results. use the owning runtime's readback for those findings. keep a held or failed
  Install visible even when final Doctor can still verify other work.

reuse the setup helper's results. `unchanged` verifies the cache was already aligned,
`refreshed` verifies it after repair, and `prepared` confirms dependency/build work only. keep
source movement separate from cache sync. name the actual failed or held phase
(`prepare-failed`, `install-failed`, `cache-failed`, `verify-failed`, `check-blocked`, or link
hold). report hooks where applicable as trusted, unchanged and trusted, trust needed, unknown,
or none, based on the existing hook review and trust readback. the plugin's verdict row includes
its hook outcome. reuse evidence already collected, including when the check could only finish
in part.

> ## ℹ️ STATUS REPORT
>
> ### Environment
>
> - **Runtime** standalone Codex
> - **Instance** `<readable name>`
> - **OS** `<observed OS and version>`
> - **Task shell** `<observed shell>`
> - **Bound Me workspace** `<path>`
>
> ### Dependencies
>
> - **OpenAI Codex CLI** `<installed version>`
> - **Codex Desktop** `<installed version>`
> - **@tanaab/codex-tools** `<installed Me version>`
> - **Other applicable Brewfile entry** `<installed version, one row per entry>`
>
> ### Dotfiles
>
> - **Verified Stow packages** `<package names>`
> - **Source directory** `<path>`
> - **Me source revision** `<tag or SHA>`
>
> ### Me
>
> - **Source revision** `<tag or SHA>`
> - **Fetched origin/main** `<comparison and short SHA>`
> - **Source directory** `<path>`
> - **Installed plugin** `<identity and version>`
> - **Cache directory** `<resolved path>`
> - **Sync** `<verified outcome>`
> - **Hooks** `<trust status>`
>
> ### Agent System
>
> - **Source revision** `<tag or SHA>`
> - **Fetched origin/main** `<comparison and short SHA>`
> - **Source directory** `<path to openclaw-agent-system>`
> - **Installed plugin** `<identity and version>`
> - **Cache directory** `<resolved path>`
> - **Sync** `<verified outcome>`
> - **Hooks** `<trust status>`
>
> ### Canon
>
> - **Source revision** `<tag or SHA>`
> - **Fetched origin/main** `<comparison and short SHA>`
> - **Source directory** `<path>`
> - **Installed plugin** `<identity and version>`
> - **Cache directory** `<resolved path>`
> - **Sync** `<verified outcome>`
> - **Hooks** `<trust status>`
>
> ### Identity
>
> - **GitHub login** `<verified login>`
> - **Git author** `<effective identity>`
> - **Git committer** `<effective identity>`
> - **Transport** `<verified transport>`
> - **Signing** `<observed status>`
>
> ### Doctor and Install
>
> - **First Doctor** `<setup, saved automations, and intake findings>`
> - **Install** `<verified reconciliations or reason held or failed>`
> - **Final Doctor setup** `<outcome>`
> - **Final Doctor saved automations** `<alignment outcome>`
> - **Final Doctor intake and pickup** `<readiness outcome>`
