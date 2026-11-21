<h1 align="center">me</h1>

<p align="center">
  <img src="./assets/icon-large-circle.png" alt="pirog" width="180" />
</p>

<p align="center">
  set up a Mac with pirog's tools and dotfiles, and give Codex pirog's guidance for GitHub-backed work.
</p>

<p align="center">
  <a href="https://github.com/pirog/me/releases/latest"><img src="https://img.shields.io/github/v/release/pirog/me?label=STABLE&amp;color=blue" alt="Latest stable release" /></a>
  <a href="https://github.com/pirog/me/releases"><img src="https://img.shields.io/github/v/release/pirog/me?include_prereleases&amp;sort=date&amp;label=EDGE&amp;color=blue" alt="Latest release including prereleases" /></a>
  <a href="https://github.com/pirog/me/actions/workflows/pr-examples-tests.yml?query=event%3Apull_request"><img src="https://img.shields.io/github/actions/workflow/status/pirog/me/pr-examples-tests.yml?event=pull_request&amp;label=LEIA" alt="Leia scenario test status" /></a>
  <a href="https://app.netlify.com/projects/pirog-boot-me/deploys"><img src="https://api.netlify.com/api/v1/badges/1150311b-5f04-4b40-a722-747abdc6fbf5/deploy-status" alt="Netlify bootstrap deployment status" /></a>
</p>

<p align="center">
  <a href="#quickstart"><img src="https://img.shields.io/badge/OS-macOS%2026%2B-6f42c1" alt="Workstation setup for macOS 26 and newer" /></a>
  <a href="#codex-binding"><img src="https://img.shields.io/badge/CODEX-plugin-6f42c1" alt="Set up the piroplugin Codex plugin" /></a>
</p>

## quickstart

workstation setup requires macOS 26 or newer.

for workstation and Codex setup, provide a 1Password service account token and run the hosted
bootstrap. it installs applications and dotfiles and retrieves the configured private SSH keys:

```sh
/bin/bash -c "$(curl -fsSL https://boot.pirog.me/boot.sh)" piroboot \
  --op-token "$OP_TOKEN" \
  --tanaab canon:codex-plugin \
  --tanaab openclaw-agent-system:codex-plugin-build
```

for workstation-only setup, omit the two `--tanaab` selections. see [Piroboot](./PIROBOOT.md)
for the full option reference.

for the skills alone, install `piroplugin` without running the machine bootstrap:

```sh
npx --yes --package=@tanaab/codex-tools@1 -- codex-tools install npm:@pirog/me@latest --marketplace pirostore
```

`piro-skill-author` also requires the Canon (`tanaab`) plugin for shared authoring and validation.

## what ships

pirog's `me` profile ships with:

