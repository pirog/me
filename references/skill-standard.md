# Skill Standard

## Validation Contract

Use this file as the source of truth for canon skill validation.

- `[error]` means the skill should fail validation.
- `[warn]` means the skill is probably shaped poorly and should be reviewed.
- `[manual]` means a human should judge the rule because it is not fully machine-checkable.

## Identity and Naming

- `[error]` Canonical type-specific authoring and validation behavior comes from the full templates owned by `piro-skill-author`.
- `[error]` Frontmatter `metadata.owner` must exist and must equal `pirog`.
- `[error]` Frontmatter `metadata.type` must be one of the type ids defined by those canonical templates.
- `[error]` Frontmatter `metadata.type` must equal the selected or asserted type id when one is provided.
- `[error]` The generated machine id must use lowercase letters, digits, and hyphens only.
- `[error]` Frontmatter `name` must equal the generated machine id exactly.
- `[error]` Frontmatter `name` must start with `piro-`.
- `[error]` Outside a larger Codex plugin, the skill folder name must equal the generated machine id.
- `[error]` Inside a larger Codex plugin, the skill folder name must equal the generated machine id with the leading `piro-` machine prefix removed.
- `[error]` Strip an accidental duplicate `piro-` prefix before writing the final machine id.

## Required Files

```text
skill-folder/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── bin/           # optional public skill-owned commands
├── lib/           # optional orchestration and stateful implementation
├── scripts/       # optional internal operational commands
├── utils/         # optional independently testable units
├── test/          # optional flat skill-owned tests and support
├── templates/     # optional, only when unique to this skill
├── assets/        # optional, only when unique to this skill
└── references/    # optional, only when unique to this skill
```

- In plugin-contained skill trees, `skill-folder/` is the unprefixed surface id while frontmatter `name` remains the full `piro-` machine id.

- `[error]` `SKILL.md` must exist.
- `[error]` `agents/openai.yaml` must exist.
- `[warn]` Create optional resource directories only when the skill actually needs them.
- `[warn]` Do not add auxiliary repo-style docs inside a skill such as `README.md`, `CHANGELOG.md`, or installation guides unless a runtime requires them.

## Required SKILL.md Shape

- `[error]` `SKILL.md` must start with YAML frontmatter.
- `[error]` Frontmatter must contain `name`, `description`, `license`, and `metadata`.
- `[error]` Frontmatter `license` must equal `MIT`.
- `[error]` Frontmatter `metadata` must contain `type`, `owner`, `tags`, and `openclaw`.
- `[error]` Do not use top-level `type`, `owner`, or `tags`; Codex warns on unsupported top-level skill attributes.
- `[error]` Frontmatter `description` must start with `Pirobased`.
- `[error]` `metadata.tags` must be a list of strings.
- `[error]` `metadata.tags` must include the selected `owner` and `type`.
- `[error]` `metadata.tags` must include at least one additional kebab-case category tag beyond `owner` and `type`.
- `[error]` Section order must match the selected type's canonical template order.
- `[error]` Optional top-level sections declared by the canonical template may be omitted, but if present they must appear in the template's declared order.
- `[error]` `coding` skills must include the canonical `Documentation`, `Testing`, and `GitHub Actions Workflow` lifecycle sections in template order.
- `[error]` Relative links in `SKILL.md` must resolve.
- `[manual]` `description` should say both what the skill does and when to use it.
- `[manual]` `When to Use` and `When Not to Use` should describe a narrow, concrete owned surface.
- `[warn]` Keep `metadata.tags` short. Prefer one category tag by default instead of a long keyword list.

## Workflow Facets

