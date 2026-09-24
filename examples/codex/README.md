# Codex Example

Install the packaged Agent System plugin in disposable Codex state and bind the checked-out
pirog profile. The packaged hook output is checked directly; interactive skill use and native hook
trust are separate manual checks, with no model login needed here.

## Setup

```bash
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

# should load pirog identity through the packaged session start hook
set -o pipefail
plugin_root=$(jq -r .cachePath "$TMPDIR/cache.json")
printf '%s\n' '{"hook_event_name":"SessionStart","source":"startup"}' \
  | PLUGIN_DATA="$TMPDIR/plugin-data" PLUGIN_ROOT="$plugin_root" node "$plugin_root/dist/codex/codex-runtime.js" session-start \
  | jq -r '.hookSpecificOutput.additionalContext' | sed -n '/^{/,/^}/p' \
  | jq -e --arg workspace "$GITHUB_WORKSPACE" '.binding | .status == "active" and .workspaceDir == $workspace and .context.identity == {id: "pirog", name: "Mike Pirog", avatar: "assets/icon-large-circle.png"} and .context.github == {host: "github.com", username: "pirog"}'
test -s "$GITHUB_WORKSPACE/assets/icon-large-circle.png"

# should preserve the checked-out profile
git -C "$GITHUB_WORKSPACE" diff --exit-code
test -z "$(git -C "$GITHUB_WORKSPACE" status --short --untracked-files=all)"
```
