# Technical Documentation Voice Experiment

## Purpose

Use a controlled local comparison to answer two separate questions:

1. Does the Hitchens author anchor produce a recognizable and accurate change?
2. Do the media adapter or evaluation examples improve that result enough to justify their prompt
   weight?

This is a development experiment, not CI. Run it before making an author anchor or runtime example
durable across additional communication types.

## Controls

- Use the same model, reasoning level, task, and run count for every condition.
- Run each condition at least three times; one appealing generation does not establish reliability.
- Disable plugins and user configuration so only the named guidance files differ.
- Keep the generated outputs untracked unless pirog deliberately promotes a result into evaluation
  evidence.
- Fail factual or formatting drift before scoring voice.

The commands below use `gpt-5.6-sol` at low reasoning because that was the first pilot configuration.
Change those values only when every condition changes together.

## Prepare an Isolated Workspace

Run from the `me` repository root:

```sh
voice_repo_root="$(pwd -P)"
voice_eval_dir="$(mktemp -d /private/tmp/piro-voice-docs.XXXXXX)"
git -C "$voice_eval_dir" init -q
```

`--ephemeral` keeps the runs out of saved Codex history, `--sandbox read-only` prevents workspace
edits, and `--output-last-message` captures only the prose being compared.

## Run Four Conditions

Run each block three times by replacing `RUN` with `1`, `2`, and `3`.

### A. Baseline

No voice guidance:

```sh
codex exec --ephemeral --sandbox read-only --disable plugins --ignore-user-config \
  --model gpt-5.6-sol -c model_reasoning_effort=low \
  -C "$voice_eval_dir" \
  --output-last-message "$voice_eval_dir/baseline-RUN.md" \
  'Complete the documentation task provided on stdin. Return only the requested Markdown.' \
  < "$voice_repo_root/skills/voice/references/technical-documentation-evaluation-prompt.md"
```

### B. Author anchor only

Read the author anchor, but not the profile, adapter, or examples:

```sh
codex exec --ephemeral --sandbox read-only --disable plugins --ignore-user-config \
  --model gpt-5.6-sol -c model_reasoning_effort=low \
  -C "$voice_eval_dir" \
  --output-last-message "$voice_eval_dir/anchor-RUN.md" \
  "Read only $voice_repo_root/skills/voice/references/hitchens-author-anchor.md as voice guidance. Do not open linked or adjacent files. Complete the documentation task provided on stdin at restrained intensity and return only the requested Markdown." \
  < "$voice_repo_root/skills/voice/references/technical-documentation-evaluation-prompt.md"
```

### C. Author anchor and media adapter

Read the normal runtime guidance, but no examples:

```sh
codex exec --ephemeral --sandbox read-only --disable plugins --ignore-user-config \
  --model gpt-5.6-sol -c model_reasoning_effort=low \
  -C "$voice_eval_dir" \
  --output-last-message "$voice_eval_dir/adapter-RUN.md" \
  "Read $voice_repo_root/skills/voice/references/voice-profile.md, $voice_repo_root/skills/voice/references/hitchens-author-anchor.md, and $voice_repo_root/skills/voice/references/technical-documentation.md as voice guidance. Do not read evaluation examples. Complete the documentation task provided on stdin and return only the requested Markdown." \
  < "$voice_repo_root/skills/voice/references/technical-documentation-evaluation-prompt.md"
```

### D. Author anchor, media adapter, and examples

Add the five evaluation-only pirog examples:

```sh
codex exec --ephemeral --sandbox read-only --disable plugins --ignore-user-config \
  --model gpt-5.6-sol -c model_reasoning_effort=low \
  -C "$voice_eval_dir" \
  --output-last-message "$voice_eval_dir/examples-RUN.md" \
  "Read $voice_repo_root/skills/voice/references/voice-profile.md, $voice_repo_root/skills/voice/references/hitchens-author-anchor.md, $voice_repo_root/skills/voice/references/technical-documentation.md, and $voice_repo_root/skills/voice/references/technical-documentation-examples.md as voice guidance. Complete the documentation task provided on stdin and return only the requested Markdown." \
  < "$voice_repo_root/skills/voice/references/technical-documentation-evaluation-prompt.md"
```

