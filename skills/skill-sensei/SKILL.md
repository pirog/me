---
name: skill-sensei
description: Create, standardize, audit, and optimize pirog and tanaab skills or skill stacks. Use when a user asks to create a pirog skill, create a tanaab skill, standardize a skill as pirog, standardize a skill as tanaab, audit a skill stack, reduce duplication across a stack, propose mergers or deletions, apply prefixed machine ids, unify skill markdown structure, or assign default branded skill icons and watermarks.
---

# Skill Sensei

## Overview

Use this skill to create, standardize, audit, or optimize branded skills under one shared format.

- Use `piro-<slug>` for Pirog machine ids.
- Use `tanaab-<slug>` for Tanaab machine ids.
- Keep human-facing names unprefixed.
- Default to `merge`, `move`, or `delete` before `add` when optimizing a skill stack.

Read [references/skill-standard.md](./references/skill-standard.md) for the required layout, [references/brand-profiles.md](./references/brand-profiles.md) for brand-specific rules, and [references/stack-optimization.md](./references/stack-optimization.md) for stack-audit and optimization rules.

## When to Use

- Create a new Pirog skill.
- Create a new Tanaab skill.
- Standardize an existing skill as `piro`.
- Standardize an existing skill as `tanaab`.
- Audit a stack such as `tanaab-coding` for duplication, overlap, routing ambiguity, and cross-skill inconsistencies.
- Propose or apply mergers, deletions, template extraction, or doctrine consolidation across a stack.
- Normalize `SKILL.md`, `agents/openai.yaml`, or icon handling across branded skills.

## When Not to Use

- Do not use this skill for one-off repository edits that do not change skill structure, naming, or branding.
- Do not use this skill to author reusable content templates themselves when `tanaab-templates` is the more direct fit.

## Relationship to Other Skills

- Use this skill to define the branded wrapper and structural standard for other skills.
- Pair it with `tanaab-templates` when a skill needs reusable prompt, document, or file templates under `templates/`.
- Pair it with a stack router such as `tanaab-coding` when auditing or optimizing how a skill stack is partitioned.

## Workflow

1. Determine the target and mode.

- Infer the brand when the request says `pirog` or `tanaab`.
- Choose `create`, `standardize`, `stack-audit`, or `stack-optimize` mode before making edits.
- If standardizing, locate the existing skill folder first.
- If auditing or optimizing a stack, inventory the target stack first.
- If the request targets the whole `skills/` tree, always exclude `skills/skill-sensei` from the pass.
- Treat `skills/skill-sensei` as protected during bulk updates. Do not rewrite its metadata, descriptions, icons, or naming as part of broad repo-wide changes.
- Ask only for missing inputs that change identity or behavior. Do not ask for an icon unless the user explicitly wants to override the default.

2. For `create` or `standardize`, apply the shared skill standard.

- Use the prefixed machine id from the selected brand profile.
- Keep `display_name` unprefixed unless the user explicitly wants the brand in the human-facing title.
- Normalize `SKILL.md` to the required section order from [references/skill-standard.md](./references/skill-standard.md).
- Ensure the scaffold includes `## When Not to Use` and `## Relationship to Other Skills`.

3. For `create` or `standardize`, handle icons by default.

- If standardizing a skill with an existing icon, preserve the base icon and add the correct brand watermark when watermark assets are available.
- If creating a new skill without an icon, first try to reuse a local icon that clearly matches the skill domain.
- For new Tanaab icons, prefer lighter source artwork so the icon remains legible against the dark Tanaab watermark treatment.
- If no good icon exists, generate a branded fallback icon instead of blocking on user input.
- Use [scripts/compose-skill-icon.js](./scripts/compose-skill-icon.js) to clip watermark images into circular lower-right badges.

4. For `create` or `standardize`, scaffold or normalize files.

