# Initialize Apple Silicon Homebrew once for both login and interactive shells.
if [[ -z "${HOMEBREW_PREFIX:-}" && -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi
