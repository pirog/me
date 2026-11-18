Update this Codex installation using its trusted Me binding.
Read references/updates.md in the bound workspace and follow that procedure:
safely fast-forward eligible main checkouts while preserving local edits. Use Me’s setup helper
to finish eligible dependency/build and Codex plugin/cache refreshes independently, then run
the full Agent System Doctor → Install → Doctor against the trusted Me binding. Preserve
safety holds without making every repository's refresh success a lifecycle prerequisite.
Review/trust changed hooks through the native CLI when needed.
Ordinary read-only ISSUE ASSIGNMENTS activity alone is not a source-update hold.
Leave other schedules running and keep the smoke test disabled.
On every run, including unchanged, incomplete, or failed runs, return two quoted Markdown
cards in this order. Follow the report format in the reference:

1. The SYSTEM UPDATE verdict card with all eight check rows and Notes only when needed.
2. Exactly one ℹ️ STATUS REPORT with the observed installation details, regardless of debug.
   Keep verified results and identify held, failed, or unverified checks in their own sections.
