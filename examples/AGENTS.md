# Leia Example Guidance

This file applies when editing `examples/**/README.md`. These README files are executable Leia specs
consumed in CI, and most scenarios mutate GitHub-hosted macOS runners.

## General Style

- Prefer behavior-focused `# should` labels over scenario labels.
- Keep each `# should` block focused on one observable contract. Split blocks whose title needs
  `and`/`or`, mixes unrelated domains, or grows past roughly 12-15 command lines unless the block is
  one coherent multiline command.
- Treat each blank-line-separated Leia block as a separate script. Do not rely on shell variables,
  functions, or working-directory changes persisting across `should` blocks.
- Prefer direct command pipelines, command substitutions, and deterministic inline values over
  writing files only to inspect them later.
- Do not capture command output into shell variables merely to grep it later. When capture is needed
  to preserve a failing command's status, print the output before assertions.
- Keep freeform `# should` prose lowercase while preserving exact casing for identifiers, paths,
  flags, environment variables, and expected output.

## Example Placement

- `inputs` owns non-mutating public interface checks: help text, displayed defaults, input
  validation, secret masking, hidden or removed inputs, and option/environment precedence.
- `defaults` owns one baseline machine-seeding run with default wrapper-owned behavior plus required
  CI secrets and fixtures.
- `payload` owns payload discovery, clone, refresh, rerun, and local-work preservation behavior.
- `version` owns released Tanaab source materialization.
- Add coverage to the narrowest existing example that owns the behavior. Add a new example only when
  the behavior needs incompatible bootstrap inputs, crosses enough domains to blur an existing
  example, or intentionally needs another successful `boot.sh` run.

## Mutating Examples

- Mutating examples should run the prepared `boot.sh` entrypoint once unless the example explicitly
  owns rerun, idempotency, or payload lifecycle behavior.
- Use one representative input form for a runtime flow. Prove CLI and environment spellings in
  `inputs` instead of repeating the machine-seeding path.
- Defaults-focused examples should avoid overriding wrapper-owned defaults while still providing
  required CI inputs such as payload paths, 1Password tokens, safe SSH-key fixtures, and force mode
  when needed to prove replacement behavior.
- Do not add expected-failure probes after machine mutation has begun. Keep failure-contract checks
  in `inputs` or make them fail during input validation before bootstrap side effects.
- Keep `Destroy tests` cleanup scoped to artifacts created by the scenario, even on ephemeral CI
  runners.
- Run mutating examples with Leia retries disabled so a partial bootstrap is not retried on the same
  VM.

## Shell Fixtures

- Use `TMPDIR` for durable fixtures, unavoidable logs, and helper internals only.
- Keep checked-in fixtures beside the README that owns them; do not duplicate one fixture across
  input-form examples.
- Avoid braced shell variable expansions such as `${VAR}` when plain `$VAR` works; Leia parsing has
  been brittle around braces.
- Do not give setup fixture commands standalone `# should` blocks unless the fixture state itself is
  the contract.