- `[error]` Canonical full templates must declare `## Optimization` as an optional top-level heading and include the type-shaped section in canonical order.
- `[manual]` Treat a workflow facet as a reusable path through one owned surface; keep domain-appropriate mode, lifecycle, and variant language instead of forcing one label onto every skill.
- `[manual]` Retain and tailor `## Optimization` when the skill can audit an existing persistent surface against durable canon.
- `[manual]` Remove `## Optimization` deliberately for incident-specific, event-specific, or execution-only workflows where persistent alignment is not owned.
- `[manual]` Apply the shared operations from [`./optimization-operations.md`](./optimization-operations.md) as evidence-led lenses rather than mandatory output fields.
- `[manual]` For a repository-local skill collection, review both each skill and the portfolio for contradictions, duplicated doctrine, fragmented variants, unclear ownership, and mega-skill behavior.

## Required OpenClaw Metadata

- `[error]` Frontmatter `metadata.openclaw` must be a mapping.
- `[error]` `metadata.openclaw.emoji` must be a non-empty string.
- `[error]` Optional `metadata.openclaw.homepage` must be an HTTP(S) URL.
- `[error]` Optional `metadata.openclaw.os` must be a non-empty list containing only `darwin`, `linux`, or `win32`.
- `[error]` Optional `metadata.openclaw.always` must be a boolean.
- `[error]` Optional `metadata.openclaw.primaryEnv` must be a non-empty string.
- `[error]` Optional `metadata.openclaw.requires` must be a mapping. Its `bins`, `anyBins`, `env`, and `config` fields must be non-empty string lists when present.
- `[error]` Optional `metadata.openclaw.install` must be a non-empty list.
- `[warn]` Add `metadata.openclaw.homepage` when the skill has a stable public URL.
- `[manual]` Add OpenClaw OS, binary, environment, config, and installer gates only for real runtime requirements of the skill.
- `[manual]` Do not add `requires.bins: [bun]` merely because `piro-skill-author` uses Bun to scaffold or validate the skill.

## Required OpenAI Metadata

- `[error]` `agents/openai.yaml` must contain `interface.display_name`, `interface.short_description`, `interface.default_prompt`, and `interface.brand_color`.
- `[error]` `agents/openai.yaml` must contain `interface.icon_small` and `interface.icon_large`.
- `[error]` `interface.short_description` must start with `Pirobased`.
- `[error]` `interface.icon_small` and `interface.icon_large` must point to existing relative skill asset paths.
- `[error]` `interface.default_prompt` should explicitly mention the skill by `$<machine-id>`.
- `[error]` `interface.brand_color` must equal `#db2777`.
- `[error]` Optional `policy.allow_implicit_invocation` must be a boolean when present.
- `[error]` Optional `dependencies.tools` entries must declare at least `type` and `value` when present.
- `[warn]` `display_name` should be unprefixed by default unless the user explicitly wants `Pirog` in the human-facing title.
- `[manual]` After the `Pirobased` prefix, `short_description` should describe the skill outcome.
- `[manual]` Use `policy.allow_implicit_invocation: false` only when a skill should require explicit `$<machine-id>` invocation.
- `[manual]` Use `dependencies.tools` only for real tool dependencies that improve execution, such as an MCP server the skill directly needs.

## Resource Placement Rules

