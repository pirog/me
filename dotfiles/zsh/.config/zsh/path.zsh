# Shared command environment for login and interactive shells.
if [[ -z "${HOMEBREW_PREFIX:-}" && -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# Zsh keeps the path array and PATH in sync. Keep the first occurrence of each path.
typeset -U path PATH
export BUN_INSTALL="$HOME/.bun"

typeset -a user_paths
user_paths=()

[[ -d "$HOME/.local/bin" ]] && user_paths+=("$HOME/.local/bin")
if [[ -n "${HOMEBREW_PREFIX:-}" && -d "$HOMEBREW_PREFIX/opt/node@24/bin" ]]; then
  user_paths+=("$HOMEBREW_PREFIX/opt/node@24/bin")
fi
[[ -d "$HOME/.lando/bin" ]] && user_paths+=("$HOME/.lando/bin")

path=($user_paths $path)
path=(${path:#"$BUN_INSTALL/bin"})
[[ -d "$BUN_INSTALL/bin" ]] && path+=("$BUN_INSTALL/bin")
unset user_paths
