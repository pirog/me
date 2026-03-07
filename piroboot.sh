#!/bin/bash
set -u
# Me setup script.
#
# This script is the official and recommended way to setup me on your macOS
# based computer.
#
# Script source is available at https://github.com/pirog/me

#
# Usage:
#
# To setup the latest stable version of me with all defaults you can
# directly curlbash:
#
# $ /bin/bash -c "$(curl -fsSL https://boot.pirog.me)" (this hasnt been setup yet)
#
# If you want to customize your installation you will need to download the
# script and invoke directly so you can pass in options:
#
# 1. download
#
#   $ curl -fsSL https://boot.pirog.me/piroboot.sh -o piroboot.sh
#
# 2. make executable
#
#   $ chmod +x ./piroboot.sh
#
# 3. print advanced usage
#
#   $ bash piroboot.sh --help
#
# 4. run customized setup
#
#  $ bash piroboot.sh ...--options (options not complete yet)

# Any code that has been modified by the original falls under
# Copyright (c) 2026, Tanaab Maneuvering Systems LLC
#
# All rights reserved.
# See license in the repo: https://github.com/pirog/me/blob/main/LICENSE
#
# We don't need return codes for "$(command)", only stdout is needed.
# Allow `[[ -n "$(command)" ]]`, `func "$(command)"`, pipes, etc.
# shellcheck disable=SC2312

# GET THE LTF right away
TANAAB_TMPFILE="$(mktemp -t tanaab.XXXXXX)"

# CONFIG
MACOS_OLDEST_SUPPORTED="26.0"
REQUIRED_CURL_VERSION="7.41.0"

abort() {
  printf "%s\n" "$@" >&2
  exit 1
}

# Fail fast with a concise message when not using bash
# Single brackets are needed here for POSIX compatibility
# shellcheck disable=SC2292
if [ -z "${BASH_VERSION:-}" ]; then
  abort "Bash is required to interpret this script."
fi

# Check if script is run with force-interactive mode in CI
if [[ -n "${CI-}" && -n "${INTERACTIVE-}" ]]; then
  abort "Cannot run force-interactive mode in CI."
fi

# Check if both `INTERACTIVE` and `NONINTERACTIVE` are set
# Always use single-quoted strings with `exp` expressions
# shellcheck disable=SC2016
if [[ -n "${INTERACTIVE-}" && -n "${NONINTERACTIVE-}" ]]; then
  abort 'Both `$INTERACTIVE` and `$NONINTERACTIVE` are set. Please unset at least one variable and try again.'
fi

# Check if script is run in POSIX mode
if [[ -n "${POSIXLY_CORRECT+1}" ]]; then
  abort 'Bash must not run in POSIX mode. Please unset POSIXLY_CORRECT and try again.'
fi

if [[ -t 1 ]]; then
  tty_escape() { printf "\033[%sm" "$1"; }
else
  tty_escape() { :; }
fi
tty_mkbold() { tty_escape "1;$1"; }
tty_mkdim() { tty_escape "2;$1"; }
tty_blue="$(tty_escape 34)"
tty_bold="$(tty_mkbold 39)"
tty_dim="$(tty_mkdim 39)"
tty_green="$(tty_escape 32)"
tty_magenta="$(tty_escape 35)"
tty_red="$(tty_mkbold 31)"
tty_reset="$(tty_escape 0)"
tty_underline="$(tty_escape "4;39")"
tty_yellow="$(tty_escape 33)"

get_abs_dir() {
  local file="$1"
  cd "$(dirname "$file")" || exit 1
  pwd
}

detect_arch() {
  local arch
  arch="$(/usr/bin/uname -m || /usr/bin/arch || uname -m || arch)"
  if [[ "${arch}" == "arm64" ]] || [[ "${arch}" == "aarch64" ]]; then
    DETECTED_ARCH="arm64"
  elif [[ "${arch}" == "x86_64" ]] || [[ "${arch}" == "x64" ]]; then
    DETECTED_ARCH="x64"
  else
    DETECTED_ARCH="${arch}"
  fi
}

detect_os() {
  local os
  os="$(uname)"
  if [[ "${os}" == "Linux" ]]; then
    DETECTED_OS="linux"
  elif [[ "${os}" == "Darwin" ]]; then
    DETECTED_OS="macos"
  else
    DETECTED_OS="${os}"
  fi
}

