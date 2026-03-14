# README Standards

Use these rules when deciding how much user-facing documentation should live in `README.md` and when a repository should shift durable docs into a VitePress docs site.

## Goals

- Make the first screen of the README answer what the project is, who it is for, how to start, and where to go next.
- Keep `README.md` as the repository entrypoint rather than an unstructured dump of every detail.
- Choose one of three intentional README modes: full README, GitHub Action README, or docs wrapper.
- When a fuller docs site is needed, assume VitePress unless the repository already has another approved docs stack.

## Universal README Rules

- Lead with the project name and a one- or two-sentence description before support, changelog, or contributor sections.
- Put the primary install or usage path above deeper reference material.
- If the repo is primarily consumed through a hosted script URL, put that quickstart above local development or build steps.
- Keep section titles concrete and user-facing.
- Keep examples runnable and close to the surface they explain.
- Do not mirror an entire docs-site sidebar into the README. Link only the key destinations users actually need.
- Avoid empty sections, placeholder headings with no guidance, or generic link farms without context.
- Put support, changelog, maintainers, contributors, license, or policy links near the end unless the repository is itself a support or policy surface.
- When a README includes a `Contributors` section, use the standard `contrib.rocks` embed with the real repo slug instead of prose placeholders or manual contributor lists.

## README Modes

### Full README

Use the full README mode when the repository can realistically keep all user-facing documentation in one durable file without forcing readers to hunt through a long manual.

Use it when most of these are true:

- The repo has one primary audience or one narrow secondary audience.
- The main install or setup path is short.
- The common usage path fits in one README with a few examples.
- Configuration, environment variables, or command reference can stay concise.
- The repo does not need multiple durable guides, recipes, or separate reference pages.
- A complete README would still feel readable as one document.

Typical fit:

- internal tooling repos
- bootstrap or automation repos
- hosted bootstrap or raw-script repos
- small CLIs
- libraries with a narrow API surface

### GitHub Action README

Use the GitHub Action README mode when the repository's primary product is a GitHub Action that users consume through `uses:` or GitHub Marketplace.

Use it when most of these are true:

- The repo's main contract is defined by `action.yml`.
- Users need inputs, outputs, caveats, permissions, and usage examples directly in `README.md`.
- The action may have deeper guides later, but the Marketplace-facing README still needs to stand on its own.
- The action is a composite action or a JavaScript-backed action whose built runtime is committed to the repo.

Typical fit:

- standalone GitHub Actions
- Bun-backed JavaScript action repos
- composite actions

### Docs Wrapper README

Use the docs wrapper mode when the repo still needs a strong README entrypoint, but durable docs should live in a VitePress docs site.

Use it when any of these are true:

- The repository needs multiple durable guides or tutorials.
- The audience splits across different user journeys such as install, operate, configure, extend, or contribute.
- Reference material is large enough that it wants separate pages.
- The README would need repeated cross-linking, long subsections, or many top-level sections to stay complete.
- The repo already has or should have a VitePress docs site.

Typical fit:

- platform or product repos
- plugin ecosystems
- framework or app-template repos
- repos with long configuration or recipes sections

## Decision Rule

Use the full README template unless the repo is primarily a GitHub Action or clearly benefits from a docs site.

Choose the GitHub Action README template when the repository's primary artifact is a GitHub Action.

- Keep the action contract in `README.md` even if the repo later grows a VitePress docs site.
- Use the README to document inputs, outputs, caveats, and the minimum viable usage path users need to copy into workflows.
- Add docs-site links only as a supplement to that contract, not as a replacement.

Choose the docs wrapper template when one or more of the following is true:

- you already expect a VitePress docs site
- the README would need more than one durable usage guide
- the config, reference, or recipes section would become the dominant part of the README
- different audiences need different paths through the docs
- the README starts feeling like a homepage plus manual plus reference all at once

If the decision is close, start with the full README and graduate to the docs wrapper only when the README begins to accumulate repeated cross-links, long advanced sections, or multiple navigation layers.

## Section Expectations

### Full README

Recommended order:

1. Title and concise summary
2. Optional status or compatibility note
3. Quickstart or primary usage
4. Installation or setup
5. Usage
6. Configuration or environment variables when relevant
7. Advanced usage only when needed
8. Development for contributors
9. Support
10. Changelog
11. Maintainers or contributors or selected resources

### Docs Wrapper README

Recommended order:

1. Title and concise summary
2. Optional status or compatibility note
3. Quickstart or installation path
4. Documentation section with a strong docs-site link
5. Short docs map with the key routes only
6. Development for contributors when needed
7. Support
8. Changelog
9. Maintainers or contributors or selected resources

### GitHub Action README

Recommended order:

1. Title and concise summary
2. Optional status or compatibility note
3. Inputs
4. Outputs only when the action actually sets them
5. Caveats or permissions
6. Basic usage
7. Advanced usage
8. Optional documentation links for deeper guides
9. Development or local testing
10. Changelog
11. Releasing
12. Maintainers or contributors or selected resources

## VitePress Wrapper Guidance

When the docs wrapper mode is used:

- Keep the README short and directional.
- Include one strong docs-site link near the top.
- Link the key routes users need, such as getting started, configuration, recipes, plugin authoring, or API reference.
- Do not duplicate large reference tables or deep configuration docs from the VitePress site back into the README.
- Keep repo-contributor concerns such as local development, lint, test, and release notes in the README if they are repo-specific and do not belong in end-user docs.
- Do not use the docs-wrapper mode as the primary README shape for GitHub Action repos. Those repos still need inputs, outputs, caveats, and usage in the README even if they also have a docs site.

## Hosted Script README Guidance

When the repo is primarily consumed through a URL-served shell script:

- Lead with the hosted quickstart such as `curl -fsSL ... | bash` when that is the main user path.
- Explain how the hosted URL maps to the generated `dist/` entrypoint so the public surface is not mysterious.
- Keep local installation or reusable `PATH` setup as a secondary path after the hosted quickstart.
- Keep development, build, and deploy details separate from the user-facing install and usage flow.
- Document automation env vars or guardrails only when they are part of the actual user contract.

## Anti-Patterns

- Starting with support, legal, or contributor sections before explaining the project.
- Using a thin docs-wrapper README for a GitHub Action and forcing users to leave the Marketplace or repo page before they can see inputs and usage.
- Leading with local `bun install` or build steps in a repo whose real user entrypoint is a hosted script URL.
- Keeping a README-only structure after the docs have clearly outgrown one file.
- Creating a docs wrapper that is so thin it omits the basic install or quickstart path.
- Dumping every docs-site page into the README as a long navigation list.
- Splitting into a docs site for polish alone when the README is still sufficient.
