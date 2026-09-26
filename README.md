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

`me` gives a Mac pirog's tools, dotfiles, habits, and prejudices—and gives Codex a job beyond producing
agreeable paragraphs. Workstation setup, goal-driven planning, sensible model selection, and prose
with a pulse, all in one editable profile.

Use it as an operator profile for a person at a Mac, a Codex profile, or an OpenClaw profile
(coming soon).

> Supports macOS 26 or newer.

## Overview

`me` ships with these components:

| Component                                                 | Includes                                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Codex Plugins](./INVENTORY.md#plugins)                   | Optional plugins from the [Pirostore catalog](./dotfiles/ai/.agents/plugins/marketplace.json). |
| [Configuration Files](./INVENTORY.md#configuration-files) | Identity, setup, goals, actors, repository scope, automations, and model profiles.             |
| [Dependencies](./INVENTORY.md#dependencies)               | Base applications and runtimes, plus optional OpenClaw tooling.                                |
| [Dotfiles](./INVENTORY.md#dotfiles)                       | Shell, editor, terminal, Git, SSH, and Codex configuration.                                    |
| [Skills](./INVENTORY.md#skills)                           | Planning, task lifecycle, Voice, and automation management.                                    |

For the full inventory, see [Inventory](./INVENTORY.md).

## Quickstart

For operator and Codex profiles, start by providing a 1Password service account token and running
the hosted bootstrap. It installs applications and dotfiles and retrieves the configured private
SSH keys from 1Password:

```sh
/bin/bash -c "$(curl -fsSL https://boot.pirog.me/boot.sh)" piroboot \
  --op-token "$OP_TOKEN" \
  --tanaab canon:codex-plugin \
  --tanaab openclaw-agent-system:codex-plugin-build
```

For operator-only setup, omit the two `--tanaab` selections. For full command usage, see
[Piroboot](./PIROBOOT.md).

## After Pirobooting

Complete the following manual setup tasks for your operator profile, Codex profile, or both.

### As Operator

- **1Password:** sign in, unlock, and enable Developer > Integrate with 1Password CLI and
  Show 1Password Developer experience. Keep the supplied beta CLI for 1Password Environments;
  check access with `op vault list`.
- **Tailscale:** if using the desktop app, sign in and join `tanaab.dev`. Leave formula-backed
  services in place; `tailscale status --json` should report the local node running and online.

### As Codex Profile

- Sign into Codex and install `piroplugin` from Pirostore; see [plugin sources](./INVENTORY.md#plugins)
  for the npm alternative. Confirm that Agent System
  (`agent-system`) and Canon (`tanaab`) are installed and enabled; the qualified `--tanaab`
  selections in Quickstart install both from source.
- Connect GitHub as `pirog` and monday.com as `Michael Pirog`.
- Review and authorize Agent System's hook through `/hooks`, then start a fresh task.
- Ask Codex:
  `Use $agent-system-codex-binding to bind this plugin to /Users/pirog/tanaab/me.`
  Confirm the checkout containing [`agent.yaml`](./agent.yaml), then start a fresh task to load pirog's identity.
- Run `$agent-system-doctor` to check the profile. If it reports drift, run
  `$agent-system-install` to apply the declared setup steps, then run Doctor again.

## Development

Use the runtimes declared in [`.tool-versions`](./.tool-versions), then work from the `me` checkout:

```sh
# prepare the checkout
git clone git@github.com:pirog/me.git
cd me
bun install --frozen-lockfile --ignore-scripts

# run tests and static checks
bun run test
bun run lint

# apply only the operations needed for your changes

# regenerate codex configuration and restow ai dotfiles into your home directory
bun run ai:sync

# refresh and verify the installed plugin cache
bun run codex:sync
bun run codex:check

# validate automation definitions without changing live schedules
bun run automations:validate

# check saved automations for drift without changing live schedules
bun run automations:check
```

Edit the source files listed in [Inventory](./INVENTORY.md#configuration-files), rather than generated
configuration.

After model-profile changes, refresh both AI configuration and the plugin cache, then check the
defaults in a fresh Codex task. Existing task selections remain unchanged. Saved automations require
separate reconciliation through [`$piro-automation`](./skills/automation/); changing defaults or
validating the manifest does not update them.

For broader profile drift, use Agent System Doctor and Install as described
[above](#as-codex-profile). `bun run build` and Leia scenarios are CI-owned by default: they generate
`dist/` or mutate macOS runner state. Read [the example guidance](./examples/AGENTS.md) before changing
executable examples.

## Issues, Questions and Support

Use the [GitHub issue queue](https://github.com/pirog/me/issues/new/choose) for bugs, regressions, or
feature requests.

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) and [GitHub releases](https://github.com/pirog/me/releases) for
release history. New `piroplugin` releases ship through npm; see [plugin sources](./INVENTORY.md#plugins).

## Maintainers

- [@pirog](https://github.com/pirog)

## Contributors

<a href="https://github.com/pirog/me/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pirog/me" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
