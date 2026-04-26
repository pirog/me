# Me

`me` seeds a macOS 26+ machine with the dependencies, dotfiles, and Codex plugin assets that
approximate how `@pirog` does development. It is primarily consumed through the hosted `boot.sh`
wrapper at `https://boot.pirog.me/boot.sh`, and it also ships the `piroplugin` Codex plugin bundle
built from this repo.

> Supports macOS 26 or newer.

## Overview

`boot.sh` is a thin hosted wrapper around [bootbox](https://github.com/tanaabased/bootbox). It
installs core tools and requested SSH keys, materializes `~/tanaab/me`, materializes
`~/tanaab/canon` unless disabled, and then applies the `me` checkout's [`Brewfile`](./Brewfile)
plus top-level [`dotfiles/`](./dotfiles/) packages onto `$HOME`.

After bootstrap, open Codex and install the `piroplugin` and `tanaab` plugins from the `Pirostore`
marketplace so their skills are available in the app.

## Quickstart

`boot.sh` requires a 1Password service account token so it can fetch private SSH keys during
bootstrap. Provide it with `PIROME_OP_TOKEN` or `--op-token`.

```sh
curl -fsSL https://boot.pirog.me/boot.sh | PIROME_OP_TOKEN="$OP_TOKEN" bash
```

This default flow:

- installs core dependencies and SSH keys
- clones `git@github.com:pirog/me.git` into `~/tanaab/me`
- clones `git@github.com:tanaabased/canon.git` into `~/tanaab/canon`
- applies the `me` Brewfile and dotpkgs onto `$HOME`

When the script finishes, open Codex and install the `piroplugin` and `tanaab` plugins from
`Pirostore`.

## What Gets Installed

### Brewfile

[`Brewfile`](./Brewfile) is the single source of truth for base machine dependencies. It covers
Homebrew tooling plus the core CLI and runtime stack used here, including Git and GitHub CLI,
Bun/Node/Python, Stow, 1Password CLI, Tailscale, ImageMagick, and Zsh.

### Dotpkgs

- [`ai`](./dotfiles/ai): Codex agent defaults plus the local `Pirostore` marketplace definition for `piroplugin` and `tanaab`.
- [`gh`](./dotfiles/gh): GitHub CLI config.
- [`git`](./dotfiles/git): Git config, including the Lando-specific include.
- [`hyperdrive`](./dotfiles/hyperdrive): Hyperdrive app config.
- [`lando`](./dotfiles/lando): Lando config.
- [`ssh`](./dotfiles/ssh): SSH config plus public-key material.
- [`theme`](./dotfiles/theme): Tanaab light/dark theme JSON assets.
- [`vim`](./dotfiles/vim): Vim config.
- [`zsh`](./dotfiles/zsh): Shell and prompt config.

### Skills

- [`piro-skill-author`](./skills/skill-author/): creates, standardizes, and validates Pirobased repo-local skills.

This plugin surface is intentionally small. Broader shared canon skills come from the paired
`tanaab` plugin.

## Usage

The hosted script is the primary install surface. Environment variables are the easiest way to
customize it without installing a local command first.

- `PIROME_OP_TOKEN` or `--op-token` is required for 1Password-backed SSH-key install.
- `--me` / `PIROME_ME` defaults to `ssh` and supports `ssh`, a local git repo path, or a release version.
- `--tanaab` / `PIROME_TANAAB` defaults to `ssh` and supports `ssh`, a local git repo path, a release version, or a falsey disable value such as `off`.
- The wrapper installs into fixed checkouts at `~/tanaab/me` and `~/tanaab/canon`, then applies the `me` checkout onto the default target of `$HOME`.
- Set `PIROME_TANAAB=off` or `--tanaab off` if you want to skip the canon checkout.

```sh
curl -fsSL https://boot.pirog.me/boot.sh | \
  PIROME_OP_TOKEN="$OP_TOKEN" \
  PIROME_ME="$HOME/src/me" \
  PIROME_TANAAB=off \
  bash
```

## Advanced

If you want a reusable local command, download the script as `piroboot` first.

```sh
curl -fsSL https://boot.pirog.me/boot.sh -o piroboot
chmod +x piroboot
./piroboot --help
```

Common wrapper options:

- `--op-token`: 1Password service account token.
- `--ssh-key`: one or more `vault/item[:filename]` SSH key specs.
- `--me`: `ssh`, a local repo path, or a release version for `~/tanaab/me`.
- `--tanaab`: `ssh`, a local repo path, a release version, or a falsey disable value for `~/tanaab/canon`.
- `--yes`: accept defaults and disable prompts.
- `--force`: replace supported existing targets.
- `--debug`: show wrapper debug output.
- `--version`: print the wrapper version.
- `--help`: print the current CLI and envvar contract.

Use `./piroboot --help` or `bash ./boot.sh --help` as the source of truth for the exact current
flag and environment-variable surface.

Hosted-script example with envvars:

```sh
curl -fsSL https://boot.pirog.me/boot.sh | \
  PIROME_OP_TOKEN="$OP_TOKEN" \
  PIROME_SSH_KEY="vmruk4ny353aly6tbom7z3v2hy/id_pirog" \
  PIROME_ME=ssh \
  PIROME_TANAAB=ssh \
  PIROME_DEBUG=1 \
  bash
```

Local-script example with pinned source values:

```sh
./piroboot \
  --op-token "$OP_TOKEN" \
  --ssh-key "vmruk4ny353aly6tbom7z3v2hy/id_pirog" \
  --me v0.3.1 \
  --tanaab v0.2.0 \
  --yes
```

## Development

This repo uses Bun for repo-local tooling.

```sh
bun install
bun run test
bun run lint
```

For day-to-day local work, the repo ships separate commands for plugin cache refreshes and `ai`
dotpkg restows.

```sh
bun run codex:validate
bun run codex:check
bun run codex:sync
bun run ai:sync
```

- `bun run codex:validate` runs `codexsync validate` to validate the plugin manifest, skills, MCP stub, and workflow script references.
- `bun run codex:check` runs `codexsync check` to check the installed `piroplugin` cache copy.
- `bun run codex:sync` runs `codexsync sync` to refresh that cache copy when you want Codex to pick up local plugin changes.
- `bun run ai:sync` restows [`dotfiles/ai`](./dotfiles/ai/) into `$HOME`.

Run `bun run test` for JavaScript library and helper changes before the relevant lint and plugin
cache checks.

`bun run build` is CI-owned by default. Only run it locally when the task explicitly requires
`dist/` or release verification.

Leia scenarios are also CI-owned by default. Do not run Leia locally unless the task explicitly
needs a local Leia run.

## Issues, Questions and Support

Use the [GitHub issue queue](https://github.com/pirog/me/issues/new/choose) for bugs, regressions,
or feature requests.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history and
[GitHub releases](https://github.com/pirog/me/releases) for published artifacts.

## Maintainers

- [@pirog](https://github.com/pirog)

## Contributors

<a href="https://github.com/pirog/me/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pirog/me" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
