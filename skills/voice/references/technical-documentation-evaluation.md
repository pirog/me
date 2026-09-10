# Local Voice Comparison

Use only for an explicitly requested experiment. The compact content directions are untested.
Earlier guidance and examples remain available in commit `63ff6e6`; keep results in the PR or a
local review packet, not in the runtime prompt. Do not publish generated issues or comments.

## Procedure

1. Agree on the content type and comparison before generating. Begin with the
   [fixed documentation task](technical-documentation-evaluation-prompt.md), or freeze a new
   source brief with exact facts, audience, length, and formatting for another content type.
2. Use three conditions: no pirog voice guidance, the previous guidance from `63ff6e6`, and the
   current compact skill. For documentation, the previous condition uses `voice-profile.md`,
   `hitchens-author-anchor.md`, and `technical-documentation.md` from that commit's voice references;
   for other content, use the first two. Do not include examples unless separately testing their value.
3. Run at least three fresh generations per condition on each of three distinct briefs. Hold the
   model, reasoning setting, source brief, word limits, and non-voice instructions constant. Use an
   isolated context without installed pirog voice instructions or implicit skill loading contaminating
   the baseline; verify and record the actual inputs and guidance loaded for every condition.
4. Check every output against its facts, uncertainty, and format requirements first. Record failures
   without silently rerolling them. Do not count a style preference as a successful result when it
   breaks those requirements or has a material length mismatch that confounds the comparison.
5. Shuffle labels independently for each comparison and hide the key. Ask pirog separately which
   output is preferred, whether it feels distinct, and whether its tone fits. Allow neither or a tie.
   Inspect repeated outputs for consistent qualities, not repeated jokes or signature phrases.
6. Report raw counts, failures, model/settings, exact prompts, and owner observations; keep isolated
   prompting evidence separate from automatic activation. Decide together whether to keep, revise,
   or reject the compact directions before expanding the guide or adding examples.

## Installed Behavior Is a Separate Check

After approval to activate, perform the owning plugin's validation and cache check/sync/check,
restow global instructions only when authorized, and start a fresh session. Verify both the ambient
global baseline and selection of the appropriate skill direction without explicit voice prompting.
Include a house-style override, sensitive prose, and code-preservation case. Test the personality
draft separately on proposals where challenge, agreement, and respecting an informed choice are
each appropriate; stylistic distinctiveness is not evidence of better judgment.
