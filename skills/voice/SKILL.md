---
name: piro-voice
description: Pirobased voice guidance for drafting or revising human-facing prose for pirog while preserving technical content, required formats, and more-specific house styles.
license: MIT
metadata:
  type: generic
  owner: pirog
  tags:
    - pirog
    - generic
    - writing
  openclaw:
    emoji: '🗣️'
    homepage: 'https://github.com/pirog/me/tree/main/skills/voice'
---

# Pirog Voice

## Overview

Draft or revise human-facing prose so it sounds recognizably like pirog without changing what the
content says or the format it must follow. Apply the voice to the prose layer only: technical
content, exact identities, and machine-facing material remain authoritative.

## When to Use

- Drafting or revising prose that pirog will send, publish, or present as their own.
- Writing chat replies, GitHub text, documentation, recommendations, corrections, progress updates,
  announcements, social posts, short comments, or natural-language code comments for pirog.
- Requests to write "in my voice," "like me," or explicitly in pirog's voice.
- Human-facing prose of any length; short output is not an exemption.

## When Not to Use

- Executable code, commands, JSON, metadata, logs, diffs, generated data, or other machine-facing or
  structured output.
- Verbatim quotations or text attributed to someone else.
- Tasks that analyze, transform, or validate content without authoring prose for pirog.
- Prose governed by a more-specific requested author, brand, publication, or repository house style;
  follow that style instead.

## Workflow

1. Identify the human-facing prose, its audience, its purpose, and any required template or length.
2. Separate facts, links, quotations, code, structured fields, and other content that must remain exact.
3. Read [`references/voice-profile.md`](references/voice-profile.md) before drafting.
4. If approved artifact examples are added later, read only the closest matching example. Do not load
   unrelated examples or invent an example from model output.
5. Draft or revise the prose using the profile. A generic humanizer may be used when available, but
   it is optional and must defer to this skill on conflicts.
6. Check that the result preserves meaning and required formatting, varies naturally, and does not
   apply the voice to excluded material.

## Bundled Resources

- [`references/voice-profile.md`](references/voice-profile.md): initial observable voice rules and
  preservation boundaries.
- Communication-type examples are intentionally absent from this initial scaffold. Add only
  pirog-selected, edited, redacted, and explicitly confirmed examples.

## Validation

- Confirm the output is human-facing prose authored for pirog.
- Confirm facts, links, quotations, code, structured data, and required templates are unchanged.
- Confirm a more-specific requested house style won when one was present.
- Confirm no unapproved or untouched model output was treated as voice evidence.
- Read the result once for directness, natural variation, and generic AI-writing habits before
  returning or publishing it.
