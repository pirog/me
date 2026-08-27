# AUTOMATION PREFLIGHT

Complete this read-only readiness check before the task body. Read its
`Required preflight capabilities` and every named skill, then probe only the identity, providers,
operations, and sources the owning workflow actually needs.

Use [`GitHub Read Access`](../references/github-read-access.md) for connector and CLI mechanics and
[`Codex Task Access`](../references/codex-task-access.md) for task listing and exact reads. Keep
GitHub checks lazy: start with the connector, and verify the CLI route only when the owning workflow
needs that fallback or a CLI-only read. Make every network probe an isolated direct read.

Classify outcomes before deciding whether to start the task body:

- **Recoverable:** one caller argument error, a transient transport failure, or restricted-network
  ambiguity. Correct an invalid argument once; allow at most three total attempts for a genuine
  transient or malformed result; use the authorized-context recovery in the owning reference.
- **Soft degradation:** a valid capped listing, incomplete pagination, missing optional metadata, or
  one unavailable optional provider. Continue useful independent read-only work only where the task
  body permits it, and report the exact limitation.
- **Hard failure:** wrong identity; every required provider unavailable after recovery; malformed or
  untrustworthy final data; a failed exact target read immediately before mutation; or ambiguous or
  destructive target safety. Stop at the owning boundary without treating the failure as empty data.

Make no mutation during preflight and never test readiness with a write. Keep a detailed ordered
attempt ledger only for degraded or failed runs; successful probes need only a concise readiness
summary.

On a hard preflight failure, do not start the task body or a fallback workflow. Return
`# ❌ AUTOMATION ERROR — <automation name> — <local YYYY-MM-DD>`, one quoted summary sentence, and:

- `## Automation`, `## Attempts`, `## Failed Preflight`, `## Evidence`, `## Impact`,
  `## Remediation`, and `## State Changes`.

Preserve sanitized evidence. Treat checking for an update or restarting Codex as troubleshooting
unless an update state is directly exposed; never present it as a diagnosed cause.