# get sysinfo
detect_arch
detect_os

# set defaults but allow envvars to be used
#
# RUNNER_DEBUG is used here so we can get good debug output when toggled in GitHub Actions
# see https://github.blog/changelog/2022-05-24-github-actions-re-run-jobs-with-debug-logging/
ARCH="${TANAAB_ARCH:-"$DETECTED_ARCH"}"
DEBUG="${TANAAB_DEBUG:-${RUNNER_DEBUG:-}}"
OS="${TANAAB_OS:-"$DETECTED_OS"}"
HOMEBREW_PREFIX="${HOMEBREW_PREFIX:-"/opt/homebrew"}"

# @TODO: do we want to allow for this to be a comma separated list that can broken into an arrray?
# @TODO: also support for "BREWFILES"?
# @TODO: allow for URL based files?
BREWFILE="${TANAAB_BREWFILE:-"./Brewfile"}"

# @TODO: do we want to also allow for also just dotfile?
# DOTPKGS="${TANAAB_DOTPKGS-"ai,git,ssh"}"
# FORCE="${TANAAB_FORCE:-}"

# @TODO: we need to make sure this is masked in any display
# OP_AUTH="${TANAAB_OP_AUTH:-$OP_SERVICE_ACCOUNT_TOKEN}"
TARGET="${TANAAB_TARGET:-$HOME}"

TANAAB_TMPDIR=$(get_abs_dir "$TANAAB_TMPFILE")

# preserve originals OPTZ
ORIGOPTS="$*"

usage() {
  cat <<EOS
Usage: ${tty_dim}[NONINTERACTIVE=1] [CI=1]${tty_reset} ${tty_bold}piroboot.sh${tty_reset} ${tty_dim}[options]${tty_reset}

${tty_green}Options:${tty_reset}
  --brewfile       installs brewfile ${tty_dim}[default: ${TARGET}]${tty_reset}
  --target         installs dotpkgs and identities relative to here ${tty_dim}[default: ${TARGET}]${tty_reset}
  --version        shows version of this script ${tty_dim}[default: ${VERSION}]${tty_reset}
  --debug          shows debug messages
  -h, --help       displays this help message
  -y, --yes        runs with all defaults and no prompts, sets NONINTERACTIVE=1

${tty_green}Environment Variables:${tty_reset}
  NONINTERACTIVE   installs without prompting for user input
  CI               installs in CI mode (e.g. does not prompt for user input)

EOS
  if [[ "${1:-0}" != "noexit" ]]; then
    exit "${1:-0}"
  fi
}

show_version() {
  printf "%s\n" "$SCRIPT_VERSION)"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --brewfile)
      BREWFILE="$2"
      shift 2
      ;;
    --brewfile=*)
      BREWFILE="${1#*=}"
      shift
      ;;

    --debug)
      DEBUG=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;

    --target)
      TARGET="$2"
      shift 2
      ;;
    --target=*)
      TARGET="${1#*=}"
      shift
      ;;

    -h | --help)
      usage
      ;;
    --version)
      show_version
      ;;
    -y | --yes)
      NONINTERACTIVE="1"
      shift
      ;;
    *)
      usage "noexit"
      abort "${tty_red}Unrecognized option${tty_reset} ${tty_bold}$1${tty_reset}! See available options in usage above."
      ;;
  esac
done

# USER isn't always set so provide a fall back for the installer and subprocesses.
if [[ -z "${USER-}" ]]; then
  USER="$(chomp "$(id -un)")"
  export USER
fi

# Set debug
if [[ "$DEBUG" == "1" ]]; then
  TANAAB_DEBUG="--debug"
fi;

# redefine this one
abort() {
  printf "${tty_red}ERROR${tty_reset}: %s\n" "$(chomp "$1")" >&2
  exit 1
}

abort_multi() {
  while read -r line; do
    printf "${tty_red}ERROR${tty_reset}: %s\n" "$(chomp "$line")" >&2
  done <<< "$@"
  exit 1
}

chomp() {
  printf "%s" "${1/"$'\n'"/}"
}

debug() {
  if [[ -n "${DEBUG-}" ]]; then
    printf "${tty_dim}debug${tty_reset} %s\n" "$(shell_join "$@")" >&2
  fi
}

# shellcheck disable=SC2329
debug_multi() {
  if [[ -n "${DEBUG-}" ]]; then
    while read -r line; do
      debug "$1 $line"
    done <<< "$@"
  fi
}

