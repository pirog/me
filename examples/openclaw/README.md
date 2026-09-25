# OpenClaw Example

Install the checked-out pirog profile through Agent System in isolated OpenClaw state.
Check shared setup directly and through Doctor without a GitHub credential or Gateway.

## Setup

```bash
# should use the repository's existing workspace files
openclaw config set agents.defaults.skipBootstrap true --strict-json
```

## Testing

```bash
# should install the checked-out pirog profile without credentialed setup
set -o pipefail
cd "$GITHUB_WORKSPACE"
openclaw agent-system validate
openclaw agent-system install --skip-setup --yes --json \
  | jq -e '
      .agentId == "pirog"
      and (.outcomes | any(.component == "agent" and .status == "created"))
      and (.warnings | any(.code == "setup-skipped"))
      and (.outcomes | all(.component != "setup"))'

# should register pirog with the declared identity and workspace
set -o pipefail
openclaw agents list --json \
  | jq -e --arg workspace "$GITHUB_WORKSPACE" 'any(.[]; .id == "pirog" and .identityName == "Mike Pirog" and .workspace == $workspace)'
openclaw config get agents.entries.pirog.identity --json \
  | jq -e '.name == "Mike Pirog" and .avatar == "assets/icon-large-circle.png"'
test -s "$GITHUB_WORKSPACE/assets/icon-large-circle.png"

# should reconcile shared setup and report healthy checks
set -o pipefail
cd "$GITHUB_WORKSPACE"
bun scripts/setup.js apply brewfile
bun scripts/setup.js apply dotfiles
openclaw agent-system doctor --json \
  | jq -e '([.findings[] | select(.component == "setup" and (.stepId == "brewfile" or .stepId == "dotfiles"))] | length == 2 and all(.code == "setup-healthy")) and ([.findings[] | select(.component == "setup" and (.stepId != "brewfile" and .stepId != "dotfiles"))] | length == 4 and all(.code == "setup-not-applicable"))'

# should leave the repeated installation converged
set -o pipefail
cd "$GITHUB_WORKSPACE"
openclaw agent-system install --skip-setup --yes --json \
  | jq -e '(.warnings | any(.code == "setup-skipped")) and (.outcomes | any(.component == "agent" and .status == "unchanged") and all(.status == "unchanged" or .status == "skipped"))'
openclaw config validate --json | jq -e '.valid == true'
```
