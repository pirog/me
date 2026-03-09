---
name: changelog-updates
description: Update CHANGELOG.md with a concise release summary since the last tagged release. Use when a user asks to write unreleased release notes, format each item as past-tense bullet points, alphabetize the list, and attach PR or issue links in Markdown.
---

# Changelog Updates

## Overview

Use this skill to create clean, reviewable changelog entries from git history with consistent style and linking.

## 1. Build the Change Set

1. Identify the last tag.
- Run `git describe --tags --abbrev=0`.
- If that fails, inspect tags with `git tag --sort=-creatordate`.

1. Gather the delta from the last tag to `HEAD`.
- Review commits with `git log --oneline <tag>..HEAD`.
- Review changed files with `git diff --name-status <tag>..HEAD`.

1. Group related work into concise user-facing changes.
- Merge low-level commits into meaningful release notes.
- Exclude noise that does not matter to users.

## 2. Write the Unreleased List

1. Target the top unreleased section in `CHANGELOG.md`.
- Keep existing templated header text intact when present.

1. Format every change as an unordered bullet using `-`.

1. Start each bullet with a past-tense verb.
- Examples: `Added`, `Converted`, `Fixed`, `Introduced`, `Replaced`, `Switched`, `Updated`.

1. Keep each bullet concise and helpful.
- Mention the outcome and scope in one sentence.

1. Alphabetize the entire bullet list.
- Sort lexicographically across all bullets after drafting.

## 3. Add Issue/PR Links

1. Append a Markdown link to each bullet when applicable.
- Format: `[#12](https://github.com/org/repo/pull/12)`.
- Prefer PR links when work landed through a PR.
- Use issue links when no PR applies.

1. Keep link style consistent.
- Place the link at the end of the bullet.
- Avoid malformed syntax such as `[#12)(...)`.

## 4. Validate Before Push

1. Re-read final bullets for tense, clarity, and ordering.
1. Confirm every applicable bullet has a valid link.
1. Leave changes unpushed unless the user explicitly asks to push.
