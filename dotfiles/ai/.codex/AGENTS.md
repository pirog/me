# Repo Agent Guidance

## Technical Stance

- Do not agree by default. Evaluate the user's proposal against the repo's architecture, tooling, and existing doctrine before endorsing it.
- If a stronger approach exists, recommend it directly and explain the tradeoff briefly before implementing.
- Prefer technically defensible decisions over conversational alignment.
- When multiple valid approaches exist, recommend one default instead of presenting every option as equally good.
- If the user explicitly chooses a weaker option after the tradeoff is clear, note the downside once and proceed without repeating the warning.
- Avoid empty agreement language unless it is followed by a concrete technical reason.

## Skill Routing

- If the user names a skill or the task clearly matches one, use it.
- If the right coding owner is not obvious, use [$tanaab-coding](/Users/pirog/tanaab/me/skills/tanaab-coding/SKILL.md) to pick one primary owner and always apply [$tanaab-coding-core](/Users/pirog/tanaab/me/skills/tanaab-coding-core/SKILL.md).
- Once routing is clear, work mainly from the owning skill instead of loading every related skill.
- If two skills overlap or disagree, call out the conflict explicitly and choose the owner described by [routing-matrix.md](/Users/pirog/tanaab/me/skills/tanaab-coding/references/routing-matrix.md).
- When [$tanaab-coding](/Users/pirog/tanaab/me/skills/tanaab-coding/SKILL.md) is active, explicitly decide whether [$tanaab-templates](/Users/pirog/tanaab/me/skills/tanaab-templates/SKILL.md) should be a companion skill.
- Do not pull in [$tanaab-templates](/Users/pirog/tanaab/me/skills/tanaab-templates/SKILL.md) unless the task actually benefits from a reusable scaffold, starter, or extracted fragment.

## Commentary Expectations

- In progress updates, state the active primary owner and any companion skills when [$tanaab-coding](/Users/pirog/tanaab/me/skills/tanaab-coding/SKILL.md) is involved.
- If a relevant template, snippet, or scaffold was considered, say whether it was used or skipped and give the reason in one sentence.
- If a template match exists and was adopted, say that it was preferred over inventing a new implementation shape.
- If an obvious skill or template was not used, say why not.
- If [$tanaab-coding](/Users/pirog/tanaab/me/skills/tanaab-coding/SKILL.md) was relevant to routing, say whether it was used and why.
- Surface decisions and tradeoffs in commentary, not hidden chain-of-thought. Keep updates concrete and operational.
- When validation is skipped, say what was skipped and why.

## Template Discipline

- Before inventing a new scaffold, starter, boilerplate file, or reusable implementation shape, inspect [$tanaab-templates](/Users/pirog/tanaab/me/skills/tanaab-templates/SKILL.md).
- Check for an existing template before inventing new scaffolding.
- Reuse and adapt the closest matching template when it actually fits the task.
- If a suitable template exists, prefer adapting it over creating a new implementation shape from scratch.
- If no template fits, call out the gap explicitly instead of silently improvising a new standard.
- Do not force a full template into skill-local helper scripts or one-off code when a lighter local pattern is more appropriate.
- Do not force template lookup for narrow bug fixes or small edits to existing repo-local code that clearly do not need reusable structure.

## Change Discipline

- Keep diffs as small as possible while still solving the actual problem.
- Do not expand scope unless the newly included work is clearly coupled to the requested change.
- Prefer moving duplicated doctrine upward into shared guidance or templates rather than repeating it in multiple places.
- Flag repo drift, unclear ownership, or duplicated standards when they materially affect the task.

## Validation Discipline

- Run the narrowest reliable checks first, then broaden only when risk justifies it.
- For shell changes, prefer targeted `shellcheck` when shell is a maintained surface.
- For JS or Bun changes, prefer the repo's standard lint, format, build, and focused test commands.
- If a repo standard cannot run, say so plainly and report the closest successful validation.

## Context Hygiene

- Read only the parts of a skill, reference, or template that are needed for the current task.
- Prefer shipped scripts, references, and templates over re-deriving large blocks of guidance from memory.
- Keep commentary concise, but include routing, template, and validation decisions whenever they materially affect the work.
