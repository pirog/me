# Template Setup

Use this file in the root of a GitHub repository template when the template is meant to be adopted,
renamed, and then cleaned up into a real project.

This document has two jobs:

- describe the manual steps to turn the template into a real repository
- act as a human-readable setup spec for an AI agent

## Agent-Driven Setup

This document should be usable as the source of truth for an AI-assisted adoption flow.

That means it should stay concrete, ordered, and scoped to the actual template surfaces instead of
turning into vague prose.

## Agent Inputs

List the few inputs an adopting repo must provide up front.

Typical examples:

- `project-slug`
- `github-owner`
- `public-origin`
- `package-name`: optional, only if publication is planned
- `description`: optional but useful
- `runtime-support` or another template-specific mode selector, if the template ships variants

Everything else should be derived where possible.

## Copy-Paste Agent Prompt

Include a default prompt that tells an agent to use this file as the setup contract.

The prompt should usually say to:

1. follow `TEMPLATE-SETUP.md` in order
2. prune unsupported surfaces or variants
3. rename entrypoints, metadata, docs, workflows, and hosted paths
4. preserve the release and validation contract unless the setup inputs require a smaller scope
5. clean up template-only traces once adoption is complete
6. run the relevant validation commands
7. summarize what was kept, removed, renamed, and what follow-up work is still recommended

## Setup Order

Follow the setup steps in a stable order so later steps can assume the earlier decisions are done.

Typical sections:

## 1. Choose Supported Surfaces

Decide which runtimes, variants, frameworks, or deployment targets the adopted repo will keep.

Then prune the file tree, workflows, examples, docs, and release logic to match that decision.

## 2. Rename Entry Points And Replace Template Identity

Replace the template repo identity everywhere it appears, including:

- entrypoint filenames
- package metadata
- workflow names and references
- docs and hosted URLs
- tracked release artifacts

## 3. Replace Placeholder Logic

Templates should ship with working placeholder behavior, not broken stubs.

When the new repo is adopted, replace the placeholder logic with project-specific behavior only
after naming and scope decisions are settled.

Keep any release-stamping or versioning surfaces intact while doing so.

## 4. Reconfigure Hosting, CI, And Release Scope

Update hosting, deployment, CI, and release automation to match the adopted repo's real support
matrix and published surface.

Remove dead workflow or release logic instead of leaving template leftovers behind.

## 5. Template Cleanup

Once the new repo identity is in place:

- remove `TEMPLATE-SETUP.md`
- remove any README references that only make sense in the source template repo
- reset `CHANGELOG.md` so it is immediately usable for the first real release
- remove leftover placeholder names, domains, package names, and example references
- remove variant-specific files that no longer apply

The adopted repository should look native, not half-template.

## 6. Validate The Final Surface

Run the relevant lint, test, build, and release-shaped verification commands.

The important check is that the shipped and documented surface is coherent, not just that the source
files compile.

## Final Summary

Ask the agent or adopter to summarize:

- supported surfaces kept
- files removed
- files renamed
- final package or hosted identities
- validation that ran
- follow-up work still recommended
