# Some terminal apps launch interactive non-login shells, which skip ~/.zprofile.
[[ -r "$HOME/.config/zsh/path.zsh" ]] && source "$HOME/.config/zsh/path.zsh"

# Persistent history without a shell framework.
HISTFILE="$HOME/.zsh_history"
HISTSIZE=50000
SAVEHIST=10000
setopt append_history extended_history hist_ignore_dups hist_ignore_space share_history

# Warp can replace this with its native prompt; other terminals retain a useful default.
PROMPT='%n@%m %1~ %# '

# OpenClaw Completion
[ -f "/Users/pirog/.openclaw/completions/openclaw.zsh" ] && source "/Users/pirog/.openclaw/completions/openclaw.zsh"
