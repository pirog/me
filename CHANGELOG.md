## {{ UNRELEASED_VERSION }} - [{{ UNRELEASED_DATE }}]({{ UNRELEASED_LINK }})

## v1.0.0-beta.9 - [August 25, 2026](https://github.com/pirog/me/releases/tag/v1.0.0-beta.9)

- Added GitHub SSH host keys to `~/.ssh/known_hosts` before bootstrap repository clones. [#43](https://github.com/pirog/me/pull/43)
- Added `$piro-automation` with declarative approval-gated reconciliation, Doctor drift reporting, a paused smoke task, and projectless weekday morning closeout and daily planning tasks. [#50](https://github.com/pirog/me/issues/50)
- Added `$piro-clean-up-task` for evidence-gated archival across PR, Git, retained-checkout, and conversation-only outcomes. [#39](https://github.com/pirog/me/pull/39)
- Added `$piro-find-work` for read-only, goal-aware assignment recommendations across reviewed actors and unassigned GitHub issues. [#46](https://github.com/pirog/me/issues/46)
- Added `$piro-plan-work` with `GOALS.md` fallback, opt-in Lando discovery, bounded capacity, and exact Codex task selection.
- Added `$piro-work-on-task` for issue and same-repository pull-request planning in Codex-managed worktrees. [#39](https://github.com/pirog/me/pull/39)
- Added shared `ACTORS.md` and `WORK_REPOS.md` inputs for work-planning actors, repository priorities, and discovery scopes. [#45](https://github.com/pirog/me/issues/45)
- Fixed the shared Codex default to use the ChatGPT-compatible `gpt-5.6-sol` model ID. [#39](https://github.com/pirog/me/pull/39)
- Removed `Task score` from Plan Work evidence, ordering, output, and missing-data rules. [#47](https://github.com/pirog/me/issues/47)
- Removed the pre-seeded `tanaabot` OpenClaw identity and workspace while retaining the opt-in dependency bundle. [#39](https://github.com/pirog/me/pull/39)
- Renamed `$piro-me-readiness` to `$piro-me-doctor` and added grouped, versioned diagnostics with focused remediation. [#39](https://github.com/pirog/me/pull/39)
- Updated the machine profile and `$piro-me-doctor` to require Homebrew `node@26` and `.tool-versions` Node 26. [#43](https://github.com/pirog/me/pull/43)

## v1.0.0-beta.8 - [July 27, 2026](https://github.com/pirog/me/releases/tag/v1.0.0-beta.8)

### New Features

- Added a pre-seeded OpenClaw development workspace for `tanaabot` (`MODEL L3-37`). [#33](https://github.com/pirog/me/pull/33)
- Added `Brewfile.openclaw` as an opt-in OpenClaw app and CLI profile, removing OpenClaw from the default bootstrap. [#33](https://github.com/pirog/me/pull/33)

### Bug Fixes

- Fixed Bun resolution and readiness checks to require the exact Homebrew-managed `1.3.14` runtime. [#33](https://github.com/pirog/me/pull/33)
- Fixed Zsh startup on hosts with insecure completion paths by removing unused shell-managed completions.

### Developer Improvements

- Refactored `aisync`, `codexsync`, `$piro-me-readiness`, and `piro-skill-author` into scoped modules with focused unit coverage. [#33](https://github.com/pirog/me/pull/33)
- Updated `piro-skill-author` to generate OpenClaw metadata and optimize existing skills and skill portfolios. [#33](https://github.com/pirog/me/pull/33)

## v1.0.0-beta.7 - [July 14, 2026](https://github.com/pirog/me/releases/tag/v1.0.0-beta.7)

### Breaking Changes

- Removed the external Janus runtime requirement in favor of a self-contained Homebrew Vim profile. [#32](https://github.com/pirog/me/pull/32)
- Removed Oh My Zsh and Powerlevel10k from the personal shell profile. [#32](https://github.com/pirog/me/pull/32)
- Removed public `--me` and `PIROME_ME` payload selection; `boot.sh` now resolves the checkout automatically. [#30](https://github.com/pirog/me/pull/30)

### New Features

- Added automatic `me` payload materialization, safe refresh, and repeatable `--tanaab` repository checkout and plugin-link reconciliation. [#30](https://github.com/pirog/me/pull/30)
- Added file-backed Warp settings with Tanaab and Solarized dark and light themes. [#32](https://github.com/pirog/me/pull/32)
- Added a portable Tanaab palette and matching Codex TUI theme. [#32](https://github.com/pirog/me/pull/32)
- Added a VS Code dotpkg with four complete Tanaab UI and syntax themes. [#32](https://github.com/pirog/me/pull/32)

### Bug Fixes

- Fixed Codex config sync to reject local overrides that would silently shadow shared settings. [#30](https://github.com/pirog/me/pull/30)
- Fixed Codex theme serialization to preserve empty font tables.
- Fixed hosted bootstrap confirmation through piped invocations by reading from `/dev/tty`. [#30](https://github.com/pirog/me/pull/30)
- Fixed `me` bootstrap on `agentbox` hosts to skip conflicting desktop casks and recognize daemon-backed Tailscale readiness. [#30](https://github.com/pirog/me/pull/30)

### Improvements

- Updated Codex defaults with `gpt-5.6`, shared desktop appearance preferences, Tanaab chrome colors, and v2 pet sprites.
- Updated the Homebrew inventory with a trusted Bun tap plus Codex, Chrome, OpenClaw, Tailscale, VS Code, Vim, and Warp. [#26](https://github.com/pirog/me/pull/26) [#30](https://github.com/pirog/me/pull/30) [#32](https://github.com/pirog/me/pull/32)
- Updated published documentation with `/llms.txt` metadata and an `ADVANCED.md` configuration reference.

## v1.0.0-beta.6 - [June 3, 2026](https://github.com/pirog/me/releases/tag/v1.0.0-beta.6)

- Added `l337` and `l338` Codex pet profiles.
- Fixed Vim Janus bootstrap paths and documented the external Janus runtime expectation. [#23](https://github.com/pirog/me/pull/23)
- Updated GitHub CLI defaults to use SSH for Git operations.
- Updated readiness checks for Homebrew `node@24`, active `node` path/version, Vim links, and the Janus runtime. [#23](https://github.com/pirog/me/pull/23) [#25](https://github.com/pirog/me/pull/25)
- Updated shell startup to load Homebrew cleanly and prefer Homebrew `node@24` on `PATH`. [#25](https://github.com/pirog/me/pull/25)
- Updated SSH and bootstrap defaults from `botbox1` toward `agentbox1` while preserving legacy host compatibility.
- Updated the machine profile to require Homebrew `node@24` and `.tool-versions` Node 24. [#25](https://github.com/pirog/me/pull/25)

## v1.0.0-beta.5 - [May 24, 2026](https://github.com/pirog/me/releases/tag/v1.0.0-beta.5)

- Fixed `boot.sh` so delegated Bootbox runs stay non-interactive after the wrapper confirmation gate. [#22](https://github.com/pirog/me/pull/22)

## v1.0.0-beta.4 - [May 2, 2026](https://github.com/pirog/me/releases/tag/v1.0.0-beta.4)

### Codex

- Added `$piro-me-readiness` for read-only validation of this `me` checkout, Codex plugin links, app connector identities, and local machine readiness. [#19](https://github.com/pirog/me/pull/19)
- Added readiness maintenance guidance so future machine prerequisites are kept in the right source of truth. [#19](https://github.com/pirog/me/pull/19)
- Updated Codex guidance for monday connector identity checks and generated pull request title prefixes. [#19](https://github.com/pirog/me/pull/19)

### Machine Profile

- Added manual setup guidance for 1Password Developer features, GitHub and monday Codex app connectors, and Tailscale readiness. [#19](https://github.com/pirog/me/pull/19)
- Updated the Brewfile for 1Password Environment support and Tailscale app readiness. [#19](https://github.com/pirog/me/pull/19)

## v1.0.0-beta.3 - [April 26, 2026](https://github.com/pirog/me/releases/tag/v1.0.0-beta.3)

- Updated release archives to reinstall production dependencies before packaging so dev dependencies stay out of GitHub assets.

## v1.0.0-beta.2 - [April 26, 2026](https://github.com/pirog/me/releases/tag/v1.0.0-beta.2)

### Codex

- Added generated Codex config sync with portable shared defaults and machine-local overrides.
- Added portable Codex defaults for `gpt-5.5`, `xhigh` reasoning, Fast mode, Memories, VS Code file links, and disabled commit attribution.
- Updated `piroplugin` and repo-local Codex tooling for GPT-5.5. [#17](https://github.com/pirog/me/pull/17)

### Developer Tools

- Added `aisync` and `codexsync` Bun CLIs for AI dotpkg restows and plugin cache management. [#15](https://github.com/pirog/me/pull/15)
- Added focused unit tests for Codex sync helpers, config generation, and CLI support.
- Updated `aisync` and `codexsync` help output to match shared Tanaab CLI standards.

## v1.0.0-beta.1 - [April 13, 2026](https://github.com/pirog/me/releases/tag/v1.0.0-beta.1)

### Bootstrap

- Added `--me` and `--tanaab` materialization of `~/tanaab/me` and `~/tanaab/canon` before applying the machine profile.
- Added hosted `boot.sh` installs at [boot.pirog.me](https://boot.pirog.me/boot.sh).
- Removed legacy `piroboot.sh`.

### Machine Profile

- Added `Brewfile` as the base dependency inventory for Git, GitHub CLI, Bun, Node, Python, Stow, 1Password CLI, Tailscale, ImageMagick, and Zsh.
- Added `ai` dotpkg for Codex defaults and `Pirostore` marketplace config.
- Added `gh` dotpkg for GitHub CLI config.
- Added `git` dotpkg for Git config and Lando includes.
- Added `hyperdrive` dotpkg for Hyperdrive config.
- Added `lando` dotpkg for Lando config.
- Added `ssh` dotpkg for SSH config and public-key material.
- Added `theme` dotpkg for Tanaab light and dark theme assets.
- Added `vim` dotpkg for Vim config.
- Added `zsh` dotpkg for shell and prompt config.

### Codex

- Added `Pirostore` marketplace entries for `piroplugin` and the paired `tanaab` plugin.
- Added `piro-skill-author` as the initial repo-local Pirobased skill.
- Added `piroplugin` as the repo's Codex plugin bundle and release archive surface.

## v0.3.1 - [April 11, 2026](https://github.com/pirog/me/releases/tag/v0.3.1)

- Fixed bug causing `prepare-release-action` to export an incorrectly formated `plugin.json`

## v0.3.0 - [April 11, 2026](https://github.com/pirog/me/releases/tag/v0.3.0)

- Added `piroplugin` Codex plugin packaging, version stamping, and GitHub Release archive uploads alongside the hosted `dist/` surface.
- Added repo-local `AGENTS.md` guidance for CI-owned `Leia` and `bun run build` validation plus `boot.sh` and plugin invariants.
- Added the initial `piro-skill-author` surface, shared `references/skill-standard.md`, and local `piro` or `pirog` skill canon for repo-contained skills.
- Moved most reusable Tanaab coding, template, and canon skill work into `tanaabased/canon`, narrowing this repo to Piro-specific skills and plugin assets.
- Removed the bundled Brewfile-generation surface after splitting that workflow into its own repository.
- Updated the hosted bootstrap surface to use a thin `boot.sh` wrapper around bootbox while keeping legacy `piroboot.sh` in-tree as reference.

## v0.2.1 - [March 13, 2026](https://github.com/pirog/me/releases/tag/v0.2.1)

- Added a `theme` dotfiles package with importable Tanaab theme JSON files and documented the available stow packages in the README
- Expanded `tanaab-coding` guidance for Bun-backed JavaScript GitHub Actions with a dedicated action README template, composite-action runtime conventions, focused input-test scaffolds, and workflow smoke-test assertion patterns
- Relaxed `tanaab-coding` `utils/` guidance so repo-shaped helpers are reviewed case-by-case instead of being treated as automatic violations
- Removed hardcoded SSH `HostName` IP mappings from the shared ssh dotfile package so host aliases can resolve through local hosts or DNS

## v0.2.0 - [March 12, 2026](https://github.com/pirog/me/releases/tag/v0.2.0)

- Added `skill-sensei` for Pirog and Tanaab based skill generation, stack auditing, and branded skill standardization
- Added `tanaab-coding` as the umbrella router for coding, testing, release, documentation, and template work
- Added `tanaab-coding-core` as the shared engineering doctrine layer for the Tanaab coding stack
- Added `tanaab-documentation` for README structure, durable docs policy, and README-to-VitePress escalation decisions
- Added `tanaab-frontend` for Vue 3, VitePress 1, and SCSS frontend implementation guidance
- Added `tanaab-github-actions` for workflow authoring, release automation mechanics, and GitHub-hosted CI triage
- Added `tanaab-javascript` for Bun-first JavaScript and TypeScript implementation, runtime, and linting guidance
- Added `tanaab-release` for changelog, release-note, release-contract, and release-readiness guidance
- Added `tanaab-shell` for shell scripting, CLI contract, logging, and shellcheck-oriented shell guidance
- Added `tanaab-templates` for reusable README, CLI, linting, and shell scaffolds across the coding stack
- Added `tanaab-testing` for test strategy, focused coverage, and CI or release gate recommendations
- Consolidated prior one-off coding skills such as `bunify`, `changelog-updates`, `cli-styles`, `esmify`, `gh-fix-ci`, and `mocha-tests` into the `tanaab-coding` stack
- Introduced shared stack doctrine and reusable templates for CLI structure, lint and format config, README structure, and cross-skill routing

## v0.1.2 - [March 9, 2026](https://github.com/pirog/me/releases/tag/v0.1.2)

- Fixed bug preventing `brew shellenv` from `eval`ing correctly
- Added `sync-verified` to `tanaabot` release flow

## v0.1.1 - [March 9, 2026](https://github.com/pirog/me/releases/tag/v0.1.1)

- Fixed bug preventing `dist` files from being stored in `git`

## v0.1.0 - [March 9, 2026](https://github.com/pirog/me/releases/tag/v0.1.0)

- Added Bun-based build, lint, and release packaging that stamps versioned shell artifacts into `dist/`.
- Added CI workflows for linting, release artifact validation, and a macOS smoke test of the bootstrap script.
- Added conflict-aware dotfile installation with GNU Stow, including simulation and automatic backups before overwriting files.
- Added reusable AI and Codex skill bundles alongside personal dotfiles for git, ssh, vim, zsh, and related tools.
- Added the `piroboot.sh` bootstrap script for supported macOS machines with Homebrew, Brewfiles, dotfile packages, and optional 1Password-managed SSH keys.
