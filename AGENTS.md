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
- An optional Tanaab canon checkout and plugin link for shared Tanaab capabilities.

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
- `Brewfile`: Homebrew package and application inventory.
- `dotfiles/*`: top-level GNU Stow packages applied to `$HOME`.
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
- Preserve the current token, SSH-key, and `--tanaab` contract unless the task explicitly changes
  it.
- Keep `--ssh-keys` and `PIROME_SSH_KEYS` as hidden convenience aliases for comma-separated SSH-key
  lists; do not document them as public inputs.
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
- Keep `--tanaab` and `PIROME_TANAAB` aligned with the current source modes: `ssh`, a local Git
  repository path, a release version, or a falsey disable value, with a fixed target of
  `~/tanaab/canon`.
- When Tanaab is enabled, preserve the wrapper-owned generated plugin link under the resolved `me`
  payload so the main `ai` stow can install `~/.codex/plugins/tanaab` back to
  `~/tanaab/canon` regardless of payload location.
- Preserve the wrapper-side Bootbox apply phase that uses the resolved payload's root `Brewfile` and
  top-level `dotfiles/*` package directories on the default `$HOME` target.
- Keep planning output aligned with execution order: core remediation, SSH handling, `me` payload
  materialization or safe refresh, optional Tanaab fetch and plugin-link preparation, then the
  `me` apply step.

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
- Treat `$piro-me-readiness` as read-only verification of this checkout and macOS user profile. It
  must not become setup, token management, environment management, GitHub or monday automation,
  release, Leia, or general machine administration.
- For protected resources, prefer native Codex connectors. When no native connector exists, wrap
  access with `op run --environment zsstdfqknicwfv5glv76gd6tue` instead of committed `.env` files,
  persistent shell secrets, or local token fallbacks.
- Local readiness probes must prove desktop-app-backed 1Password access. Strip 1Password service
  account, connect, session, and bootstrap token variables from `op` subprocesses.
- The readiness skill may run its bundled read-only local helper unsandboxed by default because it
  verifies 1Password and Tailscale desktop or daemon readiness. Do not extend that default to
  unrelated commands, setup, installation, tests, release validation, or machine administration.
- Keep README readiness content limited to human bootstrap or manual setup and a brief pointer to
  `$piro-me-readiness`. Keep maintenance policy here and runtime procedure in
  `skills/me-readiness/SKILL.md`.
- Update readiness only when a skill changes a stable machine prerequisite: a Brewfile dependency,
  repo-owned dotfile, manual app/auth/network step, Codex plugin install or link, or connector
  identity requirement.
- Update the owning source first, then readiness only when the prerequisite is stable, repo-owned,
  read-only, and machine-verifiable:
  - Brew packages belong in `Brewfile`; use the `packages` bucket only for required declarations and
    commands.
  - Repo-owned configuration belongs under `dotfiles/**`; use `dotfiles` only for installed or
    generated surfaces.
  - Human app, auth, and network setup belongs in the README checklist; use `manual_apps` only when a
    local read-only probe can verify it.
  - Plugin install and link layout belongs in plugin or dotfile sources; use `codex_plugins` only for
    installed surfaces.
  - GitHub and monday connector identities belong in skill runtime guidance, not
    `check-machine.js`.
- Use only these helper buckets:
  - `homebrew`: Homebrew command availability.
  - `packages`: Brewfile declarations and required command availability.
  - `dotfiles`: repo-owned stowed files and generated local configuration.
  - `manual_apps`: installed apps and read-only app, auth, or network readiness that Brewfile cannot
    fully establish.
  - `codex_plugins`: local Codex plugin links and install surfaces owned by this repository.

## Examples And Leia

- Examples are executable Leia specs consumed in CI, not prose-only documentation.
- Keep `examples/inputs` non-mutating; it owns the public CLI contract, displayed defaults, input
  validation, and option/environment precedence.
- Keep `examples/defaults` focused on one baseline machine-seeding run with default wrapper behavior
  plus only required CI secrets and fixtures.
- Keep payload materialization and safe refresh behavior in `examples/payload`, and released Tanaab
  source behavior in `examples/version`.
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