- For new skills, prefer [scripts/init-branded-skill.js](./scripts/init-branded-skill.js) to create the folder, `SKILL.md`, `agents/openai.yaml`, and a fallback icon.
- For existing skills, update the folder name, `SKILL.md` frontmatter, display metadata, and icon paths in place.
- Treat `templates/` as optional. Only create or reference it when the skill actually ships reusable template files.

5. For `stack-audit` or `stack-optimize`, audit before adding.

- Use [references/stack-optimization.md](./references/stack-optimization.md) to classify each skill's owned surface, duplicated doctrine, routing overlap, template candidates, and cross-skill inconsistencies in ownership, terminology, examples, or validation guidance.
- Default to `keep`, `merge into`, `move to core`, `move to router`, `extract to templates`, or `delete`.
- Do not propose a new skill if the content can live in `tanaab-coding-core`, the stack router, an existing specialized skill, or `tanaab-templates`.
- Flag skills that have weak ownership, mostly duplicated policy, mostly cross-references, or no concrete reusable assets.
- Produce a keep/merge/delete plan and explicit inconsistency findings before making structural edits.

6. For `stack-optimize`, apply the approved consolidation.

- Merge duplicated guidance upward into shared doctrine or routing when possible.
- Merge thin skills into the nearest surviving owner instead of preserving parallel surfaces.
- Delete obsolete or empty skills after their useful content has been moved.
- Update router docs, relationships, references, templates, and icons so the surviving stack is coherent.

7. Sync stow-managed skill targets after changes.

- Run [scripts/sync-ai-stow.js](./scripts/sync-ai-stow.js) after creating, renaming, consolidating, or deleting skills when the repo is stowed into `~/.codex` or `~/.openclaw`.
- Use the default target to refresh the live `~/.codex/skills` and `~/.openclaw/skills` pointers.
- Use `--simulate` first when you only need to inspect what `stow --restow ai` would change.
- Let the sync step prune dangling skill links left behind by removed or renamed skills.

8. Validate before finishing.

- Run [scripts/validate-branded-skill.js](./scripts/validate-branded-skill.js) against each branded skill you create or modify.
- When auditing or optimizing a stack, confirm every retained skill has a distinct primary owned surface and a clear reason to exist.
- Call out missing watermark assets or any places where a generic fallback icon was used.
- Confirm the stow sync completed or note that live target updates were intentionally skipped.

## Bundled Resources

- [references/skill-standard.md](./references/skill-standard.md): required file layout, naming rules, and markdown sections
- [references/brand-profiles.md](./references/brand-profiles.md): brand metadata, prefixes, colors, and watermark asset names
- [references/icon-policy.md](./references/icon-policy.md): default icon selection and watermark input requirements
- [references/stack-optimization.md](./references/stack-optimization.md): audit rubric for reducing duplication, overlap, and ambiguity across a skill stack
- [scripts/init-branded-skill.js](./scripts/init-branded-skill.js): deterministic scaffolder for new branded skills
- [scripts/sync-ai-stow.js](./scripts/sync-ai-stow.js): restows the `ai` dot package and prunes dangling skill links in live targets
- [scripts/validate-branded-skill.js](./scripts/validate-branded-skill.js): lightweight validator for branded skill folders
- [scripts/compose-skill-icon.js](./scripts/compose-skill-icon.js): SVG compositor for watermark badges

## Validation

- Confirm the folder name and frontmatter `name` match the prefixed machine id.
- Confirm `agents/openai.yaml` uses an unprefixed `display_name`.
- Confirm the icon either preserves a relevant base asset or uses the generated fallback.
- Confirm the watermark brand matches the chosen profile when watermark assets are available.
- Confirm stack audits identify `keep`, `merge`, `move`, `extract`, or `delete` outcomes instead of drifting into vague commentary.
- Confirm stack audits explicitly call out cross-skill inconsistencies when ownership language, doctrine, terminology, examples, or validation rules diverge across the stack.
- Confirm stack optimizations reduce duplication or ambiguity rather than adding new surface area by default.
- Confirm `~/.codex/skills` and `~/.openclaw/skills` were resynced when the change was meant to affect live skill availability.
