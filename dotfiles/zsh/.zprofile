if [[ "$(/usr/bin/uname -m)" == "arm64" ]] && [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -x /usr/local/bin/brew ]]; then
  eval "$(/usr/local/bin/brew shellenv)"
elif command -v brew >/dev/null 2>&1; then
  eval "$(brew shellenv)"
fi

# Setting PATH for Python 3.10
# The original version is saved in .zprofile.pysave
#PATH="/Library/Frameworks/Python.framework/Versions/3.10/bin:${PATH}"
#export PATH

# Setting PATH for Python 2.7
# The original version is saved in .zprofile.pysave
#PATH="/Library/Frameworks/Python.framework/Versions/2.7/bin:${PATH}"
#export PATH
