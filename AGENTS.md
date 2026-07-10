# Repo Guidance For `me`

This root `AGENTS.md` is the repo-local override for Codex work in this repository. Keep repo-specific agent policy here and do not duplicate it in additional repo-local `AGENTS.md` files unless explicitly asked.

## Purpose

- This repo exists to seed a supported macOS machine with packages, dotfiles, identity or access material, and Codex plugin assets that approximate `@pirog`.
- The repo currently ships `boot.sh` as the bootstrap wrapper and `piroplugin` as the Codex plugin bundle.

## Identity Text

- Use `pirog` for casual prose references to the persona this repo approximates.
- Preserve exact literal strings for connector checks, package metadata, URLs, IDs, and external account display names.

## Source Of Truth

- `boot.sh` is the shipped shell entrypoint and the main bootstrap surface to preserve.
- `dist/` is generated publish output for hosting and release preparation; do not hand-edit it during normal work.
- Preserve the separation between `boot.sh` as source, `dist/` as generated hosting output, and `.codex-plugin/` plus `skills/` as plugin package inputs.

## Codex Plugin Guidance

- This repo is packaged as the Codex plugin `piroplugin` via `.codex-plugin/plugin.json`.
- Prefer Codex plugin and skill-aware workflows when they are actually available in the active environment.
- Verify skill files or skill availability before claiming a skill is loaded or in use.
- If a skill is unavailable, say so plainly and continue with repo files and the current session guidance.
- Treat `.codex-plugin/`, `.mcp.json`, `assets/`, `bin/`, `lib/`, `skills/`, `utils/`, `package.json`, and this root `AGENTS.md` as the managed plugin cache surface for `bun run codex:validate`, `bun run codex:check`, and `bun run codex:sync`.
- Use `bun run codex:validate` for semantic plugin validation, including manifest paths, skill metadata, the MCP stub, and workflow script references.
- Treat `dotfiles/ai` as a separate stow-owned surface. Use `bun run ai:sync` for home-directory restow work, not for Codex plugin cache refreshes.

## Me Readiness Maintenance

- Treat `$piro-me-readiness` as a verification surface for this `me` checkout and macOS user profile. It should not become a token-management, environment-management, GitHub automation, monday automation, setup, release, Leia, or general machine-admin workflow.
- For protected resource access, prefer native Codex connectors such as GitHub and monday when they are available. When a script or skill needs protected resources without a native connector, wrap it with `op run --environment zsstdfqknicwfv5glv76gd6tue` instead of using committed `.env` files, persistent shell environment secrets, or local token fallback.
- Local readiness probes must prove desktop-app-backed 1Password access. Strip 1Password service-account, connect, session, and bootstrap token environment variables from `op` subprocesses so readiness does not pass through token fallback.
- `$piro-me-readiness` may run its bundled read-only local helper unsandboxed by default because it verifies 1Password and Tailscale desktop/daemon readiness. Do not extend that unsandboxed default to unrelated repo commands, setup, package installation, tests, release validation, or broad machine administration.
- Keep README readiness content limited to human bootstrap/manual setup steps and a brief pointer to run `$piro-me-readiness` after setup. Do not put detailed readiness bucket or maintenance policy in README.
- Keep readiness maintenance policy in this `AGENTS.md`. Keep `skills/me-readiness/SKILL.md` focused on how to run readiness, parse helper output, and perform read-only connector identity checks.
- Skill changes under `skills/**` do not automatically require readiness updates. Update readiness only when a skill adds or changes a stable machine prerequisite: a Brewfile dependency, a repo-owned dotfile, a manual app/auth/network step, a Codex plugin install/link surface, or a connector identity requirement.
- When a skill introduces a prerequisite, update the source of truth first, then readiness if the requirement is repo-owned, stable, read-only, and machine-verifiable:
  - Brew package or cask requirements belong in `Brewfile`; then update the `packages` bucket only if the readiness helper should assert the new package or command.
  - Repo-owned config belongs under the relevant `dotfiles/**` package; then update the `dotfiles` bucket only if readiness should assert the stowed/generated surface.
  - Human app/auth/network setup belongs in the README manual setup checklist; then update the `manual_apps` bucket only if a local read-only probe can verify it.
  - Codex plugin install or link layout belongs in the plugin/dotfile source of truth; then update the `codex_plugins` bucket only if the local installed surface should be asserted.
  - GitHub or monday connector identity changes belong in `SKILL.md` runtime connector guidance, not `check-machine.js`.
- Use these helper buckets only:
  - `homebrew`: Homebrew command availability.
  - `packages`: Brewfile declarations and required command availability.
  - `dotfiles`: repo-owned stowed files and generated local config readiness.
  - `manual_apps`: installed apps and local app/auth/network readiness that cannot be fully handled by Brewfile alone, including 1Password and Tailscale.
  - `codex_plugins`: local Codex plugin links or plugin install surfaces owned by this repo.

## Validation Policy

