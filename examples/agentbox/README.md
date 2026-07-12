# Agentbox Example

This example verifies that an installed Agentbox host keeps its formula-backed Tailscale runtime
and skips desktop-only casks during the final `me` Brewfile apply. It also proves that inherited
Homebrew Bundle cask skips are preserved.

This scenario is intended to run in CI by default. Do not run it locally unless the task explicitly
calls for a local Leia run.

## Setup

```bash
# should prepare an installed Agentbox host shape
brew uninstall --cask --force tailscale-app 1password codex-app || true
brew install tailscale
sudo mkdir -p /opt/tanaab/agentbox/bin
sudo touch /opt/tanaab/agentbox/bin/health.sh
sudo chmod 755 /opt/tanaab/agentbox/bin/health.sh
sudo touch /Library/LaunchDaemons/dev.tanaab.agentbox.health.plist
rm -f "$HOME/.ssh/id_test"
test -n "$OPTOKEN"

# should apply me with Agentbox cask skips
HOMEBREW_BUNDLE_CASK_SKIP="codex-app" boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --debug 2>&1 | tee "$TMPDIR/setup.log"
```

## Testing

```bash
# should detect the installed Agentbox host
grep -F 'AGENTBOX_HOST_DETECTED=1' "$TMPDIR/setup.log"

# should preserve inherited skips and add Agentbox desktop casks
grep -F 'HOMEBREW_BUNDLE_CASK_SKIP=codex-app' "$TMPDIR/setup.log" |
  grep -F 'tailscale-app' |
  grep -F '1password'

# should keep formula-backed Tailscale
brew list --formula tailscale >/dev/null
command -v tailscale >/dev/null
command -v tailscaled >/dev/null

# should skip desktop-only and inherited casks
if brew list --cask tailscale-app >/dev/null 2>&1; then exit 1; fi
if brew list --cask 1password >/dev/null 2>&1; then exit 1; fi
if brew list --cask codex-app >/dev/null 2>&1; then exit 1; fi

# should retain the beta 1Password CLI
brew list --cask 1password-cli@beta >/dev/null
command -v op >/dev/null

# should satisfy the effective Agentbox-aware Brewfile
HOMEBREW_BUNDLE_CASK_SKIP="codex-app tailscale-app 1password" \
  brew bundle check --file "$PIROME_PAYLOAD_DIR/Brewfile" --no-upgrade
```
