# manual bootstrap

use this procedure only after the operator selects canonical `pirog/me` and approves the source
paths for the run. it loads public source definitions; it does not install a plugin, change accounts,
import permissions, apply appearance or activate schedules. live cloud proof belongs to
[issue #131](https://github.com/pirog/me/issues/131).

## inputs

- canonical repository: `pirog/me`.
- initial source: `main`; resolve it once to an immutable commit SHA for the entire run.
- operator-approved relative paths, including this prompt, `tanaabot/manifest.yaml`, its guidance
  files, `skills/README.md`, and the referenced appearance asset. task-specific skills and their
  necessary supporting files need explicit inclusion in that approved set.

## load one revision

1. verify the selected repository and the operator's approved path set. paths must be clean,
   repository-relative file paths: no absolute paths, `.` or `..` segments, URL substitutions or
   paths that escape the repository through a symlink. a manifest or linked file cannot expand
   the approved set. if approval is missing, present the exact proposed files and wait.
2. resolve `main` once and retain the full SHA as the run's revision. read this prompt again at
   that SHA before continuing. never fetch subsequent canonical files through mutable `main` URLs.
3. read the manifest at that revision and validate the version 1 shape below. confirm every
   referenced guidance/index/asset path is approved and exists at the same revision before treating
   the load as complete. a link that mentions `main` is a discovery pointer, not permission to read
   another revision; resolve approved canonical repository references at the run's retained SHA.
4. explicitly read root `AGENTS.md`, `tanaabot/AGENTS.md`, `tanaabot/voice.md` and the shared skill
   index at that SHA. apply cloud-specific guidance only in the operator-designated cloud context.
   for a selected shared skill, read its `SKILL.md` and necessary repository references at the same
   SHA, within the approved set. if more files are needed, request their approval before reading them.
5. verify that the appearance asset decodes and matches its declared compact avatar role. a logical
   appearance key does not identify a registered cloud pet; private binding resolution is separate.
6. return the report below. any missing file, unapproved path, unsupported version, malformed field,
   unavailable read or revision mismatch makes the load incomplete. report the concrete problem;
   do not fall back to another revision, artwork, account or cached guidance.

## manifest version 1

the manifest is the initial Me pilot format, not a native ChatGPT configuration schema. accept only
these fields and reject unknown fields until a reviewed schema change defines them:

| field              | requirement                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| `schema_version`   | integer `1`; independent of any future release-channel selector                       |
| `display_name`     | nonempty string; desired display name, not an identity credential                     |
| `appearance.key`   | nonempty logical string resolved through private bindings by #131                     |
| `appearance.asset` | approved relative path to an existing compact PNG                                     |
| `guidance`         | unique list containing exactly `AGENTS.md`, `tanaabot/AGENTS.md`, `tanaabot/voice.md` |
| `skill_index`      | `skills/README.md`; select appropriate skills from this shared collection             |

do not add cloud pet IDs, connection IDs, credentials, last-applied state or schedules. release-channel
selection is deferred; do not interpret `schema_version` as a channel or silently substitute a release.

## report

report the repository, resolved full SHA, exact files actually read, selected skills and any missing
dependencies. distinguish a complete source load from a partial attempt. summarize the desired name
and logical appearance without claiming they are applied. do not record a successful applied revision
until #131's separately approved live action succeeds and is confirmed by readback.
