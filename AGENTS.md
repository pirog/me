# Repo Guidance For `me`

This root file should stay broadly applicable to repository work. Put narrower policy closer to the
files it governs, such as `examples/AGENTS.md` for Leia examples.

## Purpose

`me` seeds a supported macOS machine with packages, dotfiles, identity or access material, and Codex
plugin assets that approximate `pirog`. The repository ships `boot.sh` as the hosted bootstrap
wrapper and `piroplugin` as its Codex plugin bundle.

## Scope

In scope:

- Personal macOS dependencies and application inventory.
- Dotfiles, shell preferences, developer-tool configuration, and identity material.
- The `piroplugin` Codex plugin, Pirobased skills, and local readiness verification.
- Optional editable `@tanaabased` checkouts and generated links for repositories that declare
  themselves as Codex plugins.

Out of scope:

- Generic or multi-user machine profiles.
- Headless host setup, SSH hardening, remote-login policy, service supervision, or other privileged
  system management owned by `agentbox`.
- General token management, environment management, GitHub or monday automation, releases, Leia,
  and unrelated machine administration inside the readiness skill.
- Agent-, persona-, or workspace profiles other than `pirog`.

## Direction

This is directional guidance, not an expansion of the current public contract:

- Keep the hosted shell entrypoint as the bootstrap path and keep `boot.sh` thin over Bootbox.
- Treat the repository checkout as the editable source and runtime payload for the personal machine
  profile.
- Keep generic bootstrap behavior in Bootbox and headless host behavior in `agentbox`.
- Add new project materialization, operating modes, remote-management behavior, or privileged setup
  only when the product contract is explicitly expanded.

## Source Map

- `boot.sh`: shipped shell entrypoint and main bootstrap surface.
- `Brewfile`: Homebrew package and application inventory, including the canonical `tailscale-app`
  desktop cask used outside Agentbox hosts.
- `dotfiles/*`: top-level GNU Stow packages applied to `$HOME`.
- `dotfiles/theme/colors.json`: lowest-level portable Tanaab color palette and source of truth for
  application-specific theme assets.
- `.codex-plugin/`, `.mcp.json`, `assets/`, `bin/`, `lib/`, `skills/`, and `utils/`:
  `piroplugin` package inputs and local Codex tooling.
- `README.md`: primary setup and usage entrypoint; `ADVANCED.md`: installed components, complete
  configuration reference, checkout behavior, and Codex sync details.
- `examples/**/README.md`: Leia-backed executable CI contracts.
- `site/llms.txt`, `scripts/build-dist.js`, and `netlify.toml`: hosted bootstrap and metadata
  publishing sources.
- `dist/`: generated Netlify and release output owned by CI and release workflows.

## Critical Rules

- Use `pirog` for casual prose references to the persona this repository approximates. Preserve exact
  literal strings for connector checks, package metadata, URLs, IDs, and external account display
  names.
- Do not edit, regenerate, stage, or commit `dist/` during routine local work. Change source inputs
  and leave generated output to CI unless the user explicitly requests release-shaped verification.
- Keep `/llms.txt` concise in `site/llms.txt`; `scripts/build-dist.js` copies it into `dist/`.
- Keep `--help` as the public bootstrap contract. Public option, environment-variable, help,
  planning, or failure-text changes must check `README.md`, `ADVANCED.md`, and affected examples.
- Do not document hidden development or CI-only inputs as public configuration.
- Preserve the public wrapper contract under the `PIROME_*` namespace. Use canonical `BOOTBOX_*`
  names only for internal delegation.
- Never commit SSH private keys, 1Password tokens, API tokens, machine-specific secret files,
  generated Codex configuration, or generated `authorized_keys` files.

## `boot.sh` Invariants

- Keep `BOOTBOX_URL` fixed and not user-configurable unless the task explicitly changes that
  contract.
- Preserve token masking in debug output. Do not leak raw 1Password tokens in logs or displayed
  commands, and do not reintroduce raw argument logging.
- Scrub both `BOOTBOX_*` inputs and Bootbox's legacy `TANAAB_*` aliases before rebuilding the child
  environment.
- Preserve the current token, SSH-key, and repeatable Tanaab-repository contract unless the task
  explicitly changes it.
- Keep `--ssh-keys`, `PIROME_SSH_KEYS`, `--tanaabs`, and `PIROME_TANAABS` as hidden convenience
  aliases for comma-separated lists; do not document them as public inputs.
- Resolve interactive input through `/dev/tty` when available so hosted pipe-to-Bash invocations can
  still confirm the wrapper plan. Treat `INTERACTIVE` as a requirement and fail when no interactive
  terminal exists.
