## {{ UNRELEASED_VERSION }} - [{{ UNRELEASED_DATE }}]({{ UNRELEASED_LINK }})

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