log() {
  printf "%s\n" "$(shell_join "$@")"
}

shell_join() {
  local arg
  printf "%s" "${1:-}"
  shift
  for arg in "$@"; do
    printf " "
    printf "%s" "${arg// /\ }"
  done
}

warn() {
  printf "${tty_yellow}warning${tty_reset}: %s\n" "$(chomp "$@")" >&2
}

# shellcheck disable=SC2329
warn_multi() {
  while read -r line; do
    warn "${line}"
  done <<< "$@"
}

# if we dont have a SCRIPT_VERSION then try to get it from git
if [[ -z "${SCRIPT_VERSION-}" ]]; then
  SCRIPT_VERSION="$(git describe --tags --always --abbrev=1)"
fi

# print version of script
debug "running piroboot.sh script version: ${SCRIPT_VERSION}"

# debug raw options
# these are options that have not yet been validated or mutated e.g. the ones the user has supplied or defualts\
debug "raw args piroboot.sh $ORIGOPTS"
debug raw CI="${CI:-}"
debug raw NONINTERACTIVE="${NONINTERACTIVE:-}"
debug raw ARCH="$ARCH"
debug raw BREWFILE="$BREWFILE"
debug raw DEBUG="$DEBUG"
debug raw FORCE="$FORCE"
debug raw TARGET="$TARGET"
debug raw OS="$OS"
debug raw USER="$USER"
debug raw TMPFILE="$TANAAB_TMPFILE"
debug raw TMPDIR="$TANAAB_TMPDIR"

#######################################################################  tool-verification

# precautions
unset HAVE_SUDO_ACCESS

