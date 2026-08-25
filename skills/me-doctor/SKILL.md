---
name: piro-me-doctor
description: Pirobased workflow to diagnose a bootstrapped me macOS profile, including requests to check me readiness, setup, or update state, and recommend focused remediation without changing the machine.
license: MIT
metadata:
  type: workflow
  owner: pirog
  tags:
    - pirog
    - workflow
    - validation
  openclaw:
    emoji: '🩺'
    homepage: https://github.com/pirog/me/tree/main/skills/me-doctor
    os:
      - darwin
    requires:
      bins:
        - bun
---

# Me Doctor

## Overview

Diagnose whether the current `me` checkout and interactive macOS profile are ready for supported
work as `pirog`. Present a compact grouped status, explain failures and warnings, and recommend the
smallest known remediation without changing the machine.

The Doctor is read-only. It does not install packages, restow files, configure tokens, repair
services, mutate connector data, or validate the Agentbox product.

## When to Use

- Diagnose a profile after `boot.sh` or before relying on repo-owned dotfiles and `piroplugin`.
- Check whether `me` is ready, set up, current, or updated for supported Codex work.
- Investigate required declarative automation state and optional 1Password, Tailscale, application,
  or monday capabilities alongside the required core profile.
- Recheck the profile after the user has separately applied a repair.

## When Not to Use

- Do not use this skill to configure, update, or repair the machine; diagnose first and request
  separate confirmation before any mutation.
- Do not use it to validate Agentbox launchd, Serve, OpenClaw, or complete host health; use Agentbox
  Doctor for that product surface.
- Do not use it for token management, GitHub or monday mutations, releases, Leia, or general machine
  administration.

## Preconditions

- Work from the `me` checkout at `/Users/pirog/tanaab/me` after the user has intentionally run
  `boot.sh`.
- Require Bun before invoking the helper. If Bun is unavailable, report the profile as not ready and
  recommend the supported bootstrap workflow; do not install Bun from the Doctor.
- Require the GitHub connector in the active Codex session for the final identity check. The monday
  connector is optional and may be reported as a warning.
- Require native Codex automation inspection for the declarative automation drift check. The Doctor
  reports drift but never reconciles it.

## Workflow

1. Run the bundled live probe with unsandboxed local access by default:

   ```sh
   bun ./skills/me-doctor/scripts/check-machine.js
   ```

   The helper is read-only. It checks effective Homebrew writability, queries installed formulas
   and casks, verifies the running Bun and Homebrew `node@26`, simulates the complete GNU Stow
   layout, inspects local files and links, and probes optional desktop or daemon services. It strips
   1Password token fallback variables from every `op` subprocess.

   If unsandboxed access is unavailable, run the helper sandboxed and describe Homebrew,
   1Password, or Tailscale access failures as potentially sandbox-limited. Do not generalize the
   helper's unsandboxed allowance to unrelated commands.

2. Parse the versioned JSON contract:
   - `schemaVersion` identifies the report contract.
   - `status` is `ready`, `warning`, or `not_ready`; `ok` remains true for optional warnings.
   - `source` identifies the live probe without carrying credentials or raw environment data.
   - `summary` counts passing checks, failures, warnings, and groups.
   - `groups` reports Homebrew, Packages and runtimes, Dotfiles, Optional capabilities, and Codex
     plugin status in dependency order.
   - `issues` and `warnings` contain focused structured remediations from the bundled catalog.
   - `checks` preserves the ordered leaf-check detail for compatibility and requested deep dives.

   Treat an unknown `schemaVersion`, check id, status, or group as a contract failure rather than
   guessing at health.

3. Present each group once. Omit passing leaf checks unless the user asks for full detail. List every
   issue and warning with its explanation and cataloged remediation.

4. Discover the GitHub connector tools and run a read-only authenticated identity probe. This is a
   required Codex integration. Require both:
   - GitHub login `pirog`
   - GitHub user ID `713424`

   Missing tools, failed authentication, or an identity mismatch make the final result not ready.

5. Discover `automation_update` and inspect declarative automation state read-only:
   - Validate `AUTOMATIONS.yaml` with the bundled `$piro-automation` command.
   - List `$CODEX_HOME/automations/*/automation.toml` only to discover candidate ids and managed
     marker hints. Do not edit those files or treat them as authoritative task definitions.
   - Call `automation_update` in view mode for every candidate id. Read current `model` and
     `model_reasoning_effort` from the effective Codex config and call `list_projects` only when the
     manifest declares a `local-project`.
   - Feed the authoritative snapshots, defaults, and projects to the bundled deterministic planner.
     Zero missing, changed, or extra managed tasks passes. Any drift, malformed or duplicate marker,
     invalid manifest, unavailable native operation, or failed view makes the final result not ready.
     Unmanaged automation tasks are ignored and reported by count.

   Do not create, update, pause, resume, or delete an automation. Route remediation to
   `$piro-automation check` followed by an explicitly approved sync.

