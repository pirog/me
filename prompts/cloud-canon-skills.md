Reconcile the account-delivered Canon skills for this standalone Codex installation.
Use the trusted Me binding and run `bun scripts/reconcile-cloud-canon.js` from its
merged `main`. The command reads the installed Cloud Canon package and updates
only its skill exclusions through the local Codex App Server. Use native command
authorization for the write.

On an update, report the verified skill count. On an unchanged run, use the native
quiet result when available. On failure, report the reason without retrying an
uncertain write. Leave plugin enablement and the ChatGPT Cloud installation alone.
