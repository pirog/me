# Enable Powerlevel10k instant prompt. Keep this close to the top of ~/.zshrc.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Some terminal apps launch interactive non-login shells, which skip ~/.zprofile.
if [[ -z "${HOMEBREW_PREFIX:-}" ]]; then
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  elif command -v brew >/dev/null 2>&1; then
    eval "$(brew shellenv)"
  fi
fi

export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"
plugins=(git zsh-autosuggestions)

source "$ZSH/oh-my-zsh.sh"

[[ ! -f "$HOME/.p10k.zsh" ]] || source "$HOME/.p10k.zsh"

if [[ -r "$HOME/.oh-my-zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" ]]; then
  source "$HOME/.oh-my-zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"
elif [[ -r "${ZSH_CUSTOM:-$ZSH/custom}/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" ]]; then
  source "${ZSH_CUSTOM:-$ZSH/custom}/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"
fi

export PATH="$HOME/.lando/bin:$PATH"

if [[ -s "$HOME/.bun/_bun" ]]; then
  source "$HOME/.bun/_bun"
fi

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

if [[ -d "$HOME/.docker/completions" ]]; then
  fpath=("$HOME/.docker/completions" $fpath)
fi

autoload -Uz compinit
compinit

if [[ -n "${HOMEBREW_PREFIX:-}" && -d "${HOMEBREW_PREFIX}/opt/node@24/bin" ]]; then
  export PATH="${HOMEBREW_PREFIX}/opt/node@24/bin:$PATH"
fi
