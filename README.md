# Me

<p align="center">
  <img src="./assets/icon-large-circle.png" alt="pirog" width="180" />
</p>

<p align="center">
  <a href="https://github.com/pirog/me/releases"><img src="https://img.shields.io/github/v/release/pirog/me?include_prereleases&sort=semver" alt="Latest release" /></a>
  <img src="https://img.shields.io/badge/macOS-26%2B-111827" alt="macOS 26+" />
  <img src="https://img.shields.io/badge/Codex-piroplugin-00c88a" alt="Codex plugin: piroplugin" />
</p>

`me` seeds a macOS 26+ machine with the dependencies, dotfiles, and Codex plugin assets that
approximate how `@pirog` does development. It is primarily consumed through the hosted `boot.sh`
wrapper at `https://boot.pirog.me/boot.sh`, and it also ships the `piroplugin` Codex plugin bundle
built from this repo.

> Supports macOS 26 or newer.

## Overview

`boot.sh` is a thin hosted wrapper around [bootbox](https://github.com/tanaabased/bootbox). It
installs core tools and requested SSH keys, resolves a `me` payload, materializes
`~/tanaab/canon` unless disabled, and then applies the payload's [`Brewfile`](./Brewfile) plus
top-level [`dotfiles/`](./dotfiles/) packages onto `$HOME`.

After bootstrap, complete the manual setup checklist so the expected apps, plugins, and connector
auth are available.

## Quickstart

`boot.sh` requires a 1Password service account token so it can fetch private SSH keys during
bootstrap. Provide it with `PIROME_OP_TOKEN` or `--op-token`.

```sh
curl -fsSL https://boot.pirog.me/boot.sh | PIROME_OP_TOKEN="$OP_TOKEN" bash
```

This default flow:

- installs core dependencies and SSH keys
- uses a source-relative `me` checkout when the wrapper is run from this repo
- otherwise safely refreshes an existing `~/tanaab/me` checkout or clones `git@github.com:pirog/me.git`
- clones `git@github.com:tanaabased/canon.git` into `~/tanaab/canon`
- applies the `me` Brewfile and dotpkgs onto `$HOME`

When the script finishes, complete the manual setup checklist below.

## Manual Setup Checklist

### 1Password

- Open 1Password.
- Sign in and unlock it.
- Enable Developer > Integrate with 1Password CLI.
- Enable Developer > Show 1Password Developer experience.
- Use the Brewfile-provided beta 1Password CLI; 1Password Environments require beta CLI support.
- Confirm `op` can access the signed-in account with a read-only check such as `op vault list`.

### Tailscale

- Open Tailscale.
- Sign in and connect this machine to the `tanaab.dev` tailnet.
- Confirm `tailscale status --json` reports the local node as running and online.

### Codex

- Open the Brewfile-provided Codex desktop app.
- Sign in to Codex.
- Plugins from `Pirostore`:
  - `piroplugin`
  - `tanaab`
- Codex app connectors:
  - `GitHub`, connected as `pirog`
  - `monday.com`, connected as `Michael Pirog` for this `me` environment

After completing this checklist, ask Codex to run `$piro-me-readiness`. Readiness may trigger
macOS, Codex, or 1Password permission prompts while it verifies local desktop app access. Approve
those prompts only when you intentionally asked Codex to run readiness.

## What Gets Installed

### Brewfile

[`Brewfile`](./Brewfile) is the single source of truth for base machine dependencies. It covers
Homebrew tooling plus the core CLI and runtime stack used here, including Git and GitHub CLI,
Codex CLI and the Codex desktop app, Bun/Node/Python, Stow, the 1Password desktop app and CLI,
Tailscale, ImageMagick, and Zsh.

### Dotpkgs

- [`ai`](./dotfiles/ai): Codex agent defaults, portable global Codex config defaults, and the local `Pirostore` marketplace definition for `piroplugin` and `tanaab`.
- [`gh`](./dotfiles/gh): GitHub CLI config.
- [`git`](./dotfiles/git): Git config, including the Lando-specific include.
- [`hyperdrive`](./dotfiles/hyperdrive): Hyperdrive app config.
- [`lando`](./dotfiles/lando): Lando config.
- [`ssh`](./dotfiles/ssh): SSH config plus public-key material.
- [`theme`](./dotfiles/theme): Tanaab light/dark theme JSON assets.
- [`vim`](./dotfiles/vim): Vim wrapper and customization files. The Janus runtime remains an
  external machine dependency and is expected at `~/.vim/janus/vim`.
- [`zsh`](./dotfiles/zsh): Shell and prompt config.

### Skills

- [`piro-skill-author`](./skills/skill-author/): creates, standardizes, and validates Pirobased repo-local skills.
- [`piro-me-readiness`](./skills/me-readiness/): verifies this `me` repo and macOS user profile are ready for Codex work as `pirog`.

This plugin surface is intentionally small. Broader shared canon skills come from the paired
`tanaab` plugin.

## Usage

The hosted script is the primary install surface. Environment variables are the easiest way to
customize it without installing a local command first.

- `PIROME_OP_TOKEN` or `--op-token` is required for 1Password-backed SSH-key install.
- `--tanaab` / `PIROME_TANAAB` defaults to `ssh` and supports `ssh`, a local git repo path, a release version, or a falsey disable value such as `off`.
- The wrapper uses the source checkout beside the running script when available. Otherwise it uses
  `~/tanaab/me`, cloning `@pirog/me` there when needed.
- The wrapper applies the resolved `me` payload onto the default target of `$HOME`.
- Set `PIROME_TANAAB=off` or `--tanaab off` if you want to skip the canon checkout.

```sh
curl -fsSL https://boot.pirog.me/boot.sh | \
  PIROME_OP_TOKEN="$OP_TOKEN" \
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
- `--tanaab`: `ssh`, a local repo path, a release version, or a falsey disable value for `~/tanaab/canon`.
- `--yes`: accept defaults and disable prompts.
- `--force`: replace supported existing targets.
- `--debug`: show wrapper debug output.
- `--version`: print the wrapper version.
- `--help`: print the current CLI and envvar contract.

Use `./piroboot --help` or `bash ./boot.sh --help` as the source of truth for the exact current
flag and environment-variable surface.

`boot.sh` resolves its `me` payload in this order:

1. the hidden `PIROME_PAYLOAD_DIR` development or CI override;
2. a valid Git checkout beside the real invoked script path;
3. an existing checkout at `~/tanaab/me`;
4. a new SSH clone of `git@github.com:pirog/me.git` at `~/tanaab/me`.

Explicit and source-relative payloads are used in place and are never updated automatically. For an
existing canonical checkout, the wrapper fetches and fast-forwards only when it is clean, on `main`,
tracking `origin/main`, and connected to `@pirog/me`. Otherwise it warns and uses the current checkout
without resetting, merging, rebasing, or deleting local work.

The reported script version describes the wrapper itself. The resolved `me` payload can be newer or
locally modified.

Hosted-script example with envvars:

```sh
curl -fsSL https://boot.pirog.me/boot.sh | \
  PIROME_OP_TOKEN="$OP_TOKEN" \
  PIROME_SSH_KEY="vmruk4ny353aly6tbom7z3v2hy/id_pirog" \
  PIROME_TANAAB=ssh \
  PIROME_DEBUG=1 \
  bash
```

Local-script example with a pinned canon source:

```sh
./piroboot \
  --op-token "$OP_TOKEN" \
  --ssh-key "vmruk4ny353aly6tbom7z3v2hy/id_pirog" \
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
- `bun run ai:sync` restows [`dotfiles/ai`](./dotfiles/ai/) into `$HOME` and generates
  `~/.codex/config.toml` from portable shared defaults plus optional machine-local settings.

The Codex config files under the `ai` dotpkg use a shared/local/generated model:

- `dotfiles/ai/.codex/config.shared.toml` is repo-owned and must contain only portable global
  Codex settings such as personality and stable feature defaults.
- Current shared defaults include `gpt-5.6`, `xhigh` reasoning, disabled automatic commit
  attribution, VS Code file links, Memories, Chronicle, multi-agent support, Fast mode, and
  portable desktop preferences such as the app theme and selected avatar.
- Fast mode is intentional: `service_tier = "fast"` plus `[features].fast_mode = true` can make
  supported Codex turns faster, but may increase credit consumption.
- `~/.codex/config.local.toml` is machine-owned and must not be tracked here. Use it for project
  trust entries, local paths, marketplace paths, notification hooks, plugin cache paths, and other
  machine-specific Codex settings. It may add keys alongside shared tables, but `ai:sync` rejects
  any exact key that would override `config.shared.toml`.
- `~/.codex/config.toml` is generated by `bun run ai:sync`; do not hand-edit it.
- Global instruction preferences that do not have native Codex config keys belong in
  `dotfiles/ai/.codex/AGENTS.md`; this repo intentionally does not use `developer_instructions`
  in shared config.

Set `TANAAB_CODEX_CONFIG_SYNC=false` or pass `--no-codex-config` to skip config generation for one
run.

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
