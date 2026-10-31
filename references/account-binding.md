# account-default setup

use this flow from `$agent-system-codex-binding` after binding Me, or when the operator asks to
“set up my accounts”, “update my account defaults”, or “change my account binding”. account-only
updates preserve the workspace binding. this is a local preference file, not a credential store.

1. use the newest trusted `piroplugin-account-context.runtime` for `argvPrefix` and `pluginData`.
   if absent, report that Piroplugin needs its current trusted hook loaded; do not guess a home,
   checkout, cache or storage path. read and apply [account policy](./account-policy.md).
2. append `inspect --plugin-data <pluginData>` to that prefix, with separate shell-safe arguments.
   preserve existing valid choices unless the operator asks to change them. missing or invalid
   preferences enter discovery; do not silently migrate old email-only records into invented IDs.
3. discover the available GitHub and Google connections through native tool metadata. use supported
   read-only profile checks to obtain each candidate's provider account ID and login/email. inspect
   identity only; mail, files and events are unnecessary. connector link IDs are temporary routing
   handles, not provider account IDs. never copy tokens or resolve secrets.
4. map verified identities to the two profiles, `pirog` and `tanaabot`. exact GitHub logins matching
   those names are clear matches. for Google, infer likely ownership from the verified identity and
   operator context; names and domains are evidence, not proof or permission. save clear matches
   during authorized setup without another confirmation. ask one compact question for uncertain
   ownership or multiple plausible defaults. previously selected defaults and alternatives need
   no repeat question. an unavailable service can remain absent without blocking the other one.
5. assemble version 2 preferences with `profiles.<profile>.<github|google>` containing `default`
   (the account ID) and `accounts` (objects with `id` plus `login` for GitHub or `email` for Google).
   keep the selected default in the account list. multiple Google accounts are supported; record
   approved alternatives without treating them as permission to send, write or switch after failure.
   only `pirog` and `tanaabot` profiles are supported. keep unchanged profile/provider entries.
6. append `save --plugin-data <pluginData>` to the runtime prefix and pass the complete JSON through
   standard input. the helper validates and atomically writes `account-defaults.json` with mode
   `0600` outside the package. never put private selections in shell arguments, tracked files,
   examples or fixtures. inspect again and compare the saved choices with the intended choices.
7. report defaults, alternatives and any unresolved service in the private chat. future hooks load
   the saved file; use the verified readback in this setup chat. removing a workspace binding does
   not delete account preferences, sign out connectors, or revoke their credentials.

to exercise first-run discovery, preserve the existing file outside the checkout, temporarily move
it aside, and invoke this flow through Codex Binding. compare the discovered result with the approved
choices. restore the backup on failure; never erase the only working copy to test onboarding.
