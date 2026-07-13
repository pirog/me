# Advanced

This reference covers the installed machine profile, the complete public `piroboot` configuration
surface, normal checkout behavior, and the separate Codex configuration and plugin sync workflows.
Start with the [README](./README.md) for the primary setup path.

## What Gets Installed

### Dependencies

[`Brewfile`](./Brewfile) is the source of truth for the base machine inventory.
Bootbox installs or repairs the core prerequisites before `me` applies the complete Brewfile.

#### Agentbox Hosts

On a host already configured by [Agentbox](https://github.com/tanaabased/agentbox), `me`
automatically skips these desktop casks from the Brewfile:

- `1password`
- `tailscale-app`

The beta 1Password CLI remains installed for service-account-backed SSH-key retrieval, while
Agentbox keeps its formula-backed Tailscale runtime in control.

### Dotfiles

`me` applies each top-level package under [`dotfiles/`](./dotfiles/) to `$HOME` with GNU Stow:

- [`ai`](./dotfiles/ai): shared Codex defaults, global agent guidance, pet profiles, the local
  `Pirostore` marketplace definition, and plugin links.
- [`gh`](./dotfiles/gh): GitHub CLI configuration.
- [`git`](./dotfiles/git): Git configuration, including the Lando-specific include.
- [`hyperdrive`](./dotfiles/hyperdrive): Hyperdrive application configuration.
- [`lando`](./dotfiles/lando): Lando configuration.
- [`ssh`](./dotfiles/ssh): SSH configuration and public-key material.
- [`theme`](./dotfiles/theme): low-level portable Tanaab color palette for application-specific
  theme assets.
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
the `piroplugin` link and publishes the local `Pirostore` marketplace. Tanaab checkouts that contain
`.codex-plugin/plugin.json` receive generated local source links; installation and enablement still
happen separately through Codex.

### Tanaab Repositories

Tanaab repository selection is empty by default. Repeat `--tanaab` to clone editable repositories
from `@tanaabased` into matching paths under `~/tanaab`:

```sh
piroboot \
  --op-token "$OP_TOKEN" \
  --tanaab canon \
  --tanaab agentbox
```

Existing selected checkouts are fast-forwarded only when doing so is safe. Plugin-link detection is
separate and examines verified existing `@tanaabased` checkouts on every run, even when no new
repositories are selected.

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

| Field       | Value                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Environment | `PIROME_TANAAB`                                                         |
| Default     | none                                                                    |
| Values      | Repeatable repository name or comma-separated environment-variable list |
| Description | Clones or safely updates repositories from `@tanaabased`.               |

The first CLI occurrence replaces the environment-sourced list. Additional occurrences append,
and duplicate names are collapsed while preserving their first position.

```sh
piroboot --op-token "$OP_TOKEN" --tanaab canon --tanaab agentbox
PIROME_TANAAB="canon,agentbox" piroboot --op-token "$OP_TOKEN"
```

Each name maps deterministically to `git@github.com:tanaabased/<repo>.git` and
`~/tanaab/<repo>`. Local paths, release versions, source selectors, and falsey disable values are
not supported.

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

`--force` applies to supported Bootbox operations and existing SSH-key destinations. It never
discards or replaces local work in `~/tanaab/me` or any Tanaab repository checkout.

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

## Tanaab Repository Checkouts

Selected repositories are cloned over SSH into `~/tanaab/<repo>`. An existing target must be a Git
checkout; the wrapper never deletes or replaces it, including under `--force`.

An existing selected checkout is refreshed only when it is clean, on `main`, tracking
`origin/main`, and connected to the expected `@tanaabased/<repo>` origin. The wrapper otherwise
warns and preserves the current branch, commits, and local work.

After repository materialization, every run scans direct Git checkouts under `~/tanaab` whose
origins match `@tanaabased/<directory-name>`. A checkout containing
`.codex-plugin/plugin.json` receives a generated link under the resolved `me` payload's
`dotfiles/ai/.codex/plugins/` directory. The manifest's `name` determines the link name, so the
`canon` repository correctly becomes the `tanaab` plugin link.

If a verified checkout removes its plugin manifest, generated and installed symlinks resolving
exactly to that checkout are removed. If the manifest exists but is malformed, existing links are
preserved and a warning is emitted. Regular files, directories, and links pointing elsewhere are
never replaced. These links prepare local plugin sources; they do not install or enable plugins in
Codex.

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