# shellcheck disable=SC2230
find_tool() {
  if [[ $# -ne 1 ]]; then
    return 1
  fi

  local executable
  while read -r executable; do
    if [[ "${executable}" != /* ]]; then
      warn "Ignoring ${executable} (relative paths don't work)"
    elif "test_$1" "${executable}"; then
      echo "${executable}"
      break
    fi
  done < <(which -a "$1")
}

find_first_existing_parent() {
  dir="$1"

  while [[ ! -d "$dir" ]]; do
    dir=$(dirname "$dir")
  done

  echo "$dir"
}

have_sudo_access() {
  local GROUPS_CMD
  local -a SUDO=("/usr/bin/sudo")

  GROUPS_CMD="$(which groups)"

  if [[ ! -x "/usr/bin/sudo" ]]; then
    return 1
  fi

  if [[ -x "$GROUPS_CMD" ]]; then
    if "$GROUPS_CMD" | grep -q sudo; then
      HAVE_SUDO_ACCESS="0"
    fi
    if "$GROUPS_CMD" | grep -q admin; then
      HAVE_SUDO_ACCESS="0"
    fi
    if "$GROUPS_CMD" | grep -q adm; then
      HAVE_SUDO_ACCESS="0"
    fi
    if "$GROUPS_CMD" | grep -q wheel; then
      HAVE_SUDO_ACCESS="0"
    fi
  fi

  if [[ -n "${SUDO_ASKPASS-}" ]]; then
    SUDO+=("-A")
  fi

  if [[ -z "${HAVE_SUDO_ACCESS-}" ]]; then
    "${SUDO[@]}" -l -U "${USER}" &>/dev/null
    HAVE_SUDO_ACCESS="$?"
  fi

  if [[ "${HAVE_SUDO_ACCESS}" == 1 ]]; then
    debug "${USER} does not appear to have sudo access!"
  else
    debug "${USER} has sudo access"
  fi

  return "${HAVE_SUDO_ACCESS}"
}

major_minor() {
  echo "${1%%.*}.$(
    x="${1#*.}"
    echo "${x%%.*}"
  )"
}

# shellcheck disable=SC2329
test_curl() {
  if [[ ! -x "$1" ]]; then
    return 1
  fi

  local curl_version_output curl_name_and_version
  curl_version_output="$("$1" --version 2>/dev/null)"
  curl_name_and_version="${curl_version_output%% (*}"
  version_compare "$(major_minor "${curl_name_and_version##* }")" "$(major_minor "${REQUIRED_CURL_VERSION}")"
}

# returns true if maj.min a is greater than maj.min b
version_compare() (
  yy_a="$(echo "$1" | cut -d'.' -f1)"
  yy_b="$(echo "$2" | cut -d'.' -f1)"
  if [ "$yy_a" -lt "$yy_b" ]; then
    return 1
  fi
  if [ "$yy_a" -gt "$yy_b" ]; then
    return 0
  fi
  mm_a="$(echo "$1" | cut -d'.' -f2)"
  mm_b="$(echo "$2" | cut -d'.' -f2)"

  # trim leading zeros to accommodate CalVer
  mm_a="${mm_a#0}"
  mm_b="${mm_b#0}"

  if [ "${mm_a:-0}" -lt "${mm_b:-0}" ]; then
    return 1
  fi

  return 0
)

# abort if we dont have curl, or the right version of it
if [[ -z "$(find_tool curl)" ]]; then
  abort_multi "$(cat <<EOABORT
You must install cURL ${REQUIRED_CURL_VERSION} or higher before using this installer.
EOABORT
)"
fi

# set curl
CURL=$(find_tool curl);
debug "using the cURL at ${CURL}"

# determine existing dir we need to check
PERM_DIR="$(find_first_existing_parent "$TARGET")"
debug "resolved install destination ${TARGET} to a perm check on ${PERM_DIR}"

####################################################################### version validation

needs_sudo() {
  if [[ ! -w "$HOMEBREW_PREFIX" ]] || [[ ! -w "$PERM_DIR" ]] || [[ ! -w "$TANAAB_TMPDIR" ]]; then
    return 0;
  else
    return 1;
  fi
}

####################################################################### pre-script errors

# abort if run as root
# @NOTE: this might change in the future but right now we do not understand all the complexities around this
if [[ "${EUID:-${UID}}" == "0" ]]; then
  abort "Cannot run this script as root"
fi

# @NOTE: in order to do what we want here does the user actually need to be a sudoer?

# abort if dir
if needs_sudo && ! have_sudo_access; then
  abort_multi "$(cat <<EOABORT
${tty_bold}${USER}${tty_reset} cannot write to ${tty_red}${TARGET}${tty_reset} and is not a ${tty_bold}sudo${tty_reset} user!
Rerun setup with a sudoer or use --target to install to a directory ${tty_bold}${USER}${tty_reset} can write to.
For more information on advanced usage rerurn with --help or check out: ${tty_underline}${tty_magenta}https://docs.lando.dev/install${tty_reset}
EOABORT
)"
fi

# abort if unsupported os
if [[ "${OS}" != "macos" ]] && [[ "${OS}" != "linux" ]]; then
  abort_multi "$(cat <<EOABORT
This script is only for ${tty_green}macOS${tty_reset} and ${tty_green}Linux${tty_reset}! ${tty_red}${OS}${tty_reset} is not supported!
For installation on other OSes check out: ${tty_underline}${tty_magenta}https://docs.lando.dev/install${tty_reset}
EOABORT
)"
fi

# abort if unsupported arch
if [[ "${ARCH}" != "x64" ]] && [[ "${ARCH}" != "arm64" ]]; then
  abort_multi "$(cat <<EOABORT
Lando can only be installed on ${tty_green}x64${tty_reset} or ${tty_green}arm64${tty_reset} based systems!
For requirements check out: ${tty_underline}${tty_magenta}https://docs.lando.dev/requirements${tty_reset}
EOABORT
)"
fi

# abort if macos version is too low
if [[ "${OS}" == "macos" ]]; then
  macos_version="$(major_minor "$(/usr/bin/sw_vers -productVersion)")"
  if ! version_compare "${macos_version}" "${MACOS_OLDEST_SUPPORTED}"; then
    abort_multi "$(cat <<EOABORT
Your macOS version ${tty_red}${macos_version}${tty_reset} is ${tty_bold}too old${tty_reset}! Min required version is ${tty_green}${MACOS_OLDEST_SUPPORTED}${tty_reset}
For requirements check out: ${tty_underline}${tty_magenta}https://docs.lando.dev/requirements${tty_reset}
EOABORT
)"
  fi
fi

####################################################################### pre-script warnings

# Check if script is run non-interactively (e.g. CI)
# If it is run non-interactively we should not prompt for passwords.
# Always use single-quoted strings with `exp` expressions
# shellcheck disable=SC2016
if [[ -z "${NONINTERACTIVE-}" ]]; then
  if [[ -n "${CI-}" ]]; then
    warn 'Running in non-interactive mode because `$CI` is set.'
    NONINTERACTIVE=1
  elif [[ ! -t 0 ]]; then
    if [[ -z "${INTERACTIVE-}" ]];  then
      warn 'Running in non-interactive mode because `stdin` is not a TTY.'
      NONINTERACTIVE=1
    else
      warn 'Running in interactive mode despite `stdin` not being a TTY because `$INTERACTIVE` is set.'
    fi
  fi
else
  log 'Running in non-interactive mode because `$NONINTERACTIVE` is set.'
fi

####################################################################### script

getc() {
  local save_state
  save_state="$(/bin/stty -g)"
  /bin/stty raw -echo
  IFS='' read -r -n 1 -d '' "$@"
  /bin/stty "${save_state}"
}

execute() {
  debug "${tty_blue}running${tty_reset}" "$@"
  if ! "$@"; then
    abort "$(printf "Failed during: %s" "$(shell_join "$@")")"
  fi
}

execute_sudo() {
  local -a args=("$@")
  if [[ "${EUID:-${UID}}" != "0" ]] && have_sudo_access; then
    if [[ -n "${SUDO_ASKPASS-}" ]]; then
      args=("-A" "${args[@]}")
    fi
    execute "/usr/bin/sudo" "${args[@]}"
  else
    execute "${args[@]}"
  fi
}

wait_for_user() {
  local c

# Trap to clean up on Ctrl-C or exit
  trap 'stty sane; tput sgr0; echo; exit 1' SIGINT

  echo
  echo "Press ${tty_bold}RETURN${tty_reset}/${tty_bold}ENTER${tty_reset} to continue or any other key to abort:"
  getc c
  # we test for \r and \n because some stuff does \r instead
  if ! [[ "${c}" == $'\r' || "${c}" == $'\n' ]]; then
    exit 1
  fi
}

# shellcheck disable=SC2329
# @TODO: revisit later whether we need this still
auto_mkdirp() {
  local dir="$1"
  local perm_dir
  perm_dir="$(find_first_existing_parent "$dir")"

  if have_sudo_access && [[ ! -w "$perm_dir" ]]; then
    execute_sudo mkdir -p "$dir"
  else
    execute mkdir -p "$dir"
  fi
}

# shellcheck disable=SC2329
# @TODO: revisit later whether we need this still
auto_mv() {
  local source="$1"
  local dest="$2"
  local perm_source
  local perm_dest
  perm_source="$(find_first_existing_parent "$source")"
  perm_dest="$(find_first_existing_parent "$dest")"

  if have_sudo_access && [[ ! -w "$perm_source" ||  ! -w "$perm_dest" ]]; then
    execute_sudo mv -f "$source" "$dest"
  else
    execute mv -f "$source" "$dest"
  fi
}

# shellcheck disable=SC2329
# @TODO: revisit later whether we need this still
auto_curl_n_x() {
  local dest="$1"
  local url="$2"
  local perm_dir
  perm_dir="$(find_first_existing_parent "$dest")"

  if have_sudo_access && [[ ! -w "$perm_dir" ]]; then
    execute_sudo curl \
      --fail \
      --location \
      --progress-bar \
      --output "$dest" \
      "$url"
    execute_sudo chmod +x "$dest"
  else
    execute curl \
      --fail \
      --location \
      --progress-bar \
      --output "$dest" \
      "$url"
    execute chmod +x "$dest"
  fi
}

# Invalidate sudo timestamp before exiting (if it wasn't active before).
if [[ -x /usr/bin/sudo ]] && ! /usr/bin/sudo -n -v 2>/dev/null; then
  trap '/usr/bin/sudo -k' EXIT
fi

# Things can fail later if `pwd` doesn't exist.
# Also sudo prints a warning message for no good reason
cd "/usr" || exit 1

# if running non-interactively then lets try to summarize what we are going to do
if [[ -z "${NONINTERACTIVE-}" ]]; then
  log "${tty_bold}this script is about to:${tty_reset}"
  log
  # @TODO: we need to collect requirements first so we can inform the user what is about to happen here

  # block for user
  wait_for_user
fi

# flag for password here if needed
if needs_sudo; then
  log "please enter ${tty_bold}sudo${tty_reset} password:"
  execute_sudo true
fi

# Create directories if we need to

# FIN!
exit 0
