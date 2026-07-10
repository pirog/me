# Advanced

This reference covers the installed machine profile, the complete public `piroboot` configuration
surface, normal checkout behavior, and the separate Codex configuration and plugin sync workflows.
Start with the [README](./README.md) for the primary setup path.

## What Gets Installed

### Dependencies

[`Brewfile`](./Brewfile) is the source of truth for the base machine inventory.

Applications:

- 1Password
- the beta 1Password CLI required for 1Password Environments
- Codex CLI and the Codex desktop app
- Tailscale

Command-line tools and runtimes:

- Bun from the trusted `oven-sh/bun` tap
- curl, Git, GitHub CLI, ImageMagick, jq, GNU Stow, and Zsh
- Node.js 24
- Python 3.14

Bootbox installs or repairs the core prerequisites before `me` applies the complete Brewfile.

### Dotfiles

`me` applies each top-level package under [`dotfiles/`](./dotfiles/) to `$HOME` with GNU Stow:

- [`ai`](./dotfiles/ai): shared Codex defaults, global agent guidance, pet profiles, the local
  `Pirostore` marketplace definition, and plugin links.
- [`gh`](./dotfiles/gh): GitHub CLI configuration.
- [`git`](./dotfiles/git): Git configuration, including the Lando-specific include.
- [`hyperdrive`](./dotfiles/hyperdrive): Hyperdrive application configuration.
- [`lando`](./dotfiles/lando): Lando configuration.
- [`ssh`](./dotfiles/ssh): SSH configuration and public-key material.
- [`theme`](./dotfiles/theme): Tanaab light and dark theme assets.
- [`vim`](./dotfiles/vim): Vim wrapper and customization files. The Janus runtime remains an
  external dependency expected at `~/.vim/janus/vim`.
- [`zsh`](./dotfiles/zsh): shell and prompt configuration.

### Codex Plugin And Skills

The repository is packaged as `piroplugin` through
[`.codex-plugin/plugin.json`](./.codex-plugin/plugin.json). It currently includes:

- [`piro-me-readiness`](./skills/me-readiness/): verifies that the checkout, macOS profile,
  desktop-backed 1Password access, Tailscale, Codex plugin links, and connector identities are ready
  for Codex work as `pirog`.
- [`piro-skill-author`](./skills/skill-author/): creates, standardizes, and validates Pirobased
  repository-local skills.

Broader shared canon skills come from the paired `tanaab` plugin. The `ai` dotfile package installs
local links for both plugins and publishes their `Pirostore` marketplace entries.

### Tanaab Canon

By default, `piroboot` clones `git@github.com:tanaabased/canon.git` into `~/tanaab/canon`. The
checkout supplies shared Tanaab plugin assets and remains separate from the Piro-specific sources in
this repository.

Use `--tanaab off` to skip it, a local Git repository path to use local work, or a release version
when you want an archived canon payload.

## Configuration Reference

CLI options override environment variables, which override defaults. Run the hosted help for the
exact current contract:

```sh
/bin/bash -c "$(curl -fsSL https://boot.pirog.me/boot.sh)" piroboot --help
```

### `--ssh-key`

| Field       | Value                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Environment | `PIROME_SSH_KEY`                                                                       |
| Default     | `vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_agentbox1`          |
| Values      | Repeatable `vault/item[:filename]` option or comma-separated environment-variable list |
| Description | Installs private SSH keys from 1Password.                                              |

Repeat `--ssh-key` to select more than one item:

```sh
piroboot \
  --op-token "$OP_TOKEN" \
  --ssh-key "vmruk4ny353aly6tbom7z3v2hy/id_pirog" \
  --ssh-key "vmruk4ny353aly6tbom7z3v2hy/id_agentbox1"
```

The optional filename overrides the destination filename under `~/.ssh`. Without it, the 1Password
item name is used.

### `--op-token`

| Field       | Value                                                       |
| ----------- | ----------------------------------------------------------- |
| Environment | `PIROME_OP_TOKEN`; falls back to `OP_SERVICE_ACCOUNT_TOKEN` |
| Default     | unset                                                       |
| Values      | 1Password service account token                             |
| Description | Authenticates private SSH-key retrieval from 1Password.     |

The token is required while the configured SSH-key list is non-empty. The option-first form is:

```sh
piroboot --op-token "$OP_TOKEN"
```

Use the environment-variable form when keeping the token out of shell history matters:

```sh
PIROME_OP_TOKEN="$OP_TOKEN" piroboot
```

