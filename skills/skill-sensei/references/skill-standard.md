# Branded Skill Standard

## Machine Ids

- `piro-<slug>` for Pirog skills
- `tanaab-<slug>` for Tanaab skills
- Use lowercase letters, digits, and hyphens only
- Strip an accidental duplicate prefix before writing the final id

## Display Metadata

- `display_name` stays unprefixed
- `short_description` should describe the skill outcome, not the brand
- `default_prompt` should mention the skill by machine id when helpful

## Required Files

```text
skill-id/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── assets/        # optional but recommended when an icon exists
├── references/    # optional
└── scripts/       # optional
```

## Required SKILL.md Shape

Every branded skill should use this section order:

1. YAML frontmatter with `name` and `description`
2. `# <Display Name>`
3. `## Overview`
4. `## When to Use`
5. `## Workflow`
6. `## Bundled Resources`
7. `## Validation`

## Standardization Rules

- Rename the folder to the branded machine id.
- Set frontmatter `name` to the folder name exactly.
- Preserve the skill's core purpose and workflow unless the user asks for a behavioral rewrite.
- Normalize headings and section order to this standard.
- Update `agents/openai.yaml` so `display_name` is unprefixed and icon paths still resolve.
- Preserve existing icons when they are already relevant, then add the correct brand watermark when assets are available.
- When standardizing the entire `skills/` folder, always skip `skills/skill-sensei` so the meta-skill is not rewritten as part of its own pass.

## Prompting Rules

Ask only when the missing value changes identity or behavior:

- brand
- new vs standardize mode
- skill purpose
- source skill path when standardizing

Do not ask for an icon by default. Use the icon fallback policy instead.
