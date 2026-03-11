---
name: tanaab-release
description: Guide release preparation, changelog drafting, version readiness, and release workflow coordination under the shared Tanaab coding structure.
---

# Tanaab Release

## Overview

Use this skill for release preparation, changelog drafting, and release-facing repository updates within the Tanaab coding hierarchy.

## When to Use

- The request updates `CHANGELOG.md`, release notes, or release-facing repository metadata.
- The task needs release readiness checks across implementation, testing, and workflow automation.
- The user wants a concise release summary built from repository history.

## When Not to Use

- Do not use this skill for raw implementation work that does not affect release preparation.
- Do not use this skill to publish, tag, or push a release unless the user explicitly asks for that action.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Pair with `tanaab-testing` when test results or coverage gates determine release readiness.
- Pair with `tanaab-github-actions` when release or deploy workflows need updates.
- Pair with `tanaab-javascript` or `tanaab-shell` when release automation touches runtime or scripting code.
- Use `tanaab-templates` when a reusable release-note or workflow scaffold should be applied.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the release surface: changelog, release notes, version context, workflows, and expected gates.
3. Build the release change set.
- Run `git describe --tags --abbrev=0`.
- If that fails, inspect tags with `git tag --sort=-creatordate`.
- Review commits with `git log --oneline <tag>..HEAD`.
- Review changed files with `git diff --name-status <tag>..HEAD`.
- Merge low-level commits into meaningful release notes and exclude noise that does not matter to users.
4. Write the unreleased section.
- Target the top unreleased section in `CHANGELOG.md`.
- Keep existing templated header text intact when present.
- Format each change as an unordered `-` bullet.
- Start each bullet with a past-tense verb such as `Added`, `Converted`, `Fixed`, `Introduced`, `Replaced`, `Switched`, or `Updated`.
- Keep each bullet concise and user-facing.
- Mention the outcome and scope in one sentence.
- Alphabetize the bullet list after drafting.
5. Add issue or PR links when applicable.
- Append a Markdown link to each bullet when applicable.
- Prefer PR links when work landed through a PR.
- Use issue links when no PR applies.
- Place the link at the end of the bullet and keep syntax consistent.
6. Pull from `tanaab-testing`, `tanaab-github-actions`, `tanaab-javascript`, `tanaab-shell`, or `tanaab-templates` when the release task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the release skill.
- [assets/tanaab-release-icon.png](./assets/tanaab-release-icon.png): UI icon for the release skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm release notes or changelog entries are concise and scoped to user-visible changes.
- Re-read final bullets for tense, clarity, and ordering.
- Confirm every applicable bullet has a valid link.
- Confirm any release gates or workflow changes are explicit.
- Confirm no publish, tag, or push action is taken unless the user asked for it.