Debug and planning output mask the token.

### `--tanaab`

| Field       | Value                                                              |
| ----------- | ------------------------------------------------------------------ |
| Environment | `PIROME_TANAAB`                                                    |
| Default     | `ssh`                                                              |
| Values      | `ssh`, local Git repository path, release version, or falsey value |
| Description | Chooses the source for `~/tanaab/canon`.                           |

Supported source forms:

- `ssh` clones `git@github.com:tanaabased/canon.git`.
- A local Git repository path copies the selected local checkout.
- A semantic version such as `v0.2.0` downloads the corresponding GitHub Release archive.
- `0`, `false`, `no`, `off`, or `null` disables Tanaab materialization.

```sh
piroboot --op-token "$OP_TOKEN" --tanaab ssh
piroboot --op-token "$OP_TOKEN" --tanaab "$HOME/tanaab/canon"
piroboot --op-token "$OP_TOKEN" --tanaab v0.2.0
piroboot --op-token "$OP_TOKEN" --tanaab off
```

The target is always `~/tanaab/canon`.

### `-y`, `--yes`

| Field       | Value                                      |
| ----------- | ------------------------------------------ |
| Environment | `NONINTERACTIVE`                           |
| Default     | unset                                      |
| Values      | `--yes` or a truthy environment value      |
| Description | Accepts the plan and runs without prompts. |

```sh
piroboot --op-token "$OP_TOKEN" --yes
```

### `--force`

| Field       | Value                                             |
| ----------- | ------------------------------------------------- |
| Environment | `PIROME_FORCE`                                    |
| Default     | off                                               |
| Values      | Flag or truthy environment value                  |
| Description | Allows supported existing targets to be replaced. |

`--force` applies to supported Bootbox operations, existing SSH-key destinations, and the Tanaab
target. It never discards or replaces local work in `~/tanaab/me`.

### `--debug`

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| Environment | `PIROME_DEBUG`                         |
| Default     | off                                    |
| Values      | Flag or truthy environment value       |
| Description | Shows detailed wrapper debug messages. |

Debug output masks the 1Password token and does not log raw arguments.

### `--version`

Prints the running wrapper version and exits:

```sh
piroboot --version
```

### `-h`, `--help`

Prints the current public CLI and environment-variable contract and exits:

```sh
piroboot --help
```

### `CI`

| Field       | Value                                       |
| ----------- | ------------------------------------------- |
| Option      | none                                        |
| Default     | unset                                       |
| Values      | Truthy environment value                    |
| Description | Runs the wrapper in noninteractive CI mode. |

## `me` Checkout

When `boot.sh` runs from a valid source checkout, it uses that checkout in place and does not update
it. A hosted run uses `~/tanaab/me`, cloning `git@github.com:pirog/me.git` there when the checkout
does not exist.

An existing canonical checkout is refreshed only when it is clean, on `main`, tracking
`origin/main`, and connected to `@pirog/me`. Otherwise the wrapper warns and uses the current
checkout without resetting, merging, rebasing, deleting, or overwriting local work.

The resolved checkout must contain `boot.sh`, `Brewfile`, `dotfiles/`, and
`.codex-plugin/plugin.json` before the machine profile is applied.

## Codex Configuration And Plugin Sync

The Codex configuration under `dotfiles/ai` uses three layers:

- `dotfiles/ai/.codex/config.shared.toml` is repository-owned and contains portable global defaults.
- `~/.codex/config.local.toml` is machine-owned and contains project trust, local paths,
  notifications, marketplace paths, plugin cache paths, and other machine-specific values.
- `~/.codex/config.toml` is generated from the shared and local inputs; do not edit it directly.

Local configuration may add settings alongside shared tables, but it may not override an exact key
owned by the shared file.

Use `ai:sync` to restow `dotfiles/ai` into `$HOME` and regenerate the installed Codex
configuration:

```sh
bun run ai:sync
```

Set `TANAAB_CODEX_CONFIG_SYNC=false` or pass `--no-codex-config` to `aisync` when a restow should
skip configuration generation.

Plugin cache management is separate:

```sh
bun run codex:validate
bun run codex:check
bun run codex:sync
```

- `codex:validate` validates the source plugin manifest, skills, MCP stub, and workflow references.
- `codex:check` compares the installed `piroplugin` cache with the managed source surface.
- `codex:sync` refreshes that installed cache when local plugin changes should become available to
  Codex.

After a plugin cache refresh, restart Codex when the current app session does not pick up the changed
plugin assets automatically.
