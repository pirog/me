---
name: piro-me-readiness
description: Pirobased workflow to verify that a bootstrapped me macOS profile has its required core capabilities and report optional service and Codex integration readiness.
license: MIT
metadata:
  type: workflow
  owner: pirog
  tags:
    - pirog
    - workflow
    - validation
---

# Me Readiness

## Overview

Use this skill to verify that the current `me` checkout and interactive macOS profile are ready for
supported work as `pirog`. Core machine capabilities and required Codex integration determine
readiness. Optional applications, 1Password access, Tailscale connectivity, the Janus runtime, and
the monday connector produce warnings without making the whole profile unready.

The skill is read-only. It does not install packages, restow files, configure tokens, repair
services, mutate connector data, or validate the Agentbox product.

## When to Use

- Run after `boot.sh` when preparing or auditing an interactive `pirog` macOS profile.
- Run before relying on the repo-owned dotfiles, `piroplugin`, or the GitHub connector identity.
- Run when optional 1Password, Tailscale, application, or monday readiness should be reported
  alongside the required core profile.

## When Not to Use

- Do not use this skill to configure or repair the machine; report remediation instead.
- Do not use it to validate Agentbox launchd, Serve, OpenClaw, or complete host health.
- Do not use it for token management, GitHub or monday mutations, releases, Leia, or general
  machine administration.

## Preconditions

- Work from the `me` checkout at `/Users/pirog/tanaab/me`.
- Run after the user has intentionally bootstrapped the profile with `boot.sh`.
- The GitHub connector must be available in the active Codex session for the required identity
  check. The monday connector is optional and may be reported as a warning.

## Workflow

1. Run the bundled local probe with unsandboxed/elevated local access by default:

   ```sh
   bun ./skills/me-readiness/scripts/check-machine.js
   ```

   The helper is read-only. It checks effective Homebrew writability, queries installed formulas
   and casks, simulates the complete GNU Stow layout, inspects local files and links, and probes
   optional desktop or daemon services. It strips 1Password token fallback variables from every
   `op` subprocess.

   If unsandboxed access is unavailable, run the helper sandboxed and describe Homebrew,
   1Password, or Tailscale access failures as potentially sandbox-limited. Do not generalize the
   helper's unsandboxed allowance to unrelated commands.

2. Parse the JSON report in dependency order. Every check has one bucket:
   - `homebrew`: Homebrew availability and effective write access.
   - `packages`: every Brewfile formula, optional Brewfile casks, required commands, and the
     Homebrew `node@24` runtime.
   - `dotfiles`: complete Stow simulation, optional Janus runtime, and generated Codex config.
   - `manual_apps`: optional 1Password and Tailscale capabilities plus token-fallback warnings.
   - `codex_plugins`: the installed `piroplugin` link and its target checkout.

   A `fail` makes local readiness false. A `warn` records an incomplete optional capability while
   keeping local readiness true. Report every failure and warning with its remediation.

3. Discover the GitHub connector tools and run a read-only authenticated identity probe. This is a
   required Codex integration. Require both:
   - GitHub login `pirog`
   - GitHub user ID `713424`

   Missing tools, failed authentication, or an identity mismatch make the final result not ready.

4. Discover the monday connector tools and, when available, run
   `list_users_and_teams(getMe=true)`. Expect:
   - monday user ID `71211606`
   - monday user name `Michael Pirog`

   Missing tools, failed authentication, or an identity mismatch are warnings. Do not mutate
   monday data.

5. Report the final result:
   - `🟢 Ready`: local helper has no failures or warnings and GitHub identity matches.
   - `🟡 Ready with warnings`: local helper has no failures, GitHub identity matches, and one or
     more optional local or monday checks warn.
   - `🔴 Not ready`: any local helper check fails or the GitHub identity check fails.

   Group the summary by meaning rather than treating Codex as the machine's source of truth:

   ```markdown
   🟡 **Ready with warnings**

   Core profile

   - ✅ Homebrew and write access
   - ✅ Brewfile formulas and required commands
   - ✅ Dotfiles

   Required Codex integration

   - ✅ Generated Codex config and piroplugin
   - ✅ GitHub connector: `pirog` / `713424`

   Optional capabilities

   - ⚠️ Brewfile casks
   - ✅ 1Password
   - ✅ Tailscale
   - ⚠️ monday connector
   ```

   On Agentbox, describe `1password` and `tailscale-app` as intentional cask skips, desktop-backed
   1Password checks as not required, and Tailscale as the optional managed `tailscaled` runtime.

## Checkpoints

- Treat Homebrew availability and effective write access as hard requirements. Test writability;
  do not infer it from directory ownership alone.
- Discover all `brew` and `cask` entries from the current Brewfile. Missing formulas fail;
  missing applicable casks warn.
- Require `brew`, `bun`, `curl`, `git`, `stow`, and `zsh` on `PATH`. Resolve
  `$(brew --prefix node@24)/bin/node` directly and require major version 24 or newer; do not fail
  because the invoking process inherited a different Node on `PATH`.
- Discover every top-level package under `dotfiles/` and use a read-only Stow simulation. Any
  missing link or conflict fails readiness.
- Keep generated Codex config and the `piroplugin` link to the current checkout as required
  integration surfaces.
- Treat the Janus runtime, 1Password CLI/vault/Environment access, Tailscale command/connectivity,
  Agentbox `tailscaled`, and monday identity as optional warnings.
- Treat the GitHub connector identity as required.
- Never print token values, raw environment contents, or the 1Password authorization sentinel.
- Do not mutate GitHub or monday data and do not fall back to browser or computer automation.

## Completion Criteria

- The helper returned parseable JSON and every check used a known bucket.
- Every local failure or warning was reported with remediation.
- All formulas and dotfile packages were discovered from their owning source instead of duplicated
  in the helper.
- GitHub identity matched `pirog` / `713424`, or the final result was not ready.
- monday identity matched `Michael Pirog` / `71211606`, or the mismatch was reported as a warning.
- The final result distinguished core profile, required Codex integration, and optional
  capabilities.

## Bundled Resources

- [`scripts/check-machine.js`](./scripts/check-machine.js): read-only local probe CLI that emits
  deterministic JSON.
- [`scripts/check-machine-lib.js`](./scripts/check-machine-lib.js): tested helper library for
  Homebrew, package, dotfile, optional service, and plugin checks.

## Validation

- Confirm missing formulas, required commands, incomplete Stow state, generated config, and the
  `piroplugin` target produce failures.
- Confirm missing casks, Janus, 1Password, Tailscale, Agentbox `tailscaled`, and monday produce only
  warnings.
- Confirm Node 24 and newer pass while older versions fail.
- Confirm Agentbox cask exceptions require the same executable-script and plist markers as
  `boot.sh`.
- Confirm every warning and failure includes remediation and no token value or authorization
  sentinel is printed.
- Confirm GitHub and monday validation remain read-only.
