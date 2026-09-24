# OpenClaw Example

Install the checked-out pirog profile through Agent System in isolated OpenClaw state.
This checks identity and repeat-install convergence without credentials, setup steps, or a Gateway.

## Setup

```bash
# should use the repository's existing workspace files
openclaw config set agents.defaults.skipBootstrap true --strict-json
```

## Testing

```bash
# should validate and install the checked-out pirog profile
set -o pipefail
cd "$GITHUB_WORKSPACE"
openclaw agent-system validate
openclaw agent-system install --skip-setup --json \
  | jq -e '.agentId == "pirog" and (.outcomes | any(.component == "agent" and .status == "created"))'

# should register pirog with the declared identity and workspace
set -o pipefail
openclaw agents list --json \
  | jq -e --arg workspace "$GITHUB_WORKSPACE" 'any(.[]; .id == "pirog" and .identityName == "Mike Pirog" and .workspace == $workspace)'
openclaw config get agents.entries.pirog.identity --json \
  | jq -e '.name == "Mike Pirog" and .avatar == "assets/icon-large-circle.png"'
test -s "$GITHUB_WORKSPACE/assets/icon-large-circle.png"

# should leave the repeated installation converged
set -o pipefail
cd "$GITHUB_WORKSPACE"
openclaw agent-system install --skip-setup --json \
  | jq -e '.outcomes | any(.component == "agent" and .status == "unchanged") and all(.status == "unchanged" or .status == "skipped")'
openclaw config validate --json | jq -e '.valid == true'
```