- `[error]` Start every skill from the canonical full type template owned by `piro-skill-author`.
- `[error]` Type-specific authoring and validation behavior must come from those canonical templates rather than ad hoc parallel registries.
- `[error]` Use the shared Pirog owner contract from this standard and the validator. Do not load owner behavior from a separate owner-data folder.
- `[error]` Use kebab-case for repo-authored helper filenames in `bin/`, `lib/`, `scripts/`, `utils/`, `test/`, `assets/`, `references/`, `prompts/`, and `templates/` unless a tool requires a fixed conventional filename.
- `[error]` `scripts/` is code-only. Do not store static registry data there as JS object literals.
- `[error]` Repo-level operational script filenames must end in `-cli.js` or `-task.js`; import-only modules belong in `lib/` or `utils/` instead of using a `-lib.js` suffix under `scripts/`.
- `[warn]` Keep support material local to the owning skill by default.
- `[warn]` Hoist support material to repo root only on proven reuse across live surfaces, repo-wide contract or tooling status, or standalone human value.
- `[warn]` Machine-readable data should live with the smallest justified owner. Hoist it into repo-root `references/` only when multiple live consumers or independent human value justify it.
- `[error]` Bundleable repo scripts must import shared templates, assets, and machine-readable canon explicitly so `bun build` can follow the dependency graph.
- `[warn]` Keep the default scaffold minimal.
- `[warn]` Organize skill-owned JavaScript by role at the skill root: public commands in `bin/`, internal commands in `scripts/`, orchestration in `lib/`, independently testable units in `utils/`, and tests in `test/`.
- `[warn]` Keep skill-owned `test/` directories flat by default, with specs, fixtures, fakes, and support JavaScript as siblings.
- `[warn]` Do not treat skill-local `bin/` commands as repo-level package entrypoints unless the package intentionally publishes them.
- `[warn]` Shebang-bearing skill-local scripts and executable starter templates should be committed executable.
- `[warn]` Do not mark repo-authored files executable unless they actually start with a shebang.
- `[warn]` If a skill bundles `references/repo-agents-lines.md`, keep it to durable ambient repo rules rather than conditional workflow steps.
- `[warn]` `generic` is the fallback type. Prefer a narrower type when one clearly fits.
- `[warn]` Additional skill types should add a new canonical full template under `piro-skill-author` instead of inventing an unrelated structure without a strong reason.
- `[manual]` Check whether each new or retained hoisted file still passes the hoist test instead of merely reflecting historical placement.

## Scope and Size Rules

- `[warn]` A skill should own one concrete task surface.
- `[warn]` Prefer a repo template over a live skill when the reusable artifact is a whole starter repository with committed structure, scripts, examples, and docs that users should adopt wholesale.
- `[warn]` For `coding` skills, broad discovery language is acceptable only when it still funnels into one dominant implementation pattern.
- `[warn]` For `coding` skills, multiple materially different documentation, direct-test, or GitHub Actions workflow mechanisms are a split signal unless they are minor flavor variations of one pattern.
- `[warn]` If a skill needs a routing matrix, broad arbitration rules, or heavy relationship language to stay understandable, split it.
- `[warn]` Do not add `## Relationship to Other Skills` by default. If a skill needs that section to make sense, challenge the scope first.
- `[warn]` Keep `SKILL.md` lean. Assume the agent is already capable and add only task-specific context that materially improves performance.
- `[warn]` Prefer references for detailed facts, schemas, and long examples instead of stuffing them into `SKILL.md`.
- `[warn]` Prefer scripts when deterministic reliability matters or the same code keeps being rewritten.
- `[warn]` Keep bundled references one hop from `SKILL.md`; link to them directly instead of hiding them behind deeper navigation.
- `[manual]` For `coding` skills, `Documentation`, `Testing`, and `GitHub Actions Workflow` should each describe one canonical mechanism and one minimal example when an example materially shapes the skill.
- `[manual]` Check whether the skill mostly restates one repo template's structure, scripts, examples, and docs; if so, prefer the template as source of truth and keep only a thin discovery or adaptation skill if needed.
- `[manual]` Check shebang and executable-bit alignment for skill-local `scripts/`, starter templates, and any `bin/` surfaces.
- `[manual]` Optional `references/repo-agents-lines.md` should stay short, copyable, and scoped to always-on repo policy that should influence many tasks.
- `[manual]` Hoisting decisions should be reviewed as placement choices, not assumed to be improvements.
- `[manual]` Check that skill-owned code and tests live at their nearest owner and that public or internal commands remain thin over importable implementation.
- `[manual]` Bulk standardization should preserve the skill's core purpose and workflow unless the task explicitly asks for a behavioral rewrite.
- `[manual]` When `Optimization` is present, check that it names the owned surface's highest-value compliance checks and routes into the full relevant contract instead of leaving generic boilerplate.
