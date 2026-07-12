# Work Handoff

This document summarizes the recent work on `me`, the decisions behind it, and the context needed to continue in another Codex instance.

## Repository Purpose

`me` bootstraps a supported macOS machine into an environment that approximates `pirog`. It installs the expected Homebrew packages, applies repo-owned dotfiles, materializes selected Tanaab repositories, retrieves optional SSH keys through 1Password, and provides the `piroplugin` Codex plugin and its skills.

`boot.sh` is intentionally a thin orchestration layer over Bootbox. Bootbox owns generic package and dotfile reconciliation; `me` owns the opinionated personal payload and machine setup. Netlify serves the generated `dist/` output, while source changes belong in `boot.sh`, `Brewfile`, `dotfiles/`, and the plugin source surfaces rather than directly in `dist/`.

## Architectural Decisions

- Do not add operator and Agentbox profiles. The overlap between the two environments is much larger than their differences, and Agentbox already owns its host-level OpenClaw and service setup.
- Treat `me` as the `pirog` user layer. It can be run on a normal workstation or on a machine already configured by Agentbox.
- Detect an installed Agentbox from its installed health script and launchd plist, not from the presence of an Agentbox source checkout.
- Assume Agentbox may be installed before `me`. When it is present, `me` adapts automatically instead of requiring another public mode or ignore option.
- Keep the 1Password CLI available everywhere because `me` can use it to retrieve SSH keys. Only the desktop 1Password cask and desktop-specific readiness checks are omitted on Agentbox hosts.
- Keep Tailscale ownership unambiguous: a normal workstation uses the `tailscale-app` cask, while an Agentbox host keeps the formula and `tailscaled` service installed by Agentbox.
- Keep Leia scenarios CI-only. Do not run Leia locally unless explicitly requested.
- Do not hand-edit `dist/`. `bun run build` remains CI/release-owned unless release output specifically needs local verification.

## Completed Work

### Payload and source resolution

- Removed public `me` source/version selection in favor of automatic payload discovery.
- Kept `PIROME_PAYLOAD_DIR` as a hidden development and CI override.
- The payload is resolved in this order: explicit override, a source-relative checkout, an existing `~/tanaab/me`, then a new SSH clone into `~/tanaab/me`.
- Canonical checkouts are refreshed only when they are clean, on `main`, tracking `origin/main`, and connected to the expected repository. Local work is never discarded.
- Clarified that the wrapper version is metadata for `boot.sh`; the payload revision may be newer.

### Tanaab repository materialization

- Replaced the old single-purpose Canon source behavior with repeatable `--tanaab` repository names, a comma-separated `--tanaabs` convenience option, and the matching environment-variable forms.
- Selected repositories are cloned by SSH under `~/tanaab` and safely refreshed using the same conservative rules as the canonical `me` checkout.
- There is no default Tanaab repository list.
- Every selected repository is checked on every run for a valid Codex plugin manifest. Plugin links are created when a repository becomes a plugin and removed when it stops being one.
- Plugin-link removal is idempotent, including dangling symlinks.

### Wrapper behavior and safety

- Added an early macOS administrator-group gate without introducing a broad sudo session gate. Bootbox and Homebrew retain ownership of the privileged work they actually require.
- Delegated Bootbox runs now use the expected quiet and external-pseudoterminal environment controls.
- Interactive input is read from `/dev/tty`, so `curl ... | bash` can still prompt when a terminal is available.
- Contradictory interactive controls fail deterministically.
- Restored hidden SSH-key convenience input and generic debug support during the cleanup pass.
- Added the trusted `oven-sh/bun` tap declaration needed by Homebrew.

### Test and agent-guidance reorganization

