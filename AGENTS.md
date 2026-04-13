# Repo Guidance For `me`

This root `AGENTS.md` is the repo-local override for Codex work in this repository. Keep repo-specific agent policy here and do not duplicate it in additional repo-local `AGENTS.md` files unless explicitly asked.

## Purpose

- This repo exists to seed a supported macOS machine with packages, dotfiles, identity or access material, and Codex plugin assets that approximate `@pirog`.
- The repo currently ships `boot.sh` as the bootstrap wrapper and `piroplugin` as the Codex plugin bundle.

## Source Of Truth

- `boot.sh` is the shipped shell entrypoint and the main bootstrap surface to preserve.
- `dist/` is generated publish output for hosting and release preparation; do not hand-edit it during normal work.
- Preserve the separation between `boot.sh` as source, `dist/` as generated hosting output, and `.codex-plugin/` plus `skills/` as plugin package inputs.

## Codex Plugin Guidance

- This repo is packaged as the Codex plugin `piroplugin` via `.codex-plugin/plugin.json`.
- Prefer Codex plugin and skill-aware workflows when they are actually available in the active environment.
- Verify skill files or skill availability before claiming a skill is loaded or in use.
- If a skill is unavailable, say so plainly and continue with repo files and the current session guidance.

## Validation Policy

- Never run Leia locally. Leia scenarios in this repo are CI-only unless the user explicitly asks for a local Leia run.
- Treat `bun run build` as CI-owned by default. Only run it locally when the task explicitly requires release or `dist/` verification.
- Prefer narrow local validation such as static review and `bun run lint`.
- New `boot.sh` features and bug fixes should add the smallest practical amount of coverage to all relevant Leia examples instead of relying on one catch-all scenario.
- When Leia or `bun run build` is skipped because of repo policy, say so explicitly.

## Release And Distribution

- Netlify serves the generated `dist/` folder. Preserve that contract unless the task is explicitly about changing hosting behavior.
- GitHub Releases publish a `piroplugin-<tag>.tar.gz` archive plus the CI-prepared `dist` publish surface.
- The current `.github/workflows/release.yml` runs `bun run build`, stamps `dist/boot.sh` and `.codex-plugin/plugin.json`, packages `piroplugin-<tag>.tar.gz`, and uploads that archive to the release.

## `boot.sh` Invariants

- Keep `BOOTBOX_URL` fixed and not user-configurable unless the task explicitly changes that contract.
- Preserve token masking in debug output. Do not leak raw 1Password tokens in logs or display commands.
- Do not reintroduce raw argument logging.
- Preserve the public wrapper contract under the `PIROME_*` namespace unless the task is explicitly about changing it. Use upstream `TANAAB_*` names only as the internal bridge when delegating to bootbox.
- Preserve the current token, SSH key, `--me`, and `--tanaab` contract unless the task is explicitly about changing it.
- Keep `--me` / `PIROME_ME` aligned with the current source modes: `ssh`, a local git repo path, or a release version, with a fixed target of `~/tanaab/me` and skip-or-replace behavior controlled by `--force`.
- Keep `--tanaab` / `PIROME_TANAAB` aligned with the current source modes: `ssh`, a local git repo path, a release version, or falsey disable values, with a fixed target of `~/tanaab/canon`.
- When `--tanaab` is enabled, preserve the wrapper-owned relative plugin link at `~/tanaab/me/dotfiles/ai/.codex/plugins/tanaab` so the main `ai` stow can install `~/.codex/plugins/tanaab` back to `~/tanaab/canon`.
- After repo materialization, preserve the wrapper-side bootbox apply phase that uses the `me` checkout's root `Brewfile` and top-level `dotfiles/*` package directories on the default `$HOME` target.
- Keep planning output aligned with actual execution order: core remediation, SSH handling, `me` fetch, optional `tanaab` fetch and plugin-link prep, then the `me` apply step.