6. Discover the monday connector tools and, when available, run
   `list_users_and_teams(getMe=true)`. Expect:
   - monday user ID `71211606`
   - monday user name `Michael Pirog`

   Missing tools, failed authentication, or an identity mismatch are warnings. Do not mutate
   monday data.

7. Present the combined result:
   - `🟢 Ready`: local status is `ready`, GitHub identity matches, and managed automations converge.
   - `🟡 Ready with warnings`: local status is `warning`, or monday warns, while GitHub identity
     matches and managed automations converge.
   - `🔴 Not ready`: local status is `not_ready`, the helper contract is invalid, or GitHub identity
     or managed automation validation fails.

   Group the summary by meaning rather than treating Codex as the machine's source of truth:

   ```markdown
   🟡 **Ready with warnings**

   Core profile

   - ✅ Homebrew
   - ✅ Packages and runtimes
   - ✅ Dotfiles

   Required Codex integration

   - ✅ piroplugin
   - ✅ GitHub connector: `pirog` / `713424`
   - ✅ Declarative automations: converged

   Optional capabilities

   - ⚠️ 1Password or Tailscale
   - ⚠️ monday connector
   ```

8. Render a cataloged remediation command as code when one is present, but do not execute it. A
   request to diagnose and repair does not replace the mutation checkpoint: present the exact next
   action, explain its scope, and obtain separate confirmation first.

## Checkpoints

- Treat Homebrew availability and effective write access as hard requirements. Test writability;
  do not infer it from directory ownership alone.
- Discover all `brew` and `cask` entries from the current Brewfile. Missing formulas fail; missing
  applicable casks warn.
- Require `brew`, `bun`, `curl`, `git`, `stow`, and `zsh` on `PATH`. Require the running Bun to come
  from Homebrew and match `.bun-version`. Resolve `$(brew --prefix node@26)/bin/node` directly and
  require major version 26.
- Discover every top-level package under `dotfiles/` and use a read-only Stow simulation. Any
  missing link or conflict fails readiness.
- Keep generated Codex config, the `piroplugin` link, and GitHub identity as required integration
  surfaces.
- Require valid `AUTOMATIONS.yaml` and zero missing, changed, or extra marked automations. Keep the
  Doctor's automation inspection read-only and ignore unmarked personal tasks.
- Treat 1Password, Tailscale, applications, Agentbox `tailscaled`, and monday identity as optional
  warnings.
- Before presenting remediation, require it to come from the report catalog rather than improvising
  from raw output.
- Never print token values, raw environment contents, or the 1Password authorization sentinel.
- Do not mutate GitHub, monday, or Codex automation data and do not fall back to browser or computer
  automation.

## Completion Criteria

- The helper returned a supported, parseable report and every check used a cataloged group and
  remediation.
- Every active group was represented; passing leaf checks were hidden by default.
- Every local failure or warning and every connector mismatch was reported with a focused next step.
- GitHub identity matched `pirog` / `713424`, or the final result was not ready.
- Declarative automation validation and the read-only drift plan converged, or the final result was
  not ready with `$piro-automation` remediation.
- monday identity matched `Michael Pirog` / `71211606`, or the mismatch was reported as a warning.
- No repair, setup, credential, connector, or host mutation was performed.

## Bundled Resources

- [`scripts/check-machine.js`](./scripts/check-machine.js): thin read-only local probe command.
- [`lib/check-machine.js`](./lib/check-machine.js): live Homebrew, package, dotfile, optional service,
  and plugin probe orchestration.
- [`references/checks.json`](./references/checks.json): stable check-to-group and label catalog.
- [`references/remediations.json`](./references/remediations.json): focused remediation and command
  safety metadata.
- [`utils/build-doctor-report.js`](./utils/build-doctor-report.js): versioned report normalization.
- [`test/`](./test/): flat direct utility, report-contract, and live orchestration coverage.
- [`../automation/`](../automation/): declarative automation validation, planning, and remediation
  workflow reused by the Doctor's read-only drift check.

## Validation

- Confirm required failures produce `not_ready`, optional gaps produce `warning`, and a clean local
  probe produces `ready`.
- Confirm every emitted check is cataloged, every cataloged check has structured remediation, and
  every remediation command is complete and shell-parseable.
- Confirm group order, summary counts, issue and warning classification, and schema version remain
  stable.
- Confirm Bun and Node runtime, Stow, Agentbox cask exception, connector, and secret-redaction
  boundaries remain read-only and covered.
- Confirm a clean automation plan passes, managed drift fails readiness, unmanaged tasks are ignored,
  and the Doctor never invokes an automation mutation.
