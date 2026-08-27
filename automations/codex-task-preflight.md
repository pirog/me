# AUTOMATION PREFLIGHT

Complete this read-only preflight before starting the task body.

Preflight proves that the automation and its named skills can operate. Keep it limited to required
capabilities, identity, access, readable sources, and trustworthy operation results. Do not use
template conformance, canonical headings, polished formatting, or optional managed metadata as
preflight gates. Leave source meaning, readiness, ranking, and any later normalization to the owning
task-body skill.

1. Read the task body's `Required preflight capabilities` and the complete contracts of every named
   skill.
2. Confirm that every required skill, connector, CLI, native Codex operation, registry, and source is
   available. Exercise required read operations with the smallest safe probes, and record each probe
   in an attempt ledger:
   - Keep every CLI network probe as one isolated direct read. Do not hide it in a compound shell
     script, conditional, pipeline, or unrelated file-read command. For GitHub CLI identity and
     access, run `gh auth status` and then separately run `gh api user --jq .login`.
   - Correct one caller-originated argument-validation mistake and retry that operation once. For a
     transport error, hang, malformed result, or unavailable current-host source, make at most three
     total attempts. Never treat repeated identical failures as progress.
   - When a restricted execution result leaves network access and authentication ambiguous, retry
     once through an available authorized host execution context using the same isolated read. Require
     the retry to succeed with the expected identity, record that context for later task-body CLI
     reads, and fail closed when the context is unavailable or the retry fails.
   - When Codex task management is required, require a trustworthy current-host listing and exact
     task read-back. A valid listing that reaches its supported maximum without a cursor, total, or
     completeness marker proves the operation is usable but not that coverage is complete. Repeat a
     saturated listing once when the task requires complete coverage. Let the owning task-body skill
     decide whether confirmed incomplete coverage is a reported limitation or a task-specific
     readiness failure; continuation is allowed only when that skill explicitly permits it.
   - Fail immediately on an identity mismatch or ambiguous exact task identity. An error or malformed
     final result is a failed preflight, not an empty state.
3. Make no mutation during preflight. Do not probe a write operation by changing state; verify that
   it is exposed and leave its complete safety gates to the owning skill.

If any required capability or task-specific readiness requirement is missing, fails, or remains
ambiguous after its bounded attempts, stop without starting the task body or any fallback workflow.
Return only `# ❌ AUTOMATION ERROR — <automation name> — <local YYYY-MM-DD>`, followed immediately by
one quoted sentence explaining why the task body did not run, with:

- `## Automation`: managed automation id and intended outcome;
- `## Attempts`: ordered probes, corrected inputs, execution context, sanitized results, and whether
  any repeated result confirmed a persistent failure or saturation;
- `## Failed Preflight`: failed phase and exact capability;
- `## Evidence`: observed error, malformed result, or task-specific incomplete coverage without
  invented details;
- `## Impact`: which task-body operations were not attempted;
- `## Remediation`: the smallest evidence-backed next step; and
- `## State Changes`: confirm exactly what remained unchanged.

Do not claim a pending Codex update caused a failure unless that state is directly exposed. When
native Codex operations fail and no cause is observable, recommend checking for an update and
restarting Codex as troubleshooting, not as a diagnosed root cause.