## Check Intensity Separation

After condition C passes, run the same task once at each intensity from `0` through `3`. Add this
sentence to the condition C prompt, replacing `SCORE` each time:

> Override the media default and use Hitchens intensity `SCORE`.

The outputs should become progressively more rhetorically conspicuous without changing any fact or
format. Reject the scale if adjacent levels cannot be distinguished repeatedly, or if intensity `3`
produces caricature instead of stronger argument and wit.

## Review the Results

First fail any output that changes a fact, command, option, safety boundary, or requested format.
Then score each surviving output from 0 to 2:

| Dimension            | 0                                           | 1                   | 2                                               |
| -------------------- | ------------------------------------------- | ------------------- | ----------------------------------------------- |
| Author influence     | Generic or unrelated                        | Intermittent traits | Clear rhetorical engine without imitation       |
| Intensity fit        | Too flat or too theatrical                  | Mostly calibrated   | Distinct and appropriate for the selected score |
| Reader orientation   | Buried task or generic preamble             | Usable but routine  | Leads with the task and next move               |
| Naturalness          | Stiff, affected, or conspicuously generated | Mostly natural      | Conversational and assured                      |
| Formatting restraint | Bloated headings, lists, or emphasis        | Minor excess        | Structure follows actual tasks and choices      |
| Anti-pattern control | Generic AI prose or Hitchens caricature     | Minor leakage       | Neither pattern distracts from the content      |

Condition B should establish whether the author anchor changes the voice. Condition C should retain
that difference while improving media fit. Keep condition D in runtime guidance only if it repeatedly
improves a named dimension without losing correctness, naturalness, or formatting compliance.

## Verify Activation Separately

After the guidance passes the ablation, synchronize the managed plugin cache and run the task once
with an explicit `Use $piro-voice` instruction. Confirm from the Codex trace that it reads the voice
profile, author anchor, and technical documentation adapter.

Then run the task without naming the skill in an environment that loads the shared
`dotfiles/ai/.codex/AGENTS.md` guidance. Score the result against the baseline over repeated runs.
Codex does not guarantee that an eligible installed skill will be selected on every matching turn,
so the shared guidance owns the compact ambient author anchor and intensity defaults. Explicit
`$piro-voice` activation remains the test for detailed media guidance.

## Initial Pilot Result

The August 27, 2026 pilot ran three generations per condition with `gpt-5.6-sol` at low reasoning.
All twelve outputs preserved the required facts. The baseline missed the 250-word minimum three out
of three times; the author-only and adapter conditions passed it three out of three times; the
examples condition passed it two out of three times.

The author anchor produced the main recognizable shift. The adapter made that voice more controlled
for documentation. Adding all five examples showed no reliable incremental benefit and slightly
reduced compliance, so the examples remain evaluation-only.

Explicit invocation through the synchronized installed plugin loaded the expected profile, author
anchor, and adapter and passed the factual and formatting gates. Two unnamed runs without an ambient
activation instruction did not load the skill, even after broadening its discovery description.
An additional unnamed run showed that an ambient instruction to invoke `$piro-voice` still did not
force skill selection. That failure is why detailed guidance remains in the plugin while the compact
author anchor and intensity defaults live in the shared `AGENTS.md` source.

## Initial Intensity Calibration

The first run of the final lean guidance generated one output at each intensity from `0` through `3`.
All four outputs preserved the required facts and formatting and stayed within 250–400 words. The
neutral output was conventional documentation; intensity `1` added one controlled pointed contrast;
intensity `2` sustained skeptical framing; and intensity `3` used several sharper reversals without
becoming a polemic.

This establishes that the levels can produce visibly different results. It does not establish
reliability: repeat the intensity pass for each new media adapter before accepting its default.
