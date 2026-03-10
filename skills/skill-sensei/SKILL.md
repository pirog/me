---
name: skill-sensei
description: Create new pirog and tanaab skills, or standardize existing skills into the branded format. Use when a user asks to create a pirog skill, create a tanaab skill, standardize a skill as pirog, standardize a skill as tanaab, apply prefixed machine ids, unify skill markdown structure, or assign default branded skill icons and watermarks.
---

# Skill Sensei

## Overview

Use this skill to create or standardize branded skills under one shared format.

- Use `piro-<slug>` for Pirog machine ids.
- Use `tanaab-<slug>` for Tanaab machine ids.
- Keep human-facing names unprefixed.

Read [references/skill-standard.md](./references/skill-standard.md) for the required layout and [references/brand-profiles.md](./references/brand-profiles.md) for brand-specific rules.

## When to Use

- Create a new Pirog skill.
- Create a new Tanaab skill.
- Standardize an existing skill as `piro`.
- Standardize an existing skill as `tanaab`.
- Normalize `SKILL.md`, `agents/openai.yaml`, or icon handling across branded skills.

## Workflow

1. Determine the brand, mode, slug, display name, and purpose.

- Infer the brand when the request says `pirog` or `tanaab`.
- If standardizing, locate the existing skill folder first.
- If the request targets the whole `skills/` tree, always exclude `skills/skill-sensei` from the standardization pass.
- Ask only for missing inputs that change identity or behavior. Do not ask for an icon unless the user explicitly wants to override the default.

2. Apply the shared skill standard.

- Use the prefixed machine id from the selected brand profile.
- Keep `display_name` unprefixed.
- Normalize `SKILL.md` to the required section order from [references/skill-standard.md](./references/skill-standard.md).

3. Handle icons by default.

- If standardizing a skill with an existing icon, preserve the base icon and add the correct brand watermark when watermark assets are available.
- If creating a new skill without an icon, first try to reuse a local icon that clearly matches the skill domain.
- For new Tanaab icons, prefer lighter source artwork so the icon remains legible against the dark Tanaab watermark treatment.
- If no good icon exists, generate a branded fallback icon instead of blocking on user input.
- Use [scripts/compose_skill_icon.js](./scripts/compose_skill_icon.js) to clip watermark images into circular lower-right badges.
- Use [scripts/generate_test_watermarks.js](./scripts/generate_test_watermarks.js) when you need a piro/tanaab watermark QA set for every skill in `skills/`.

4. Scaffold or normalize files.

- For new skills, prefer [scripts/init_branded_skill.js](./scripts/init_branded_skill.js) to create the folder, `SKILL.md`, `agents/openai.yaml`, and a fallback icon.
- For existing skills, update the folder name, `SKILL.md` frontmatter, display metadata, and icon paths in place.

5. Sync stow-managed skill targets after changes.

- Run [scripts/sync_ai_stow.js](./scripts/sync_ai_stow.js) after creating, renaming, consolidating, or deleting skills when the repo is stowed into `~/.codex` or `~/.openclaw`.
- Use the default target to refresh the live `~/.codex/skills` and `~/.openclaw/skills` pointers.
- Use `--simulate` first when you only need to inspect what `stow --restow ai` would change.
- Let the sync step prune dangling skill links left behind by removed or renamed skills.

6. Validate before finishing.

- Run [scripts/validate_branded_skill.js](./scripts/validate_branded_skill.js) against each branded skill you create or modify.
- Call out missing watermark assets or any places where a generic fallback icon was used.
- Confirm the stow sync completed or note that live target updates were intentionally skipped.

## Bundled Resources

- [references/skill-standard.md](./references/skill-standard.md): required file layout, naming rules, and markdown sections
- [references/brand-profiles.md](./references/brand-profiles.md): brand metadata, prefixes, colors, and watermark asset names
- [references/icon-policy.md](./references/icon-policy.md): default icon selection and watermark input requirements
- [scripts/init_branded_skill.js](./scripts/init_branded_skill.js): deterministic scaffolder for new branded skills
- [scripts/generate_test_watermarks.js](./scripts/generate_test_watermarks.js): bulk-generates watermark test comps for every skill icon
- [scripts/sync_ai_stow.js](./scripts/sync_ai_stow.js): restows the `ai` dot package and prunes dangling skill links in live targets
- [scripts/validate_branded_skill.js](./scripts/validate_branded_skill.js): lightweight validator for branded skill folders
- [scripts/compose_skill_icon.js](./scripts/compose_skill_icon.js): SVG compositor for watermark badges

## Validation

- Confirm the folder name and frontmatter `name` match the prefixed machine id.
- Confirm `agents/openai.yaml` uses an unprefixed `display_name`.
- Confirm the icon either preserves a relevant base asset or uses the generated fallback.
- Confirm the watermark brand matches the chosen profile when watermark assets are available.
- Confirm `~/.codex/skills` and `~/.openclaw/skills` were resynced when the change was meant to affect live skill availability.
