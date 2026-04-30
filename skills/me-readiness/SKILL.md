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

Use this skill to verify that a bootstrapped `me` machine is ready for Codex work as Michael
Pirog. It checks local bootstrap state, 1Password readiness, Codex plugin links, and the monday
connector identity without mutating monday data or machine configuration.

## When to Use

- Run after `boot.sh` and the README manual setup checklist have completed.
- Run before relying on Codex plugin skills, monday connector actions, or 1Password-backed local setup.
- Run when moving this `me` environment to a new interactive macOS user profile.

## When Not to Use

- Do not use this skill for Agentbox or robot-user readiness.
- Do not use this skill to configure GitHub tokens, `me.env`, or 1Password shell plugins.
- Do not use this skill to mutate monday data or post readiness updates.

## Preconditions

- Work from the `me` checkout at `/Users/pirog/tanaab/me`.
- The user should have completed the README manual setup checklist first.
- The monday app connector must be available in the active Codex session for connector validation.

## Workflow

1. Run the bundled local probe:

   ```sh
   bun ./skills/me-readiness/scripts/check-machine.js
   ```

2. Parse the JSON output and summarize each `fail` and `warn` check with its `remediation` text.
   If the only local failure is `onepassword_cli_account` and its message says the process could
   not connect to the 1Password desktop app, retry the helper with unsandboxed/elevated local access
   before declaring the machine not ready. Otherwise stop after local failures unless the user
   explicitly wants the monday connector checked anyway.

3. Discover the monday connector tools. If unavailable, report that the user should enable the
   monday.com app in Codex and confirm the monday app connection before rerunning readiness.

4. Run a read-only monday identity probe with `list_users_and_teams(getMe=true)`.

5. Require both:
   - monday user ID `71211606`
   - monday user name `Michael Pirog`

6. If monday identity fails, report that the user should reauthorize the monday app connector as
   Michael Pirog and confirm the monday app is connected to the correct monday account.

7. Close with a concise readiness summary:
   - ready: no local failures and monday identity matched
   - ready with warnings: no local failures, warnings present, and monday identity matched
   - not ready: any local failure or monday identity mismatch

## Checkpoints

- Do not mutate monday data during readiness. No update posts, item edits, or browser/computer
  automation fallback.
- Do not print tokens, secret values, raw environment contents, or raw command stderr that may
  contain sensitive data.
- Treat the README as human setup guidance. Use the helper JSON and connector probe as the
  machine-readable source of readiness truth.

## Completion Criteria

- The helper JSON was parsed successfully.
- Every local `fail` or `warn` was reported with a remediation step.
- The monday connector either matched Michael Pirog ID `71211606` or the setup mismatch was reported.

## Bundled Resources

- [`scripts/check-machine.js`](./scripts/check-machine.js): local read-only machine readiness probe
  that emits deterministic JSON.

## Validation

- Confirm the local helper output is parseable JSON.
- Confirm every `warn` and `fail` local check includes remediation.
- Confirm monday validation used `list_users_and_teams(getMe=true)` and performed no mutations.
