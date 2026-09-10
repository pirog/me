# Local Voice Comparison

Use only for an explicitly requested experiment. Keep results in the PR or a local review packet,
not the runtime prompt. Do not publish generated issues or comments.

1. Agree on the comparison and freeze facts, audience, length, and format. Use the
   [fixed documentation task](technical-documentation-evaluation-prompt.md) or a new source brief.
2. Compare no author guidance, the single voice sentence, and the complete skill. Hold the model,
   reasoning, brief, and non-voice instructions constant; use fresh sessions and record actual inputs.
   Verify that installed voice guidance does not contaminate the baseline.
3. Generate repeated outputs per condition. A small diagnostic can use two runs on one brief;
   assess broader reliability across varied topics and content types before claiming it.
4. Check facts and required format first. Keep failures without rerolling them. Shuffle labels,
   hide the key, and ask separately about preference, distinctiveness, and audience fit; allow ties
   or neither. Look for consistent voice rather than repeated jokes.
5. Report counts, failures, exact prompts/settings, and pirog's judgments before changing guidance.

Installed activation and personality are separate checks. After an authorized cache refresh or
global restow, verify fresh-session skill selection, house-style overrides, sensitive prose, and
code preservation. Style preference does not establish better judgment or reliable activation.
