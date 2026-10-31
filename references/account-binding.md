# account-default setup

use this flow from `$agent-system-codex-binding` after binding Me, for account-default updates, or
when work needs a missing, invalid or unclear account default. no separate setup request is
required. account-only work preserves workspace binding and does not require a healthy manifest.
read and apply [account policy](./account-policy.md); preferences never grant service permissions.

1. use the newest trusted `piroplugin-account-context.runtime` for `argvPrefix` and `pluginData`.
   when available, append `inspect --plugin-data <pluginData>` using separate shell-safe arguments.
   if the runtime is absent, continue discovery for this chat without guessing a storage path.
   report that persistence needs the current trusted Piroplugin hook; do not require a restart to
   continue work with an otherwise resolved, verified account.
2. inspect the affected profile/provider, not just the file's overall status. `partial` results
   retain valid selections with scoped issues; absent providers and `unconfigured` need discovery
   only when used. handle file-level inspection failures under step 7 before any write; never rebuild
   over an unreadable file. preserve existing valid choices and operator-approved task selections. a failed
   profile check, authentication failure or access denial is not a setup trigger or fallback grant.
3. discover relevant GitHub and Google connections through native metadata and supported read-only
   profile checks. obtain provider account IDs and login/email identifiers; no mail, files, events,
   tokens or secrets are needed. deduplicate connections by provider account ID. don't make GitHub
   depend on a working Google connector, or one Google service depend on every other Google service.
4. map verified identities to `pirog` and `tanaabot`. exact GitHub logins matching those names are
   clear matches. for Google, infer likely ownership from verified identity and operator context;
   names and domains are evidence, not proof or permission. reuse known choices. ask one compact
   question only for uncertain ownership or multiple plausible defaults; an unavailable provider
   can remain absent. preserve the current default when the same verified ID has a new login/email.
   without an interactive answer, report the affected operation as unresolved and continue unrelated
   work. don't repeat the question or discovery until relevant state or operator direction changes.
5. assemble version 2 preferences: `profiles.<pirog|tanaabot>.<github|google>` has `default` (an
   account ID) and `accounts` (objects with `id` plus `login` or `email`). include the default in the
   list and retain approved alternatives. refresh identifying text only after verifying the same ID.
   retain valid unrelated entries; never silently drop unresolved invalid entries during a repair.
6. when storage is available, append `save --plugin-data <pluginData>` and send complete JSON on
   standard input. save clear mappings without another confirmation. strict writes reject invalid
   entries and atomically persist mode `0600`. use the returned readback to verify intended choices;
   don't repeat a successful save or add a redundant inspection. if readback is uncertain, inspect
   before considering another write. keep private selections out of arguments and tracked files.
7. on an inspection or save failure, keep verified selections for this chat and report that they were not persisted;
   don't turn persistence into a prerequisite for authorized service work. diagnose once using the
   returned code. `account-defaults-unsafe-permissions` permits narrowing the verified regular file
   to mode `0600`, then inspecting again. if a sandboxed command returns
   `account-defaults-permission-denied`, request native filesystem approval for that same operation
   before settling for session-only preferences. that error is not an approval or service-account
   denial. never widen file permissions or retry an explicit native approval or service-access denial. preserve malformed,
   unreadable or unresolved records until repaired or the operator chooses replacement;
   continue with resolved session selections meanwhile. do not repeatedly run discovery or writes
   against an unchanged failure. report saved and session-only choices distinctly.

future hooks load saved choices; this chat uses the verified readback or its verified session
selections. an explicit account selection overrides an older hook snapshot. unbinding the workspace
does not delete preferences, sign out connectors or revoke credentials.