- Keep `PIROME_PAYLOAD_DIR` as a hidden development and CI override; do not expose it or payload
  selection as a public option or documented help environment variable.
- Resolve the `me` payload in this order: explicit `PIROME_PAYLOAD_DIR`, source-relative checkout,
  existing `~/tanaab/me`, then a new SSH clone of `git@github.com:pirog/me.git` at
  `~/tanaab/me`.
- Require the resolved payload to be a Git checkout containing `boot.sh`, `Brewfile`, `dotfiles/`,
  and `.codex-plugin/plugin.json`.
- Use explicit and source-relative payloads in place without updating them. Only refresh the
  existing canonical checkout when it is clean, on `main`, tracking `origin/main`, and connected to
  `@pirog/me`; use fetch plus fast-forward checks and otherwise warn without changing local work.
- Never delete or replace an existing `~/tanaab/me` path, including under `--force`. Invalid
  canonical payload paths should fail with an actionable error.
- Treat `SCRIPT_VERSION` as wrapper metadata only; the resolved `me` payload revision may differ.
- Keep Tanaab repository selection empty by default. Treat repeatable `--tanaab` values as
  repository names in `@tanaabased`, and treat `PIROME_TANAAB` as the comma-separated environment
  equivalent. The first CLI value replaces the environment list; later values append.
- Clone selected repositories over SSH to `~/tanaab/<repo>`. Never delete or replace an existing
  target, including under `--force`; refresh only clean `main` checkouts that track `origin/main`
  and have the expected `@tanaabased/<repo>` origin.
- On every run, reconcile Codex plugin links for verified existing `@tanaabased` checkouts under
  `~/tanaab`. Use `.codex-plugin/plugin.json` as the source of truth and its `name` as the generated
  link name under the resolved payload's `dotfiles/ai/.codex/plugins/` directory.
- Remove only generated or installed symlinks that resolve exactly to a verified checkout that no
  longer has a plugin manifest. Preserve links when a present manifest is malformed, and never
  overwrite a regular path or a link pointing elsewhere. Plugin linking does not install or enable
  a plugin.
- Preserve the wrapper-side Bootbox apply phase that uses the resolved payload's root `Brewfile` and
  top-level `dotfiles/*` package directories on the default `$HOME` target.
- Treat a machine as an installed Agentbox host only when both
  `/opt/tanaab/agentbox/bin/health.sh` and
  `/Library/LaunchDaemons/dev.tanaab.agentbox.health.plist` are present. Do not infer the host role
  from a source checkout.
- On detected Agentbox hosts, preserve inherited Homebrew Bundle cask skips and add `tailscale-app`
  plus `1password` only for the final `me` Brewfile apply. Keep `1password-cli@beta` installed for
  service-account-backed SSH-key retrieval.
- Skip `tailscale-app` when the Homebrew `tailscale` formula is already installed, even when the
  complete Agentbox marker pair is absent, so the formula/cask conflict is never reintroduced.
- Keep planning output aligned with execution order: core remediation, SSH handling, `me` payload
  materialization or safe refresh, selected Tanaab repository materialization or safe refresh,
  local plugin-link reconciliation, then the `me` apply step.

## Codex Plugin And Readiness

- This repository is packaged as `piroplugin` through `.codex-plugin/plugin.json`.
- Prefer Codex plugin- and skill-aware workflows when they are available. Verify skill files or
  availability before claiming that a skill is loaded; if unavailable, say so and continue with
  repository files and active session guidance.
- Treat `.codex-plugin/`, `.mcp.json`, `assets/`, `bin/`, `lib/`, `skills/`, `utils/`,
  `package.json`, and this root file as the managed plugin cache surface for
  `bun run codex:validate`, `bun run codex:check`, and `bun run codex:sync`.
- Treat `dotfiles/ai` as a separate Stow-owned surface. Use `bun run ai:sync` for home-directory
  restow work, not for plugin cache refreshes.
- Keep `dotfiles/ai/.agents/plugins/marketplace.json` plugin entries sorted first by category, with
  `Pirobased` before `Tanaab-based`, and then alphabetically by plugin name within each category.
- Treat `$piro-me-readiness` as read-only verification of this checkout and macOS user profile. It
  must not become setup, token management, environment management, GitHub or monday automation,
  release, Leia, or general machine administration.
- For protected resources, prefer native Codex connectors. When no native connector exists, wrap
  access with `op run --environment zsstdfqknicwfv5glv76gd6tue` instead of committed `.env` files,
  persistent shell secrets, or local token fallbacks.
