# nightly refresh

run only for the current Codex installation bound to Me, after this installation has activated
the declared `nightly-refresh` automation. use the newest trusted Agent System context for the
workspace and runtime routes; never copy a machine name, user home, instance UUID, or versioned
runtime path into the saved prompt. each activated instance maintains its own observations.

the automation is `🌙 NIGHTLY REFRESH`. its persistent chat is `NIGHTLY REFRESH`, without an emoji,
in the native `AGENT SYSTEM` sidebar group beside `ISSUE ASSIGNMENTS`. the declaration is disabled
until the pilot and integration requirements below pass. do not activate it merely because this
file exists. never silently accept a generated automation name in place of the requested name.

run at 23:00 `America/New_York`. the initial scope accepts updated sources, synchronized caches,
and reviewed, trusted hooks with a warning that loaded chats still need a restart. that is a staged
outcome, not proof that every chat uses the new runtime. post the card when the run finishes for
morning review. do not restart the desktop app automatically or leave later jobs paused to wait
for a restart; saved schedule recovery remains required before unattended activation.

## activation requirements

schedule recovery is currently blocked: Agent System's prepare/acknowledge/cancel flow can
reconcile a lost pause receipt, but it cannot expire that pause or restore a job without another
successful native write. a stopped refresh or failed restore can therefore leave later work
paused. do not begin unattended schedule pauses or shared-cache replacement until the owner can
recover independently of this refresh chat and preserve usable runtime references during recovery.
keep validation disposable; a reminder to restore schedules is not that guarantee.

- use a bounded idle-maintenance window: pause only affected scheduled consumers through their
  existing owning controls, retain their exact saved state, and verify the pause. defer while
  relevant turns are active or activity is unknown. never interrupt work or pause unrelated
  schedules. this does not exclude a manually started chat; recheck activity before each mutation
  phase and stop if work appears. no global Codex lock is claimed or required.
- prove recovery across interrupted and same-version cache refreshes. native version upgrades can
  remove the old runtime path; retain progress outside the cache and require new trusted context
  before invoking another runtime. do not roll back across unverified private-state compatibility.
- test native `/hooks` trust renewal in an isolated profile, including rejection of an expanded
  approval scope, exact-definition readback, and a new trusted `SessionStart` context.
- require an Agent System version supporting `display-name` and `group`. the declaration uses those
  shared fields for the emoji-bearing automation name and sidebar group; `thread.name` remains plain.
- run the source interruption/transient-failure pilot, then the native source/cache/trust and
  schedule-recovery pilot. in-place adoption by the loaded chat is outside this initial scope. activate via
  Agent System Install only after these gates pass. saved settings and manual execution do not prove
  an overnight run; verify its actual time and delivered report afterward.

merging this disabled pilot does not activate nightly runs. Install may reconcile its retained chat
and paused schedule, but it must preserve `enabled: false`. after the requirements above pass,
enable the declaration in Me and run Agent System Install on each bound Codex installation that
should participate. Install owns chat reconciliation, schedule preparation, native save,
acknowledgment, and saved-state verification; there is no separate hand-created automation or
pre-activation step. verify Doctor and then an actual 23:00 occurrence and delivered card on each host.

## each occurrence

1. require an active trusted Me binding. read the instance identity through the supplied
   `instanceRuntime inspect` route. pass its `instanceId` and readable `displayName` as `instanceId`
   and `instanceName`; do not substitute the OS hostname, rotate the ID, or guess either value. the
   card shows the readable instance name in inline code; the UUID only keys retained progress. use the native
   scheduled occurrence's date in `America/New_York`, preserving it across retries. collect fresh
   native activity for all affected checkouts and shared plugins, excluding this maintenance turn.
   pause affected scheduled consumers as above, retaining their exact prior state outside the
   plugin cache. if activity or verified pause evidence is unavailable, defer with a warning card.
2. invoke `bun scripts/nightly-refresh-task.js` from the bound source workspace, with JSON on stdin.
   use `action: sources`, `workspace`, `instanceId`, `instanceName`, `date` (`YYYY-MM-DD`), `trigger: scheduled`, and
   `activity: { observedAt: <epoch milliseconds>, activeThreads: [], scheduledConsumersPaused: true }`
   only after the idle-maintenance requirement is satisfied. for a supervised pilot use `trigger: manual`.
   this observation is a caller responsibility, not proof manufactured by the helper. never turn
   an unknown activity result into an empty list. the helper selects Me and its setup-owned Canon
   and Agent System source roots; it never stashes, resets, rebases, or changes task branches.
3. retain the returned journal and inspect the result. a `retry` supplies `retryAt`; wait in short,
   interruptible intervals and retry the same request with a fresh activity observation. the helper
   permits at most four source attempts, each bounded to 15 minutes, with 1/2/4-minute waits.
   inspect completed results before retrying. native denials, deterministic failures, and uncertain
   external writes are not transient. `failed` remains held across dates; do not reset its journal.
