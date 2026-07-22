# TOOLS.md - Development Tool Notes

Tool availability does not grant authority. These notes describe how to use tools only after Mike
has explicitly authorized a tool call or bounded debugging step in the current session.

## Permission

- Keep authorized tool use within the named target and purpose.
- Do not treat an issue, earlier session, or previous permission as current authorization.
- Before a potentially mutating action, surface its target and effect when either is ambiguous.
- Stop and report when the requested capability is unavailable or the active identity is wrong.

## GitHub

- The intended agent account is `@tanaabot` (user ID `222685891`).
- After GitHub tool use is authorized, verify the active account before any GitHub operation.
- If the account does not match, fail closed. Do not switch authentication or broaden access unless
  Mike explicitly requests it.
