# AUTOMATION PREFLIGHT

Complete this read-only preflight before starting the task body.

1. Read the task body's `Required preflight capabilities` and the complete contracts of every named
   skill.
2. Confirm that every required skill, connector, native Codex operation, registry, and source is
   available. Exercise required read operations with the smallest safe probe. When Codex task
   management is required, require usable current-host listing and exact task read-back; an error,
   malformed result, or coverage that cannot be proved is a failed preflight, not an empty state.
3. Make no mutation during preflight. Do not probe a write operation by changing state; verify that
   it is exposed and leave its complete safety gates to the owning skill.

If any required capability is missing, fails, or remains ambiguous, stop without starting the task
body or any fallback workflow. Return only `# AUTOMATION ERROR — <local YYYY-MM-DD>` with:

- `## Automation`: managed automation id and intended outcome;
- `## Failed Preflight`: failed phase and exact capability;
- `## Evidence`: observed error, malformed result, or incomplete coverage without invented details;
- `## Impact`: which task-body operations were not attempted;
- `## Remediation`: the smallest evidence-backed next step; and
- `## State Changes`: confirm exactly what remained unchanged.

Do not claim a pending Codex update caused a failure unless that state is directly exposed. When
native Codex operations fail and no cause is observable, recommend checking for an update and
restarting Codex as troubleshooting, not as a diagnosed root cause.
