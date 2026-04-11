# Repo Guidance For `me`

This root `AGENTS.md` is the repo-local override for Codex work in this repository. Keep repo-specific agent policy here and do not duplicate it in additional repo-local `AGENTS.md` files unless explicitly asked.

## Purpose

- This repo exists to seed a supported macOS machine with packages, dotfiles, identity or access material, and Codex plugin assets that approximate `@pirog`.
- The repo is in a deliberate migration from legacy `piroboot.sh` to a thinner hosted `boot.sh` wrapper around bootbox.

## Source Of Truth

- `boot.sh` is the shipped source entrypoint and the main shell surface to preserve.
- `piroboot.sh` is reference-only unless the task explicitly targets legacy behavior.
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
- When Leia or `bun run build` is skipped because of repo policy, say so explicitly.
- `README.md` may lag this agent policy. If there is tension, follow `AGENTS.md` and optionally flag the doc drift.

## Release And Distribution

- Netlify serves the generated `dist/` folder. Preserve that contract unless the task is explicitly about changing hosting behavior.
- GitHub Releases are intended to publish a zipped `piroplugin` archive plus the CI-prepared `dist` publish surface.
- The current `.github/workflows/release.yml` builds and stamps `dist` today, but it does not yet visibly create or upload the `piroplugin` zip. Treat the zip as intended release policy unless and until the workflow is updated.

## `boot.sh` Invariants

- Keep `BOOTBOX_URL` fixed and not user-configurable unless the task explicitly changes that contract.
- Preserve token masking in debug output. Do not leak raw 1Password tokens in logs or display commands.
- Do not reintroduce raw argument logging.
- Preserve the current token and SSH key contract unless the task is explicitly about changing it.
- Treat the intentionally empty `plan_wrapper_execution()` as deliberate unless the task is specifically about restoring wrapper planning output.
