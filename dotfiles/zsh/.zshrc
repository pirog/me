# Some terminal apps launch interactive non-login shells, which skip ~/.zprofile.
[[ -r "$HOME/.config/zsh/homebrew.zsh" ]] && source "$HOME/.config/zsh/homebrew.zsh"

# Command search path. Zsh keeps the path array and PATH in sync.
typeset -U path PATH
export BUN_INSTALL="$HOME/.bun"

[[ -d "$HOME/.lando/bin" ]] && path=("$HOME/.lando/bin" $path)
[[ -d "$BUN_INSTALL/bin" ]] && path=("$BUN_INSTALL/bin" $path)
if [[ -n "${HOMEBREW_PREFIX:-}" && -d "$HOMEBREW_PREFIX/opt/node@24/bin" ]]; then
  path=("$HOMEBREW_PREFIX/opt/node@24/bin" $path)
fi

# Persistent history without a shell framework.
HISTFILE="$HOME/.zsh_history"
HISTSIZE=50000
SAVEHIST=10000
setopt append_history extended_history hist_ignore_dups hist_ignore_space share_history

# Warp can replace this with its native prompt; other terminals retain a useful default.
PROMPT='%n@%m %1~ %# '
