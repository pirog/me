---
name: tanaab-release
description: Guide release preparation, changelog drafting, version readiness, and release contract work under the shared Tanaab coding structure.
---

# Tanaab Release

## Overview

Use this skill for release preparation, changelog drafting, release contract decisions, and release-facing repository updates within the Tanaab coding hierarchy.

## When to Use

- The request updates `CHANGELOG.md`, release notes, or release-facing repository metadata.
- The task needs release readiness checks across implementation, testing, and workflow automation.
- The task decides what a release should version, update, publish, or write back to the repository.
- The user wants a concise release summary built from repository history.

## When Not to Use

- Do not use this skill for raw implementation work that does not affect release preparation.
- Do not use this skill to publish, tag, or push a release unless the user explicitly asks for that action.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Primary ownership: changelog text, release notes, release-readiness summaries, versioning policy, expected release outputs, and release-facing repository metadata.
- Defer implementation changes to the owning implementation skill.
- Defer release or deploy workflow mechanics to `tanaab-github-actions`, even when those workflows carry out the release contract defined here.
- Defer test evidence and coverage policy to `tanaab-testing`.
- Pair with `tanaab-testing` when test results or coverage gates determine release readiness.
- Pair with `tanaab-github-actions` when release or deploy workflows need updates.
- Pair with `tanaab-javascript` or `tanaab-shell` when release automation touches runtime or scripting code.
- Use `tanaab-templates` when a reusable release-note or workflow scaffold should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the release surface: changelog, release notes, version context, versioning policy, expected release outputs, release-facing metadata, and expected gates.
3. Decide the release contract before touching automation when release behavior itself is in scope.

- Identify which files, versions, or metadata should update as part of the release.
- Identify which artifacts, deploy outputs, or write-backs are expected from the release flow.
- For hosted shell or CLI repos, decide which generated `dist/` files are part of the release contract, which entrypoints get stamped, and whether public metadata such as sitemap lastmod must update at release time.
- Hand implementation of workflow mechanics to `tanaab-github-actions`.

4. Build the release change set.

- Run `git describe --tags --abbrev=0`.
- If that fails, inspect tags with `git tag --sort=-creatordate`.
- Review commits with `git log --oneline <tag>..HEAD`.
- Review changed files with `git diff --name-status <tag>..HEAD`.
- Merge low-level commits into meaningful release notes and exclude noise that does not matter to users.

5. Write the unreleased section.

- Target the top unreleased section in `CHANGELOG.md`.
- Keep existing templated header text intact when present.
- Format each change as an unordered `-` bullet.
- Start each bullet with a past-tense verb such as `Added`, `Converted`, `Fixed`, `Introduced`, `Replaced`, `Switched`, or `Updated`.
- Keep each bullet concise and user-facing.
- Mention the outcome and scope in one sentence.
- Alphabetize the bullet list after drafting.

6. Add issue or PR links when applicable.

- Append a Markdown link to each bullet when applicable.
- Prefer PR links when work landed through a PR.
- Use issue links when no PR applies.
- Place the link at the end of the bullet and keep syntax consistent.

7. Pull from `tanaab-testing`, `tanaab-github-actions`, `tanaab-javascript`, `tanaab-shell`, or `tanaab-templates` when the release task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the release skill.
- [assets/tanaab-release-icon.png](./assets/tanaab-release-icon.png): UI icon for the release skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm release notes or changelog entries are concise and scoped to user-visible changes.
- Confirm this skill stayed the primary owner only for release-facing narrative, readiness, or release-contract surfaces.
- Confirm workflow mechanics remain with `tanaab-github-actions` when release automation changes are involved.
- Confirm hosted or generated release artifacts are named explicitly when the repo publishes a `dist/` surface or URL-served script.
- Re-read final bullets for tense, clarity, and ordering.
- Confirm every applicable bullet has a valid link.
- Confirm any release gates or workflow changes are explicit.
- Confirm no publish, tag, or push action is taken unless the user asked for it.
