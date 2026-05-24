## {{ UNRELEASED_VERSION }} - [{{ UNRELEASED_DATE }}]({{ UNRELEASED_LINK }})

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
