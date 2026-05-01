---
name: piro-me-readiness
description: Pirobased workflow to verify that a bootstrapped me machine is ready for Codex work as Michael Pirog.
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

Use this skill only to verify that the current `me` checkout and macOS user profile are ready for
Codex work as Michael Pirog. It checks the repo-owned machine setup, manually configured app
readiness, Codex plugin links, and read-only Codex connector identities. It does not configure
tokens, run setup, manage environments, perform GitHub or monday work, or validate releases.

## When to Use

- Run after `boot.sh` and the README manual setup checklist have completed.
- Run before relying on Codex plugin skills, GitHub connector actions, monday connector actions,
  1Password-backed local setup, or Tailscale network access.
- Run when moving this `me` environment to a new interactive macOS user profile.

## When Not to Use

- Do not use this skill for Agentbox or robot-user readiness.
- Do not use this skill to configure GitHub tokens, write runtime env files, configure 1Password
  shell plugins, or provision secrets.
- Do not use this skill to mutate GitHub or monday data, post readiness updates, run setup, run
  release validation, or perform general machine administration.

## Preconditions

- Work from the `me` checkout at `/Users/pirog/tanaab/me`.
- The user should have completed the README manual setup checklist first.
- The GitHub and monday app connectors must be available in the active Codex session for connector
  validation.

## Workflow

1. Run the bundled local probe:

   ```sh
   bun ./skills/me-readiness/scripts/check-machine.js
   ```

2. Parse the JSON output and summarize each `fail` and `warn` check with its `remediation` text.
   The helper emits checks in dependency order and every check includes one stable `bucket`:
   `homebrew`, `packages`, `dotfiles`, `manual_apps`, then `codex_plugins`.

   Bucket meanings:
   - `homebrew`: Homebrew command availability.
   - `packages`: Brewfile declarations and required command availability.
   - `dotfiles`: repo-owned stowed files and generated local config readiness.
   - `manual_apps`: installed apps and local app/auth/network readiness.
   - `codex_plugins`: local Codex plugin links or plugin install surfaces owned by this repo.

   The bucket order is intentional: package manager availability comes before package contracts,
   package contracts come before dotfile checks, dotfiles come before manual app readiness, and
   app readiness comes before Codex plugin and connector identity.

   If the only local failure is `onepassword_cli_vault_access` or `tailscale_status` and its
   remediation says to retry with unsandboxed local access, retry the helper with
   unsandboxed/elevated local access before declaring the machine not ready.

3. Discover the GitHub connector tools. If unavailable, report that the user should enable the
   GitHub app in Codex and confirm the GitHub app connection before rerunning readiness.

4. Run a read-only GitHub identity probe with the authenticated user login/profile tool. Require
   both:
   - GitHub login `pirog`
   - GitHub user ID `713424`

5. Discover the monday connector tools. If unavailable, report that the user should enable the
   monday.com app in Codex and confirm the monday app connection before rerunning readiness.

6. Run a read-only monday identity probe with `list_users_and_teams(getMe=true)`. Require both:
   - monday user ID `71211606`
   - monday user name `Michael Pirog`

7. If connector identity fails, report that the user should reauthorize the relevant Codex app
   connector as Michael Pirog and confirm the app is connected to the correct account.

8. Close with a concise readiness summary:
   - ready: no local failures and both connector identities matched
   - ready with warnings: no local failures, warnings present, and both connector identities matched
   - not ready: any local failure or connector identity mismatch

## Checkpoints

- Do not mutate GitHub or monday data during readiness. No issues, PRs, update posts, item edits,
  or browser/computer automation fallback.
- Do not print tokens, secret values, raw environment contents, or raw command stderr that may
  contain sensitive data.
- Do not add readiness checks for environment values, token provisioning, GitHub/monday task
  automation, setup mutation, release builds, or Leia.
- Do not add a new helper check id without assigning it to one of the five allowed local buckets.
- Treat `op vault list --format json` as the local 1Password readiness gate because it proves the
  app is unlocked and integrated enough for authenticated CLI access.
- Treat `tailscale status --json` as the local Tailscale readiness gate. Require the local node to
  be running, online, present in the network map, assigned a Tailscale IP, and connected to
  `tanaab.dev`. Peer pings are troubleshooting tools, not readiness gates.
- Treat the README as human setup guidance. Use the helper JSON and connector probes as the
  machine-readable source of readiness truth.
- Follow the root `AGENTS.md` readiness maintenance policy when deciding whether future repo or
  skill changes should update this readiness skill.

## Completion Criteria

- The helper JSON was parsed successfully.
- Every local `fail` or `warn` was reported with a remediation step.
- Every helper check included a known bucket and bucket order matched the dependency order.
- The GitHub connector either matched login `pirog` and ID `713424` or the setup mismatch was
  reported.
- The monday connector either matched Michael Pirog ID `71211606` or the setup mismatch was reported.

## Bundled Resources

- [`scripts/check-machine.js`](./scripts/check-machine.js): local read-only machine readiness probe
  that emits deterministic JSON.

## Validation

- Confirm the local helper output is parseable JSON.
- Confirm every `warn` and `fail` local check includes remediation.
- Confirm every helper check includes a known bucket.
- Confirm local helper checks stay within the five allowed buckets and do not include environment
  value checks.
- Confirm GitHub validation used a read-only authenticated identity probe and performed no
  mutations.
- Confirm monday validation used `list_users_and_teams(getMe=true)` and performed no mutations.