- On standard workstations, report desktop-app-backed 1Password access as an optional readiness
  capability. On detected Agentbox hosts, treat the 1Password desktop, vault, and Environment
  checks as not required while retaining token-fallback warnings.
  Strip 1Password service account, connect, session, and bootstrap token variables from any `op`
  subprocesses that do run.
- On detected Agentbox hosts, report `tailscaled` plus `tailscale status --json` as optional
  readiness capabilities instead of requiring `Tailscale.app`. Do not duplicate Agentbox launchd,
  Serve, OpenClaw, or complete host-health checks inside `piro-me-readiness`.
- The readiness skill may run its bundled read-only local helper unsandboxed by default because it
  verifies 1Password and Tailscale desktop or daemon readiness. Do not extend that default to
  unrelated commands, setup, installation, tests, release validation, or machine administration.
- Keep README readiness content limited to human bootstrap or manual setup and a brief pointer to
  `$piro-me-readiness`. Keep maintenance policy here and runtime procedure in
  `skills/me-readiness/SKILL.md`.
- Keep readiness capability-based: Homebrew write access, every Brewfile formula, required core
  commands, complete repo-owned dotfiles, generated Codex config, `piroplugin`, and GitHub identity
  are hard requirements. Brewfile casks, 1Password, Tailscale, and monday are warnings.
- Update the owning source first, then readiness only when the prerequisite is stable, repo-owned,
  read-only, and machine-verifiable:
  - Brew packages belong in `Brewfile`; discover formulas and casks from that file instead of
    duplicating package lists in readiness.
  - Repo-owned configuration belongs under `dotfiles/**`; discover top-level Stow packages and
    verify the complete installed layout with a read-only simulation.
  - Human app, auth, and network setup belongs in the README checklist; use `manual_apps` only when a
    local read-only probe can verify it.
  - Plugin install and link layout belongs in plugin or dotfile sources; use `codex_plugins` only for
    installed surfaces.
  - GitHub and monday connector identities belong in skill runtime guidance, not
    `check-machine.js`; GitHub is required and monday is advisory.
- Use only these helper buckets:
  - `homebrew`: Homebrew command availability and effective write access.
  - `packages`: installed Brewfile formulas, optional casks, required commands, and runtime versions.
  - `dotfiles`: complete repo-owned Stow state and generated local configuration.
  - `manual_apps`: optional read-only app, auth, or network capabilities that Brewfile cannot fully
    establish.
  - `codex_plugins`: local Codex plugin links and install surfaces owned by this repository.

## Examples And Leia

- Examples are executable Leia specs consumed in CI, not prose-only documentation.
- Keep `examples/inputs` non-mutating; it owns the public CLI contract, displayed defaults, input
  validation, and option/environment precedence.
- Keep `examples/defaults` focused on one baseline machine-seeding run with default wrapper behavior
  plus only required CI secrets and fixtures.
- Keep `me` payload materialization and safe refresh behavior in `examples/payload`. Keep Tanaab
  repository materialization, refresh safety, and plugin-link reconciliation in `examples/tanaab`.
- Functional examples should prove observable behavior domains once instead of duplicating complete
  runs for every supported input form.
- See `examples/AGENTS.md` before editing Leia examples.

## Release And Distribution

- Netlify serves generated `dist/` output.
- GitHub Releases publish a `piroplugin-<tag>.tar.gz` archive plus the CI-prepared publish surface.
- `.github/workflows/release.yml` builds and stamps `dist/boot.sh` and
  `.codex-plugin/plugin.json` before packaging the release archive.

## Validation

- Prefer the narrowest reliable checks for the touched area.
- Run `bun run test` for JavaScript library or helper changes before lint and plugin checks.
- Use `bun run lint` for routine local validation and `git diff --check` when text churn is
  plausible.
- For managed plugin changes, run `bun run codex:validate` and `bun run codex:check`; if the latter
  reports drift, run `bun run codex:sync`.
- Use `bun run ai:sync` only when the task requires restowing `dotfiles/ai` into the live home
  directory.
- Never run Leia locally unless the user explicitly requests it.
- Treat `bun run build` as CI-owned unless the task explicitly requires release or `dist/`
  verification.
- When plugin sync, `ai:sync`, agent restart, Leia, or `bun run build` is intentionally skipped, say
  so plainly.

## References

- `README.md`, `ADVANCED.md`, `CHANGELOG.md`
- `examples/`, `examples/AGENTS.md`
- `skills/me-readiness/SKILL.md`
- `site/llms.txt`, `scripts/build-dist.js`, `netlify.toml`