- Never run Leia locally. Leia scenarios in this repo are CI-only unless the user explicitly asks for a local Leia run.
- Treat `bun run build` as CI-owned by default. Only run it locally when the task explicitly requires release or `dist/` verification.
- Prefer narrow local validation such as static review and `bun run lint`.
- For JavaScript library or helper changes, run `bun run test` before the relevant lint and plugin cache checks.
- For changes to managed plugin surfaces, run `bun run codex:validate`, then `bun run codex:check`; if `codex:check` reports drift, run `bun run codex:sync`.
- For `dotfiles/ai` changes, use `bun run ai:sync` when the task requires restowing the live home-directory surface.
- For public `boot.sh` input changes, cover help, defaults, validation, and option/environment precedence in `examples/inputs`, then cover runtime effects once in the narrowest functional example when behavior changes.
- Do not add separate mutating examples merely to exercise option and environment-variable spellings for the same behavior.
- When cache sync, `ai:sync`, agent restart, Leia, or `bun run build` is intentionally skipped because of task scope or repo policy, say so explicitly.

## Examples And Leia

- Examples are executable Leia specs consumed in CI, not prose-only documentation.
- Keep `examples/inputs` non-mutating; it owns the public CLI contract, displayed defaults, input validation, and option/environment precedence.
- Keep `examples/defaults` focused on one baseline machine-seeding run with default wrapper-owned behavior plus only the required CI secrets and fixtures.
- Keep payload materialization and safe refresh behavior in `examples/payload`, and released Tanaab source behavior in `examples/version`.
- Functional examples should prove observable behavior domains once instead of duplicating complete runs for every supported input form.
- See `examples/AGENTS.md` before editing Leia examples.

## Release And Distribution

- Netlify serves the generated `dist/` folder. Preserve that contract unless the task is explicitly about changing hosting behavior.
- GitHub Releases publish a `piroplugin-<tag>.tar.gz` archive plus the CI-prepared `dist` publish surface.
- The current `.github/workflows/release.yml` runs `bun run build`, stamps `dist/boot.sh` and `.codex-plugin/plugin.json`, packages `piroplugin-<tag>.tar.gz`, and uploads that archive to the release.

## `boot.sh` Invariants

- Keep `BOOTBOX_URL` fixed and not user-configurable unless the task explicitly changes that contract.
- Preserve token masking in debug output. Do not leak raw 1Password tokens in logs or display commands.
- Do not reintroduce raw argument logging.
- Preserve the public wrapper contract under the `PIROME_*` namespace unless the task is explicitly about changing it. Use canonical `BOOTBOX_*` names for internal delegation, and scrub both `BOOTBOX_*` inputs and Bootbox's legacy `TANAAB_*` aliases before rebuilding the child environment.
- Preserve the current token, SSH key, and `--tanaab` contract unless the task is explicitly about changing it.
- Keep `--ssh-keys` and `PIROME_SSH_KEYS` as hidden convenience aliases for comma-separated SSH-key lists; do not document them as public inputs.
- Resolve interactive input through `/dev/tty` when available so hosted pipe-to-Bash invocations can still confirm the wrapper plan; treat `INTERACTIVE` as a requirement and fail when no interactive terminal exists.
- Keep `PIROME_PAYLOAD_DIR` as a hidden development and CI override; do not expose it or payload selection as a public option or documented help environment variable.
- Resolve the `me` payload in this order: explicit `PIROME_PAYLOAD_DIR`, source-relative checkout, existing `~/tanaab/me`, then a new SSH clone of `git@github.com:pirog/me.git` at `~/tanaab/me`.
- Require the resolved `me` payload to be a Git checkout containing `boot.sh`, `Brewfile`, `dotfiles/`, and `.codex-plugin/plugin.json`.
- Use explicit and source-relative payloads in place without updating them. Only refresh the existing canonical checkout when it is clean, on `main`, tracking `origin/main`, and connected to `@pirog/me`; use fetch plus fast-forward checks and otherwise warn without changing local work.
- Never delete or replace an existing `~/tanaab/me` path, including under `--force`. Invalid canonical payload paths should fail with an actionable error.
- Treat `SCRIPT_VERSION` as wrapper metadata only; the resolved `me` payload revision may differ.
- Keep `--tanaab` / `PIROME_TANAAB` aligned with the current source modes: `ssh`, a local git repo path, a release version, or falsey disable values, with a fixed target of `~/tanaab/canon`.
- When `--tanaab` is enabled, preserve the wrapper-owned generated plugin link under the resolved `me` payload so the main `ai` stow can install `~/.codex/plugins/tanaab` back to `~/tanaab/canon` regardless of payload location.
- Preserve the wrapper-side bootbox apply phase that uses the resolved `me` payload's root `Brewfile` and top-level `dotfiles/*` package directories on the default `$HOME` target.
- Keep planning output aligned with actual execution order: core remediation, SSH handling, `me` payload materialization or safe refresh, optional `tanaab` fetch and plugin-link prep, then the `me` apply step.