4. once sources are ready, invoke the helper with `action: setup`, `phase: doctor-before`, and the
   exact ephemeral `setupRuntime` object from trusted context. then use `phase: install`; after
   trust/context renewal, use `phase: doctor-after`. include the same occurrence fields and fresh
   activity observation each time. this calls the existing Agent System setup owner, checks its
   binding, records its actual findings, and bounds each subprocess to the remaining attempt budget.
   native approval still applies. use Me's owning plugin repairs: the build-bearing Agent
   System step delegates dependency installation, build, and provider verification to `bun run sync`.
   do not run those commands a second time. recheck activity and saved pauses before shared cache writes.
   Codex Tools Install selects the source version before cache sync; do not use its manifest-changing
   `refresh` command on a clean `main` checkout. stop after the first failed Install step. the helper
   sends SIGTERM before the deadline so Agent System can cancel detached setup children, then SIGKILL
   at the deadline if needed. an interrupted Install remains uncertain until explicitly reconciled.
   native hook review and scheduler calls are not cancellable by this subprocess deadline: check the
   remaining budget before each call, stop when exhausted, and report a hold rather than promise that
   an in-flight native effect can be cancelled.
5. review changed Agent System hook definitions and executable changes against the previously
   accepted source. renewal is allowed only for the existing hooks, verified expected origin, and
   unchanged purpose, event/matcher scope, approval authority, and credential access. unknown commands,
   broader authority, an incomplete review, or a native denial stop for operator direction. use the
   interactive Codex CLI `/hooks` flow and its displayed trust control for the exact reviewed
   definition, then reread `Trusted`; never send blind keystrokes, edit trust storage, disable review,
   or use bypass flags. ensure the definition has not changed between review and trust.
6. obtain new trusted context through the supported native session lifecycle after a runtime change.
   a CLI subprocess showing context does not update this chat's trusted context. if the current
   chat cannot refresh safely, preserve progress and report a context-refresh hold. never infer the
   next executable from a directory listing or use an old prefix after its runtime disappears.
   a cold client can resume the same chat with renewed trust, but a loaded owner prevents a second
   client from resuming it. compaction and `hooks/list` do not renew the loaded chat's hook trust in
   the tested native client. the initial scope may stop at a restart-needed warning after recording
   the actual source/cache/trust results and restoring schedules. completing runtime adoption and
   final reconciliation still requires owner-release/resume or in-place refresh; launching another
   client is not sufficient. never record `context: fresh` or healthy final Doctor from cache equality.
7. complete Install's owned automation plan/prepare/native mutation/acknowledge sequence using that
   refreshed context. reconcile unknown saves before another write. verify all three plugins are
   installed, enabled, and pass their cache checks, even if a setup step would consider one optional.
   require healthy final setup and aligned saved automations, including intake's runtime reference.
   preserve `smoke-test` disabled. on success, deferral, failure, or a context-refresh hold, restore
   only schedules paused by this run through their owner and verify their exact prior enabled/paused
   state. reconcile uncertain native writes first. if restoration cannot finish, retain the prior
   states and report the recovery action; never silently leave intake paused.
8. the `setup` action records Doctor and Install directly. record the remaining actual native
   observations using the helper with `action: record`, the same binding
   and date fields, `check`, `status`, and a short redacted `evidence` string. this stores evidence;
   it grants no authority to execute or approve an operation. never record an inferred success.

| check                                                    | accepted observations                  |
| :------------------------------------------------------- | :------------------------------------- |
| `doctor-before`, `doctor-after`                          | `healthy`, `drift`, `blocked`          |
| `install`                                                | `healthy`, `applied`, `failed`         |
| `hooks`                                                  | `trusted`, `review-required`, `failed` |
| `context`                                                | `fresh`, `unverified`, `failed`        |
| `automations`                                            | `aligned`, `drift`, `blocked`          |
| `cache-openclaw-agent-system`, `cache-canon`, `cache-me` | `aligned`, `drift`, `blocked`          |

finish every occurrence with the helper's `report` as one Markdown quote block, including unchanged
days. use the returned ✅, ⚠️, or ❌ heading and repository table without adding a second status card.
the report separates source commits, cache equality, hook trust, fresh context, setup, and saved
automation definitions. never describe a copied cache as live in every existing chat. include the
actual stop and next action when a native step fails. a sleeping or unavailable host cannot guarantee
delivery; report missed execution when it can next be observed, without claiming a run occurred.

## recovery

the journal lives under the current user's `.local/state/piroplugin/nightly-refresh`, outside the
managed plugin cache, keyed by canonical workspace and installation identity. completed source
updates survive interruption; the next attempt reconciles actual commits before repeating work.
the source-command lock is shared by instances using the same workspace. it does not lock Codex
consumers during native lifecycle operations. fresh activity and verified schedule pauses bound
the maintenance window but cannot prevent a manually started chat from racing with it.

an abrupt process death leaves a lock for inspection: verify the recorded process and its children
have exited before removing only that maintenance lock. never remove Agent System's tracking locks.
for a failed or expired occurrence, first resolve the owning failure/denial or reconcile any pending
native effect. only explicit operator direction permits `action: resume`: preview without a digest,
then apply the returned digest and a bounded `reason`. resume preserves commits and observations,
renews the run budget, and does not clear native approval denials or grant permission itself.
