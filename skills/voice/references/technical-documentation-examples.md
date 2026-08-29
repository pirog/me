# Technical Documentation Evaluation Examples

## Status

`Evaluation only`. These edited pirog examples are retained as a controlled comparison condition.
Do not load them during ordinary drafting. Move an example into runtime guidance only when a
repeatable ablation shows that the author anchor and media adapter fail to produce a required
behavior without it.

The excerpts retain the useful voice and structure of selected public passages while fixing obvious
grammar, trimming product-specific detail, and omitting material that does not help comparison. They
contain no private subject matter.

## 1. Make the caveat honest, then make it usable

> ::: warning Not for the faint of heart!
> Lando is basically a PaaS running on your computer, so we don't recommend it
> [unless you've got power](https://www.youtube.com/watch?v=NowdrL6fvb4).
> :::
>
> ### Minimum requirements
>
> You _can_ run Lando with the following, but your experience may be less than ideal.
>
> - ARM64 or x64 processor with 2+ cores
> - 4GB+ RAM
> - 25GB+ of available disk space
>
> You _likely_ can run Lando on other processor architectures if you install from source, but this
> is not tested or supported.

This works because the playful warning is followed by exact thresholds and calibrated support
language. Do not turn every limitation into an all-caps gag or soften an unsupported configuration
into a vague maybe.

Source: [Lando hardware requirements][requirements-source].

## 2. Let the reference introduce the escape hatch

> ### Using Dockerfiles
>
> If your build steps are approaching the length of Herman Melville's seminal work
> [_Moby Dick_](https://www.youtube.com/watch?v=zg84olIrn-k), use `overrides` to build directly from
> a Dockerfile instead.
>
> This keeps your Landofile tidy and has the added benefit of making your service shippable like any
> Dockerfile.
>
> The following example extends the base `php` image to add another extension.

The joke names the problem, the same sentence gives the workaround, and the next two sentences
explain why and tee up the code. Do not drop a reference between the reader and the answer.

Source: [Lando Dockerfile guidance][dockerfile-source].

## 3. Use a list only when the reader has real choices

> Guides are how-tos or tutorials that fit somewhere between technical documentation and blog
> posts. They generally answer a single question such as "How do I create a guide using this theme?"
> and are heavy on code snippets.
>
> In this case there are two ways to create a guide:
>
> - Autopopulate data from the `git log`.
> - Enter the data manually.
>
> You don't really have to do anything for the first option. Just commit this page and you will show
> up as a contributor. Check the contributor configuration if you want to augment the `git log`
> data.

The opening defines the artifact in reader terms, the two-item list exposes a genuine branch, and
the next paragraph answers the likely question directly. Do not manufacture a list when the prose
has only one path.

Source: [VitePress guide authoring][guide-source].

## 4. Be irreverent, then get down to business

> # Tagging shit
>
> There are a few tagging-related things in these docs, so this guide tries to
> [tie the room together](https://www.youtube.com/watch?v=_vGK008c_rA).
>
> ## What can I tag?
>
> Any collection-based content can be tagged through frontmatter, as shown below.
>
> ## What tags are available?
>
> By default you can "free tag," which means there is no centralized or finite set of acceptable
> tags. You can still customize their appearance, add an icon, or change the link for a specific
> tag.

The title and Big Lebowski nod establish the mood once; question headings and precise configuration
language do the actual teaching. Profanity is not a default. Use this edge only where the audience
and house style already make it feel native.

Source: [VitePress tagging guide][tagging-source].

## 5. Relax the frame without weakening the convention

> ## PR Conventions
>
> We are pretty [wild west](https://www.youtube.com/watch?v=_zXKtfKnfT8) on accepting PRs, but here
> are some good conventions that we def recommend:
>
> - Name branches like `ISSUE-NUMBER-BRIEF-DESCRIPTION`, for example `35-ssh-agent-feature`.
> - Name commits like `#ISSUE-NUMBER: description`, for example `#35: ensure socket is owned by you`.
> - Associate the relevant issues with the PR.
>
> GitHub can do some magic with the above and provide better context around commits, issues, PRs,
> and projects.

The loose opener lowers the temperature, but the conventions remain concrete and the closing tells
the reader why they matter. Do not confuse conversational framing with optional or ambiguous rules.

Source: [Lando PR conventions][conventions-source].

## Provenance and Editing Boundary

The selected material came from public technical documentation. Repository history attributes the
underlying lines to `Mike Pirog <mike@lando.dev>`, and GitHub maps the relevant commits to the
`pirog` account. Current-file blame alone was not accepted when a bulk migration obscured the
original author.

The excerpts may correct grammar, shorten context, and remove irrelevant product detail. They must
not acquire invented facts, private subject matter, untouched model prose, or jokes that were not
present in the selected evidence. Source quirks such as typos are not voice rules.

[requirements-source]: https://github.com/lando/legacy-docs/blob/0d23031812b83ea761524e01316c11ce122aebd5/getting-started/requirements.md#L12-L28
[dockerfile-source]: https://github.com/lando/core/blob/96f8ea1cafa1fa361c69539e23bc41c541db6fb0/docs/lando-service.md#L225-L231
[guide-source]: https://github.com/lando/vitepress-theme-default-plus/blob/d2375b3a579c5b50c8773d3a29f195eceea37f42/docs/guides/making-a-guide.md#L9-L21
[tagging-source]: https://github.com/lando/vitepress-theme-default-plus/blob/9306431339e374905bb126a87161652654d26631/docs/guides/tagging-shit.md#L10-L30
[conventions-source]: https://github.com/lando/legacy-docs/blob/2afb6890e3e9d5f6206564feee50174f8af33f59/contrib/coder.md#L34-L42
