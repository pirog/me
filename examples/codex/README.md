# Codex Example

Bootstrap the checked-out pirog profile, then install the packaged Agent System plugin in
disposable Codex state. Run setup through its binding and check the packaged hook output directly;
interactive skill use and native hook trust are separate manual checks, with no model login needed here.

## Setup

```bash
# should bootstrap the codex setup prerequisites
boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --force

# should install and enable the packaged agent system plugin
set -o pipefail
mkdir -p "$TMPDIR/package"
tar -xzf "$AGENT_SYSTEM_PACKAGE" -C "$TMPDIR/package"
codex-tools install "$TMPDIR/package/package" --json \
  | jq -e '.ok == true and .inspection.installed == true and .inspection.enabled == true'
codex-tools cache check --repo-root "$TMPDIR/package/package" --json \
  | tee "$TMPDIR/cache.json" | jq -e '.ok == true and .status == "current"'
test -s "$(jq -r .cachePath "$TMPDIR/cache.json")/skills/codex-binding/SKILL.md"
```

## Testing

```bash
# should preview the actual pirog manifest without creating a binding
set -o pipefail
runtime="$(jq -r .cachePath "$TMPDIR/cache.json")/dist/codex/codex-runtime.js"
node "$runtime" binding preview --workspace "$GITHUB_WORKSPACE" \
  | jq -e --arg workspace "$GITHUB_WORKSPACE" '.status == "ready" and .workspaceDir == $workspace and .manifest.status == "valid" and .manifest.agentId == "pirog"'
test ! -e "$TMPDIR/plugin-data/workspace-binding.json"

# should persist and inspect the confirmed pirog workspace binding
set -o pipefail
runtime="$(jq -r .cachePath "$TMPDIR/cache.json")/dist/codex/codex-runtime.js"
node "$runtime" binding bind --plugin-data "$TMPDIR/plugin-data" --workspace "$GITHUB_WORKSPACE" --confirm \
  | jq -e '.status == "bound"'
node "$runtime" binding inspect --plugin-data "$TMPDIR/plugin-data" \
  | jq -e --arg workspace "$GITHUB_WORKSPACE" '.status == "bound" and .binding.workspaceDir == $workspace and .preview.manifest.status == "valid" and .preview.manifest.agentId == "pirog"'

# should install every pirog setup step through standalone codex
set -o pipefail
runtime="$(jq -r .cachePath "$TMPDIR/cache.json")/dist/codex/codex-runtime.js"
node "$runtime" setup install --plugin-data "$TMPDIR/plugin-data" \
  | jq -e '.status == "installed" and [.outcomes[].stepId] == ["brewfile", "dotfiles", "codex-config", "piroplugin", "tanaab-plugin", "agent-system-plugin"] and all(.outcomes[]; .code == "setup-applied" or .code == "setup-unchanged")'

# should find every pirog setup step healthy after install
set -o pipefail
runtime="$(jq -r .cachePath "$TMPDIR/cache.json")/dist/codex/codex-runtime.js"
node "$runtime" setup inspect --plugin-data "$TMPDIR/plugin-data" \
  | jq -e '.status == "inspected" and (.findings | length) == 6 and all(.findings[]; .code == "setup-healthy")'

# should load pirog identity through the packaged session start hook
set -o pipefail
plugin_root=$(jq -r .cachePath "$TMPDIR/cache.json")
printf '%s\n' '{"hook_event_name":"SessionStart","source":"startup"}' \
  | PLUGIN_DATA="$TMPDIR/plugin-data" PLUGIN_ROOT="$plugin_root" node "$plugin_root/dist/codex/codex-runtime.js" session-start \
  | jq -r '.hookSpecificOutput.additionalContext' | sed -n '/^{/,/^}/p' \
  | jq -e --arg workspace "$GITHUB_WORKSPACE" '.binding | .status == "active" and .workspaceDir == $workspace and .context.identity == {id: "pirog", name: "Mike Pirog", avatar: "assets/icon-large-circle.png"} and .context.github == {host: "github.com", username: "pirog"}'
test -s "$GITHUB_WORKSPACE/assets/icon-large-circle.png"

# should expose model routing through the packaged hook
set -o pipefail
plugin_root=$(jq -r .cachePath "$TMPDIR/cache.json")
printf '%s\n' '{"hook_event_name":"SessionStart","source":"startup"}' \
  | PLUGIN_DATA="$TMPDIR/plugin-data" PLUGIN_ROOT="$plugin_root" node "$plugin_root/dist/codex/codex-runtime.js" session-start \
  | jq -r '.hookSpecificOutput.additionalContext' | sed -n '/^{/,/^}/p' \
  | jq -e '.routingRuntime.argvPrefix[-1] == "model-routing" and (.binding.context.capabilities | index("agent-system-model-routing") != null)'

# should match ai sync defaults to the packaged model projection
set -o pipefail
runtime="$(jq -r .cachePath "$TMPDIR/cache.json")/dist/codex/codex-runtime.js"
printf '%s\n' '{"action":"inspect"}' | node "$runtime" model-routing --plugin-data "$TMPDIR/plugin-data" \
  | tee "$TMPDIR/routing.json" | jq -e '.status == "available"'
cd "$GITHUB_WORKSPACE"
bun -e 'import assert from "node:assert/strict"; import {loadAgentModels} from "./lib/agent-models.js"; import config from "./utils/agent-models-config.js"; const routing = await Bun.file(process.env.TMPDIR + "/routing.json").json(); const defaults = config(await loadAgentModels()); assert.deepEqual(defaults, {model: routing.profiles.default.model, model_reasoning_effort: routing.profiles.default.thinking});'

# should resolve each configured work profile without applying a session change
set -o pipefail
runtime="$(jq -r .cachePath "$TMPDIR/cache.json")/dist/codex/codex-runtime.js"
for tier in low medium high; do
  jq -n --slurpfile inspected "$TMPDIR/routing.json" --arg tier "$tier" \
    '{action: "resolve", manifestDigest: $inspected[0].manifestDigest, context: "Bounded integration fixture with explicit Complexity.", assessment: {complexity: $tier, reason: "Explicit fixture Complexity."}, evidence: {complexity: $tier, source: "user"}}' \
    | node "$runtime" model-routing --plugin-data "$TMPDIR/plugin-data" \
    | jq -e --slurpfile inspected "$TMPDIR/routing.json" --arg tier "$tier" \
      '.status == "resolved" and .candidate == $inspected[0].profiles[$tier] and .application == "not-requested" and .execution == "unverified"'
done

# should preserve the other profile value under independent explicit overrides
set -o pipefail
runtime="$(jq -r .cachePath "$TMPDIR/cache.json")/dist/codex/codex-runtime.js"
for override in '{"model":"explicit-model"}' '{"effort":"medium"}'; do
  jq -n --slurpfile inspected "$TMPDIR/routing.json" --argjson override "$override" \
    '{action: "resolve", manifestDigest: $inspected[0].manifestDigest, context: "Bounded override fixture.", assessment: {complexity: "medium", reason: "Interacting concerns."}, overrides: $override}' \
    | node "$runtime" model-routing --plugin-data "$TMPDIR/plugin-data" \
    | jq -e --slurpfile inspected "$TMPDIR/routing.json" --argjson override "$override" \
      '.candidate.model == ($override.model // $inspected[0].profiles.medium.model) and .candidate.thinking == ($override.effort // $inspected[0].profiles.medium.thinking)'
done

# should retain unresolved reasoning when explicitly selecting the default
set -o pipefail
runtime="$(jq -r .cachePath "$TMPDIR/cache.json")/dist/codex/codex-runtime.js"
jq -n --slurpfile inspected "$TMPDIR/routing.json" \
  '{action: "resolve", manifestDigest: $inspected[0].manifestDigest, context: "No defensible tier in this fixture.", assessment: {complexity: "unset", reason: "Insufficient complexity evidence."}, fallback: "default"}' \
  | node "$runtime" model-routing --plugin-data "$TMPDIR/plugin-data" \
  | jq -e --slurpfile inspected "$TMPDIR/routing.json" \
    '.status == "unresolved" and .profile == "default" and .candidate == $inspected[0].profiles.default and .reason == "Insufficient complexity evidence."'
```
