## {{ UNRELEASED_VERSION }} - [{{ UNRELEASED_DATE }}]({{ UNRELEASED_LINK }})

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
- Added companion `brewgen.sh` tooling to generate filtered Brewfiles from an existing Homebrew installation.
- Added conflict-aware dotfile installation with GNU Stow, including simulation and automatic backups before overwriting files.
- Added reusable AI and Codex skill bundles alongside personal dotfiles for git, ssh, vim, zsh, and related tools.
- Added the `piroboot.sh` bootstrap script for supported macOS machines with Homebrew, Brewfiles, dotfile packages, and optional 1Password-managed SSH keys.