- [Piroboot](./PIROBOOT.md): the workstation bootstrap script.
- [dependencies](./INVENTORY.md#dependencies): applications and command-line tools.
- [dotfiles](./INVENTORY.md#dotfiles): Stow-managed user configuration.
- [plugins](./INVENTORY.md#plugins): the Pirostore catalog and local source links.
- [skills](./INVENTORY.md#skills): assessment, implementation, replies, authoring, and voice.
- [automations](./INVENTORY.md#automations): issue assignments, updates, and validation jobs.
- [configuration files](./INVENTORY.md#configuration-files): the sources that define the profile.
- [a cheat sheet](./INVENTORY.md#cheat-sheet): common commands and Codex prompts.

## after pirobooting

### operator profile

- **1Password:** sign in, unlock, and enable Developer > Integrate with 1Password CLI and
  Show 1Password Developer experience. keep the beta CLI for 1Password Environments;
  check access with `op vault list`.
- **Tailscale:** if using the desktop app, sign in and join `tanaab.dev`. leave formula-backed
  services in place; `tailscale status --json` should report the local node running and online.

### Codex binding

the quickstart's two `--tanaab` options install Agent System (`agent-system`) and Canon (`tanaab`).
sign into Codex, install `piroplugin` from Pirostore, and confirm all three plugins are enabled.

connect GitHub as `pirog` for ordinary pirog work. authorize Agent System's hook and Piroplugin's
account-policy hooks through `/hooks`, start a fresh chat, and paste:

```text
Use $agent-system-codex-binding to bind this plugin to /Users/pirog/tanaab/me.
```

confirm the workspace containing [`.agent-system/agent.yaml`](./.agent-system/agent.yaml).
binding sets up private account defaults for `pirog` and `tanaabot`. missing defaults trigger setup
when needed; ask Codex Binding to “update my account defaults” to change them.

after binding, start a fresh chat and paste:

```text
Use $agent-system-doctor to check this workspace. Then use $agent-system-install
for any declared setup repairs and to reconcile its automations.
Run $agent-system-doctor again and report anything still unresolved.
```

## usage

### direct invocation

paste the prompt you need into Codex, replacing the placeholder:

```text
# start an issue without enabling scheduled intake
# Task Launch attempts to add you as an assignee
use $agent-system-task-launch to work on <issue URL>.

# continue an existing same-repository PR
use $agent-system-task-launch to continue <PR URL>.

# retire managed work without closing the GitHub issue
use $agent-system-task-retirement to clean up <issue URL>.

# clean up one explicitly selected unmanaged chat
use $agent-system-task-retirement to clean up chat <exact chat ID>.

# check workspace readiness without applying repairs
use $agent-system-doctor to check this workspace.

# rewrite supplied prose in the shared voice
use $piro-voice to rewrite the following text: <text>.
```

see the [full cheat sheet](./INVENTORY.md#cheat-sheet) for maintenance and other prompts.

### issue assignments

assignment intake starts work when an approved assigner assigns an eligible issue to you. scheduled
issue pickup can also find and assign eligible issues. pickup in this profile requires
Agent System `v0.10.0` or newer. on an existing installation, check the
[Agent System upgrade guide](https://github.com/tanaabased/openclaw-agent-system/blob/main/UPGRADING.md)
before running Install.

to set up assignment intake:

1. configure approved assigners, repository routing, and the workflow mode in the
   [profile](./.agent-system/agent.yaml). see Agent System's
   [GitHub workflow configuration](https://github.com/tanaabased/openclaw-agent-system/blob/main/channels/github/CONFIG.md).
2. use `$agent-system-install` to activate and reconcile intake, then `$agent-system-doctor` to
   check saved state. see the [Codex automation contract](https://github.com/tanaabased/openclaw-agent-system/blob/main/CODEX.md#repository-automations)
   for how scheduled jobs are managed.
3. have an approved assigner assign an eligible issue to `@pirog`. include a clear outcome,
   acceptance criteria, and a reproduction for bugs. follow progress in its Codex chat and review
   any resulting PR.

Doctor checks saved state; a successful scheduled run is separate evidence.

## development

use the runtimes in [`.node-version`](./.node-version) and [`.bun-version`](./.bun-version):

```sh
# prepare the checkout
git clone git@github.com:pirog/me.git
cd me
bun install --frozen-lockfile --ignore-scripts

# run tests, lint, formatting, and ShellCheck
bun run test
bun run lint
```

edit the [source configuration](./INVENTORY.md#configuration-files), not generated files.
`bun run build` and Leia scenarios are CI-owned by default: they generate `dist/` or mutate macOS
runner state. read [the example guidance](./examples/AGENTS.md) before changing executable examples.

## support and releases

bring bugs, regressions, and feature requests to the [GitHub issue queue](https://github.com/pirog/me/issues/new/choose).
see [CHANGELOG.md](./CHANGELOG.md) and [GitHub releases](https://github.com/pirog/me/releases) for changes.
`piroplugin` releases ship through npm; see [plugin sources](./INVENTORY.md#plugins).

## maintainers

- [@pirog](https://github.com/pirog)

## contributors

<a href="https://github.com/pirog/me/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pirog/me" />
</a>

made with [contrib.rocks](https://contrib.rocks).
