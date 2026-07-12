# `me`

<p align="center">
  <img src="./assets/icon-large-circle.png" alt="pirog" width="180" />
</p>

<p align="center">
  <a href="https://github.com/pirog/me/releases"><img src="https://img.shields.io/github/v/release/pirog/me?include_prereleases&sort=semver" alt="Latest release" /></a>
  <a href="https://app.netlify.com/projects/pirog-boot-me/deploys"><img src="https://api.netlify.com/api/v1/badges/1150311b-5f04-4b40-a722-747abdc6fbf5/deploy-status" alt="Netlify Status" /></a>
  <img src="https://img.shields.io/badge/macOS-26%2B-111827" alt="macOS 26+" />
  <img src="https://img.shields.io/badge/Codex-piroplugin-00c88a" alt="Codex plugin: piroplugin" />
</p>

`me` seeds a macOS machine with the dependencies, dotfiles, identity material, and Codex plugin
assets that approximate how `pirog` does development. It is primarily consumed through the hosted
`boot.sh` wrapper and also ships the `piroplugin` Codex plugin bundle.

> Supports macOS 26 or newer.

## Overview

At a high level, `me`:

- delegates core macOS setup and 1Password-backed SSH-key installation to
  [Bootbox](https://github.com/tanaabased/bootbox)
- installs applications, runtimes, and command-line tools from [`Brewfile`](./Brewfile)
- applies the personal configuration packages under [`dotfiles/`](./dotfiles/) to `$HOME`
- clones or updates the editable `@pirog/me` checkout used as the machine-profile source
- optionally clones or safely updates explicitly selected repositories from
  [`@tanaabased`](https://github.com/tanaabased)
- installs `piroplugin`, Pirobased skills, shared Codex defaults, and local plugin links

For the complete installed-component inventory, see
[ADVANCED.md#what-gets-installed](./ADVANCED.md#what-gets-installed).

## Quickstart

Provide a 1Password service account token and run the hosted bootstrap:

```sh
/bin/bash -c "$(curl -fsSL https://boot.pirog.me/boot.sh)" piroboot \
  --op-token "$OP_TOKEN"
```

The default run installs the configured SSH keys and applies the `me` Brewfile and dotfiles to
`$HOME`. It does not clone Tanaab repositories unless they are selected explicitly.

Run the hosted help directly for the complete option and environment-variable contract:

```sh
/bin/bash -c "$(curl -fsSL https://boot.pirog.me/boot.sh)" piroboot --help
```

## Usage

For repeated use, install the hosted script as a local command in a directory you manage on `PATH`:

```sh
mkdir -p "$HOME/.local/bin"
curl -fsSL https://boot.pirog.me/boot.sh -o "$HOME/.local/bin/piroboot"
chmod +x "$HOME/.local/bin/piroboot"

piroboot --help
```

Run it with flags when you want to keep the selected behavior explicit:

```sh
piroboot \
  --op-token "$OP_TOKEN" \
  --ssh-key "vmruk4ny353aly6tbom7z3v2hy/id_pirog" \
  --tanaab canon \
  --tanaab agentbox
```

Common inputs:

| Option       | Environment variable | Description                                                      |
| ------------ | -------------------- | ---------------------------------------------------------------- |
| `--op-token` | `PIROME_OP_TOKEN`    | 1Password service account token used for private SSH-key access. |
| `--ssh-key`  | `PIROME_SSH_KEY`     | Repeatable `vault/item[:filename]` SSH-key specification.        |
| `--tanaab`   | `PIROME_TANAAB`      | Repeatable repository name from the `@tanaabased` organization.  |
| `--yes`      | `NONINTERACTIVE`     | Accept the plan and run without prompts.                         |
| `--force`    | `PIROME_FORCE`       | Allow supported existing targets to be replaced.                 |
| `--debug`    | `PIROME_DEBUG`       | Show debug output with secrets masked.                           |

Each Tanaab repository name maps to `git@github.com:tanaabased/<repo>.git` and
`~/tanaab/<repo>`. Existing checkouts are updated only when a clean fast-forward is safe. On every
run, verified Tanaab checkouts that declare `.codex-plugin/plugin.json` receive local plugin source
links; installation and enablement remain explicit Codex actions.

### Agentbox Hosts

When the installed Agentbox health script and LaunchDaemon are present, `piroboot` treats the
machine as an Agentbox host. The final `me` Brewfile apply automatically skips the `tailscale-app`
and `1password` desktop casks while preserving any existing Homebrew Bundle cask skips. The beta
`1password-cli@beta` cask remains installed for service-account-backed SSH-key retrieval, and
Agentbox's formula-backed `tailscaled` runtime provides Tailscale.

This automatic behavior assumes Agentbox is installed before `me`; a checkout alone does not mark a
machine as an Agentbox host.

Use [ADVANCED.md](./ADVANCED.md) for the full option and environment-variable reference, installed
components, checkout behavior, and Codex configuration and plugin sync.

## Manual Setup Checklist

Complete these app-backed steps after bootstrap.

### 1Password

These desktop-app steps are not required on a detected Agentbox host.

- Open 1Password, sign in, and unlock it.
- Enable Developer > Integrate with 1Password CLI.
- Enable Developer > Show 1Password Developer experience.
- Use the Brewfile-provided beta 1Password CLI; 1Password Environments require beta CLI support.
- Confirm `op` can access the signed-in account with a read-only check such as `op vault list`.

### Tailscale

Detected Agentbox hosts use Agentbox's managed `tailscaled` runtime instead of `Tailscale.app`.

- Open Tailscale.
- Sign in and connect this machine to the `tanaab.dev` tailnet.
- Confirm `tailscale status --json` reports the local node as running and online.

### Codex

- Open the Brewfile-provided Codex desktop app and sign in.
- Install `piroplugin` from `Pirostore`. If Canon was selected, install `tanaab` as well.
- Connect the GitHub app connector as `pirog`.
- Connect the monday.com app connector as `Michael Pirog` for this `me` environment.

## Verification

After completing the checklist, ask Codex to run `$piro-me-readiness`. Readiness may trigger macOS,
Codex, or 1Password permission prompts while it verifies local desktop-app access; approve those
prompts only when you intentionally requested the check.

## Development

This repository uses Bun for local tooling:

```sh
git clone git@github.com:pirog/me.git
cd me
bun install
bun run test
bun run lint
```

See [ADVANCED.md#codex-configuration-and-plugin-sync](./ADVANCED.md#codex-configuration-and-plugin-sync)
for the separate `ai:sync` and `codex:*` workflows.

`bun run build` and Leia scenarios are CI-owned by default because they generate `dist/` or mutate
macOS runner state.

## Issues, Questions and Support

Use the [GitHub issue queue](https://github.com/pirog/me/issues/new/choose) for bugs, regressions, or
feature requests.

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history and
[GitHub releases](https://github.com/pirog/me/releases) for published artifacts.

## Maintainers

- [@pirog](https://github.com/pirog)

## Contributors

<a href="https://github.com/pirog/me/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pirog/me" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
