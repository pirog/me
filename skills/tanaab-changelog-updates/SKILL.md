---
name: tanaab-changelog-updates
description: Update CHANGELOG.md with a concise release summary since the last tagged release. Use when a user asks to write unreleased release notes, format each item as past-tense bullet points, alphabetize the list, and attach PR or issue links in Markdown.
---

# Changelog Updates

## Overview

Use this skill to create clean, reviewable changelog entries from git history with consistent style and linking.

## When to Use

- Draft unreleased changelog entries from git history.
- Rewrite raw commit history into concise user-facing release notes.
- Add consistent PR or issue links to changelog bullets.

## Workflow

1. Build the change set.
- Run `git describe --tags --abbrev=0`.
- If that fails, inspect tags with `git tag --sort=-creatordate`.
- Review commits with `git log --oneline <tag>..HEAD`.
- Review changed files with `git diff --name-status <tag>..HEAD`.
- Merge low-level commits into meaningful release notes.
- Exclude noise that does not matter to users.

2. Write the unreleased section.
- Target the top unreleased section in `CHANGELOG.md`.
- Keep existing templated header text intact when present.
- Format every change as an unordered bullet using `-`.
- Start each bullet with a past-tense verb.
- Examples: `Added`, `Converted`, `Fixed`, `Introduced`, `Replaced`, `Switched`, `Updated`.
- Keep each bullet concise and helpful.
- Mention the outcome and scope in one sentence.
- Alphabetize the entire bullet list.
- Sort lexicographically across all bullets after drafting.

3. Add issue or PR links.
- Append a Markdown link to each bullet when applicable.
- Format: `[#12](https://github.com/org/repo/pull/12)`.
- Prefer PR links when work landed through a PR.
- Use issue links when no PR applies.
- Keep link style consistent.
- Place the link at the end of the bullet.
- Avoid malformed syntax such as `[#12)(...)`.

## Bundled Resources

- No bundled scripts. Build the changelog directly from local git history and repository context.

## Validation

- Re-read final bullets for tense, clarity, and ordering.
- Confirm every applicable bullet has a valid link.
- Leave changes unpushed unless the user explicitly asks to push.
