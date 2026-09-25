# OpenClaw Example

Install the checked-out pirog profile through Agent System in isolated OpenClaw state.
This checks shared setup, identity, and repeat-install convergence without credentials or a Gateway.

## Setup

```bash
# should use the repository's existing workspace files
openclaw config set agents.defaults.skipBootstrap true --strict-json
```

## Testing

```bash
# should install the checked-out pirog profile with shared setup
set -o pipefail
cd "$GITHUB_WORKSPACE"
openclaw agent-system validate
openclaw agent-system install --yes --json \
  | jq -e '
      .agentId == "pirog"
      and (.outcomes | any(.component == "agent" and .status == "created"))
      and ([.outcomes[] | select(.component == "setup" and (.stepId == "brewfile" or .stepId == "dotfiles"))] | length == 2 and all(.code == "setup-applied" or .code == "setup-unchanged"))
      and ([.outcomes[] | select(.component == "setup" and (.stepId != "brewfile" and .stepId != "dotfiles"))] | length == 4 and all(.code == "setup-not-applicable"))'

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
openclaw agent-system install --yes --json \
  | jq -e '([.outcomes[] | select(.stepId == "brewfile" or .stepId == "dotfiles")] | length == 2 and all(.code == "setup-unchanged")) and (.outcomes | any(.component == "agent" and .status == "unchanged") and all(.status == "unchanged" or .status == "skipped"))'
openclaw config validate --json | jq -e '.valid == true'
```
