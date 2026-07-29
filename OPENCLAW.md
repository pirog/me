# OpenClaw Plugin Development

This guide configures the opt-in local OpenClaw workspace for `tanaabot`. Start with the
[README](./README.md) for machine setup and use [Advanced](./ADVANCED.md) for the broader reference.
Runtime configuration, credentials, agent state, and sessions stay outside this public repository.

## Development Identity

This checkout owns the tracked workspace context for one distinct OpenClaw agent:

| Field             | Value                                      |
| ----------------- | ------------------------------------------ |
| OpenClaw agent ID | `tanaabot`                                 |
| Display name      | `MODEL L3-37`                              |
| GitHub identity   | [`@tanaabot`](https://github.com/tanaabot) |
| Workspace         | `/Users/pirog/tanaab/me`                   |
| Agent state       | `~/.openclaw/agents/tanaabot/`             |

The tracked context comes from [`IDENTITY.md`](./IDENTITY.md), [`SOUL.md`](./SOUL.md),
[`USER.md`](./USER.md), [`TOOLS.md`](./TOOLS.md), and [`HEARTBEAT.md`](./HEARTBEAT.md). The `Agent ID`
line is declarative; OpenClaw configuration owns the actual ID and routing. `tanaabot` is a
development identity only.

## Setup

```sh
cd /Users/pirog/tanaab/me

# Install the opt-in development dependencies.
brew bundle --file Brewfile.openclaw

# Configure the local Gateway without a background service.
openclaw onboard \
  --flow quickstart \
  --workspace "$HOME/.openclaw/workspace" \
  --mode local \
  --auth-choice openai \
  --gateway-port 18789 \
  --gateway-bind loopback \
  --tailscale off \
  --no-install-daemon \
  --skip-health \
  --skip-bootstrap \
  --skip-channels \
  --skip-skills \
  --skip-hooks \
  --skip-search \
  --skip-ui

# Create the agent with this checkout as its workspace.
openclaw agents add tanaabot \
  --workspace "$PWD" \
  --non-interactive \
  --json

# Synchronize the tracked identity.
openclaw agents set-identity \
  --agent tanaabot \
  --workspace "$PWD" \
  --from-identity

# Authenticate the agent separately.
openclaw models auth --agent tanaabot login --provider openai

# Confirm the array indexes before changing the default.
openclaw config get agents.list

# Keep main as the default. Adjust these indexes if the inspected order differs.
openclaw config set 'agents.list[0].default' true --strict-json
openclaw config set 'agents.list[1].default' false --strict-json
```

## Tanaab-based Theming

```sh
# Set the Control UI accent.
openclaw config set ui.seamColor '#00c88a'

# Set the shared fallback presentation for main and agents without their own identity.
openclaw config set ui.assistant.name 'FALLBACKBOT'
openclaw config set ui.assistant.avatar "data:image/png;base64,$(base64 < assets/fallbackbot.png | tr -d '\n')"

# Copy the PIROG browser identity command, then paste it into the Control UI console.
printf 'localStorage.setItem("openclaw.control.user.v1", "{\"name\":\"PIROG\",\"avatar\":\"data:image/jpeg;base64,%s\"}"); location.reload();\n' "$(base64 < assets/pirog-small.jpg | tr -d '\n')" | pbcopy
```

## Run

```sh
# Start the loopback-only Gateway in the foreground.
openclaw gateway run --bind loopback --port 18789

# In another terminal, verify the Gateway and open the Control UI.
openclaw gateway health --port 18789
openclaw dashboard
```

Press `Ctrl-C` in the Gateway terminal to stop development.

## Verify

```sh
# Validate configuration, routing, identity, and model authentication.
openclaw config validate
openclaw agents list --json
openclaw models status --agent tanaabot --check

# Run an optional model-backed smoke test.
openclaw agent --agent tanaabot --message "Report your display name and OpenClaw agent ID." --json
```

The agent list should report `main` as the default and `tanaabot` with this checkout as its
workspace. The Control UI should show `FALLBACKBOT` for `main` and `MODEL L3-37` for `tanaabot`.

See the official [agents](https://docs.openclaw.ai/cli/agents),
[multi-agent routing](https://docs.openclaw.ai/concepts/multi-agent),
[OpenAI provider](https://docs.openclaw.ai/providers/openai),
[onboarding](https://docs.openclaw.ai/cli/onboard), and
[Gateway CLI](https://docs.openclaw.ai/cli/gateway) references for the current upstream contract.
