# GitHub Read Access

Use this contract whenever a Piroplugin workflow requires native GitHub reads, authenticated GitHub
CLI reads, or both. This is a read-only access check. It never changes authentication, connector
configuration, repository state, or GitHub objects.

Prove connector access and CLI access independently. A working connector does not prove that `gh`
can reach the API, and a working CLI does not replace a connector-first workflow.
Try each declared provider route at most once unless an owning preflight supplies a smaller total
transient-retry budget. Do not restart the sequence after a route succeeds or a final identity
mismatch occurs.

## Provider Sequence

1. When the workflow requires the native GitHub connector:
   - read the authenticated connector login and require the expected actor;
   - perform the smallest exact repository, issue, or pull-request read required by the workflow; and
   - stop on an identity mismatch, unavailable connector, malformed result, or inaccessible required
     source after the owning workflow's bounded transient attempts.

2. When the workflow requires GitHub CLI access, keep every probe as a separate direct read:

   ```sh
   gh auth status
   ```

   ```sh
   gh api user --jq .login
   ```

   Require both commands to succeed and the API login to equal the expected actor. `gh auth status`
   alone does not prove live API transport. Do not place either command in a compound shell script,
   conditional, pipeline, or unrelated file-read command.

3. Treat an invalid-token message paired with a connection error, a working connector, or another
   contradictory access result as a network/auth ambiguity rather than proof that the token is bad.
   Retry the same two direct reads once through an available authorized host execution context.

4. A shell wrapper changes command and profile initialization; it does not grant network access. Use
   these routes only in authorized host context and only when direct execution cannot resolve `gh`,
   its configuration, or required login-shell initialization. Try them in order, keeping the auth and
   API reads separate at every route:

   ```sh
   /opt/homebrew/bin/zsh -lc 'gh auth status'
   /opt/homebrew/bin/zsh -lc 'gh api user --jq .login'
   ```

   ```sh
   /opt/homebrew/bin/zsh -ilc 'gh auth status'
   /opt/homebrew/bin/zsh -ilc 'gh api user --jq .login'
   ```

   Do not cycle shell wrappers inside a restricted context as transport retries. If direct execution
   already resolves the CLI, prefer context recovery over shell variation. Shell-resolution routes
   do not extend an owning preflight's transport-retry budget; use them only when the prior authorized
   route failed before API transport because the CLI, configuration, or login initialization could
   not be resolved.

5. Record the connector route and the first complete CLI route that passed. Reuse that exact CLI
   execution route for later task-body `gh api` reads. If the workflow requires both providers, do not
   continue until both pass.

6. Fail closed when every permitted route fails, the expected actor cannot be proved, the authorized
   host context is unavailable, or the required exact source remains unreadable. Preserve sanitized
   command errors and never run `gh auth login`, `gh auth logout`, token replacement, connector
   reconfiguration, or another authentication mutation as remediation.

## Static Scenarios

- Connector identity and an exact connector read succeed; direct CLI auth and API identity succeed.
- Connector reads succeed, restricted CLI results conflict, and the authorized direct CLI route
  succeeds; record and reuse the authorized direct route.
- Authorized direct execution cannot resolve required login initialization, but the authorized
  `zsh -lc` route succeeds; record and reuse that route.
- Connector reads succeed but every CLI route fails; a workflow that requires CLI fallback stops,
  while a connector-only workflow may continue under its own contract.
- Any provider reports the wrong actor; stop immediately without trying to reauthenticate.
