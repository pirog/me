# nightly refresh

`🌙 NIGHTLY REFRESH` runs at 23:00 `America/New_York` on each Codex installation where Agent
System Install has activated the declaration. its persistent chat is `NIGHTLY REFRESH` in
`AGENT SYSTEM`. use the current trusted Me binding and runtime routes; never save a machine-specific
home, UUID, or versioned runtime path in the prompt. use `instanceRuntime inspect` for the readable
instance name shown in the card.

## procedure

1. inspect the bound Me checkout and its setup-owned Canon and OpenClaw Agent System source roots.
   record each current commit. require the expected repository origin and clean `main` before
   changing that repository. skip a dirty checkout, task branch, unfinished Git operation, or a
   checkout with active work; report why and continue with unaffected repositories. never stash,
   reset, rebase, or interrupt another task. leave other schedules running.
2. fetch `origin main` and merge only by fast-forward in each eligible checkout. record the resulting
   commit, including unchanged revisions. divergence and denied access are errors, not retry cases.
3. refresh dependencies and plugins for each eligible repository using Me's existing setup repairs,
   from the bound Me workspace. run these commands once per repository, stopping that repository on
   failure; do not run a second dependency install or build:

   ```sh
   bun scripts/setup.js apply plugin me piroplugin
   bun scripts/setup.js apply plugin canon tanaab
   bun scripts/setup.js apply plugin openclaw-agent-system agent-system optional build
   ```

   these repairs install dependencies for Me and Canon; Agent System's `bun run sync` owns its
   dependency installation, build, and provider verification. each repair then uses Codex Tools
   Install to select the source version and cache sync to copy its managed content. verify each
   plugin is installed and enabled and run `bun run codex:check` from each source. a missing optional
   Agent System checkout is still a warning in this three-repository report. if Me itself was skipped,
   skip its mutating setup and the following Install; report the incomplete work.

4. use the existing Agent System Doctor → Install → Doctor skills against the trusted Me binding.
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

## report

return one Markdown quote block after every run, including unchanged days. use ✅ for completed,
verified work, ⚠️ for skips or restart/context needs, and ❌ for failures. use the readable Agent System
instance name in backticks, the local occurrence date, and actual short commits. never label an
unchecked step healthy. keep the card compact, following this shape:

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