- Reorganized Leia coverage around behavior: input precedence and validation are centralized in an inputs scenario, while functional default behavior lives in a defaults scenario.
- Removed redundant destroy tests and the example workflow's destroy-test flag where teardown did not test product behavior.
- Updated root and example `AGENTS.md` guidance for layered tests and Leia constraints.
- Removed problematic JavaScript-literal characters from Leia expectations and documented the known hazards, especially backticks and shell-expansion-like bracket forms.

### Documentation and Codex configuration

- Restructured the README around an option-first quick start and usage flow, including an online help one-liner and a short reusable local-install path.
- Added the Netlify deployment badge.
- Added `ADVANCED.md` with the complete option and environment-variable reference plus payload, package, dotfile, Codex plugin, and helper details.
- Added `site/llms.txt` as a concise machine-readable repository guide.
- Expanded and clarified root and example agent guidance.
- Pruned machine-local Codex preferences such as model, reasoning effort, and personality from `config.local.toml` so shared configuration controls them. Local configuration is now reserved for genuinely machine-specific overrides.
- Regenerated and synchronized the Codex configuration and plugin cache after those changes.

## Latest Agentbox-Aware Changes

The current work makes the shared Brewfile and readiness checks adapt automatically to a previously installed Agentbox:

- The canonical Tailscale cask name is now `tailscale-app`.
- `boot.sh` recognizes Agentbox only when both of these installed surfaces exist:
  - `/opt/tanaab/agentbox/bin/health.sh`
  - `/Library/LaunchDaemons/dev.tanaab.agentbox.health.plist`
- On an Agentbox host, the final Bootbox apply preserves any inherited `HOMEBREW_BUNDLE_CASK_SKIP` entries and appends deduplicated skips for `tailscale-app` and `1password`.
- If the Tailscale formula is present without the full Agentbox markers, `me` skips only `tailscale-app` to avoid a formula/cask collision.
- Planning and debug output expose the detected host state and effective cask skip list.
- Readiness uses the same Agentbox markers. On Agentbox hosts it:
  - does not require the 1Password desktop app, desktop vault, or desktop Environment setup;
  - still requires the `op` CLI and retains the token-fallback warning;
  - requires `tailscaled` and still verifies `tailscale status --json`;
  - does not duplicate Agentbox's full health check.
- Added focused readiness tests for the Agentbox path and the missing-`tailscaled` failure.
- Added a CI-only `examples/agentbox` Leia scenario that proves inherited cask skips are preserved, desktop casks remain absent, formula Tailscale remains installed, and the beta 1Password CLI remains available.
- Added the Agentbox example to the pull-request example matrix and updated README, advanced docs, agent guidance, the changelog, `site/llms.txt`, and readiness skill guidance.

## Validation Completed

The latest implementation has passed:

- `bash -n boot.sh`
- focused isolated Bash checks for Agentbox detection, cask-skip merging and deduplication, formula-only fallback, and Bootbox environment propagation
- `bun run lint`
- `bun run test` with 56 passing tests
- `bun run codex:validate`
- `bun run codex:check` after `bun run codex:sync`
- `git diff --check`

Leia and `bun run build` were intentionally not run locally under repository policy. The new Agentbox example is expected to receive its functional validation in CI.

## Current Follow-Up Context

- `TASKS.md` has been pruned to remove work completed during this effort and refreshed with the remaining cross-repository backlog.
- The main remaining `me` themes are application selection, UI/theme dotfiles, remote-management and authorized-key behavior, machine addressing, and deciding which additional Codex/OpenClaw/Agentbox plugin surfaces belong here.
- Bootbox follow-up includes its README/badges and clarifying its supported Homebrew user/admin model.
- Leia follow-up remains upstream: improve its handling of JavaScript literal characters and keep the shared Canon guidance aligned.
- Agentbox follow-up includes final verification of OpenClaw update behavior, mDNS hostname handling, concise completion output, phone access, theming, plugin lifecycle, and possible Bun packaging.
- If synchronized Codex skill or plugin surfaces do not appear after pulling these changes on the new machine, run `bun run codex:sync` and restart Codex.
