SCRIPT_VERSION="v0.1.2"
#!/bin/bash
set -u
# bootstrap a macOS machine using homebrew, brewfiles, dotfiles, and identity data.
#
# examples:
#
#   $ ./piroboot.sh
#   $ ./piroboot.sh --brewfile Brewfile.work --target ~/workstation
#   $ DEBUG=1 ./piroboot.sh --yes
#
# option precedence: cli options override environment variables, which override defaults.
#
# run `./piroboot.sh --help` for more advanced usage.
#
# note: stow --dotfiles is not currently implemented.

# Any code that has been modified by the original falls under
# Copyright (c) 2026, Tanaab Maneuvering Systems LLC
#
# All rights reserved.
# See license in the repo: https://github.com/pirog/me/blob/main/LICENSE
#
# We don't need return codes for "$(command)", only stdout is needed.
# Allow `[[ -n "$(command)" ]]`, `func "$(command)"`, pipes, etc.
# shellcheck disable=SC2312

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

# Tanaab based colors
tty_tp="$(tty_escape '38;2;0;200;138')"    # #00c88a
tty_ts="$(tty_escape '38;2;219;39;119')"   # #db2777

mask_secret_for_display() {
  local value="$1"
  local length="${#value}"
  local prefix_length="4"
  local suffix_length="4"
  local suffix_start

  if [[ -z "${value}" ]]; then
    printf "none"
    return 0
  fi

  if [[ "${length}" -le 4 ]]; then
    printf "****"
    return 0
  fi

  if [[ "${length}" -le 8 ]]; then
    prefix_length="2"
    suffix_length="2"
  fi

  suffix_start=$((length - suffix_length))
  printf "%s...%s" "${value:0:${prefix_length}}" "${value:${suffix_start}:${suffix_length}}"
}

# Set cheap defaults needed by usage/arg parsing first so --help/--version stay fast.
#
# RUNNER_DEBUG is used here so we can get good debug output when toggled in GitHub Actions
# see https://github.blog/changelog/2022-05-24-github-actions-re-run-jobs-with-debug-logging/
DEBUG="${TANAAB_DEBUG:-${DEBUG:-${RUNNER_DEBUG:-}}}"
FORCE="${TANAAB_FORCE:-}"
TARGET="${TANAAB_TARGET:-$HOME}"
BREWFILES_CSV="${TANAAB_BREWFILE:-}"
DOTPKGS_CSV="${TANAAB_DOTPKG:-}"
OP_TOKEN="${TANAAB_OP_TOKEN:-${OP_SERVICE_ACCOUNT_TOKEN:-}}"
SSH_KEYS_CSV="${TANAAB_SSH_KEY:-}"

# accommodate TANAAB_BREWFILES as well
if [[ -n "${TANAAB_BREWFILES:-}" ]]; then
  BREWFILES_CSV="${BREWFILES_CSV}${BREWFILES_CSV:+,}${TANAAB_BREWFILES}"
fi

# accommodate TANAAB_DOTPKGS as well
if [[ -n "${TANAAB_DOTPKGS:-}" ]]; then
  DOTPKGS_CSV="${DOTPKGS_CSV}${DOTPKGS_CSV:+,}${TANAAB_DOTPKGS}"
fi

# accommodate TANAAB_SSH_KEYS as well
if [[ -n "${TANAAB_SSH_KEYS:-}" ]]; then
  SSH_KEYS_CSV="${SSH_KEYS_CSV}${SSH_KEYS_CSV:+,}${TANAAB_SSH_KEYS}"
fi

# collect them all togethers with fallback if still empty
if [[ -z "${BREWFILES_CSV}" ]] && [[ -f "./Brewfile" ]]; then
  BREWFILES_CSV="./Brewfile"
fi

BREWFILES_CSV_DISPLAY="${BREWFILES_CSV:-none}"
DOTPKGS_CSV_DISPLAY="${DOTPKGS_CSV:-none}"
SSH_KEYS_CSV_DISPLAY="${SSH_KEYS_CSV:-none}"

if [[ -n "${OP_TOKEN:-}" ]]; then
  OP_TOKEN_DISPLAY="$(mask_secret_for_display "${OP_TOKEN}")"
else
  OP_TOKEN_DISPLAY="none"
fi

# preserve originals OPTZ
ORIGOPTS="$*"

trim_whitespace() {
  local value="$1"

  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"

  printf "%s" "${value}"
}

append_array_value() {
  local array_name="$1"
  local value
  local quoted

  value="$(trim_whitespace "$2")"
  if [[ -n "${value}" ]]; then
    printf -v quoted '%q' "${value}"
    eval "${array_name}+=(${quoted})"
  fi
}

append_csv_to_array() {
  local array_name="$1"
  local old_ifs="${IFS}"
  local entry
  local -a values=()

  if [[ -z "${2}" ]]; then
    return 0
  fi

  IFS=','
  read -r -a values <<< "${2}"
  IFS="${old_ifs}"

  if [[ "${#values[@]}" -eq 0 ]]; then
    return 0
  fi

  for entry in "${values[@]}"; do
    append_array_value "${array_name}" "${entry}"
  done
}

array_join() {
  local delimiter="$1"
  local array_name="$2"
  local item
  local first="1"
  local value_count="0"
  local -a values=()

  eval "value_count=\${#${array_name}[@]}"
  if [[ "${value_count}" -eq 0 ]]; then
    return 0
  fi

  eval "values=(\"\${${array_name}[@]}\")"

  for item in "${values[@]}"; do
    if [[ "${first}" == "1" ]]; then
      printf "%s" "${item}"
      first="0"
    else
      printf "%s%s" "${delimiter}" "${item}"
    fi
  done
}

array_contains() {
  local needle="$1"
  local array_name="$2"
  local item
  local value_count="0"
  local -a values=()

  eval "value_count=\${#${array_name}[@]}"
  if [[ "${value_count}" -eq 0 ]]; then
    return 1
  fi

  eval "values=(\"\${${array_name}[@]}\")"

  for item in "${values[@]}"; do
    if [[ "${item}" == "${needle}" ]]; then
      return 0
    fi
  done

  return 1
}

append_unique_array_value() {
  local array_name="$1"
  local value

  value="$(trim_whitespace "$2")"
  if [[ -z "${value}" ]]; then
    return 0
  fi

  if array_contains "${value}" "${array_name}"; then
    return 0
  fi

  append_array_value "${array_name}" "${value}"
}

# shellcheck disable=SC2034
declare -a BREWFILES=()
declare -a DOTPKGS=()
declare -a SSH_KEYS=()
append_csv_to_array BREWFILES "${BREWFILES_CSV}"
append_csv_to_array DOTPKGS "${DOTPKGS_CSV}"
append_csv_to_array SSH_KEYS "${SSH_KEYS_CSV}"
BREWFILES_CSV="$(array_join "," BREWFILES)"
DOTPKGS_CSV="$(array_join "," DOTPKGS)"
SSH_KEYS_CSV="$(array_join "," SSH_KEYS)"

for arg in "$@"; do
  case "${arg}" in
    --brewfile | --brewfile=* | --brewfiles | --brewfiles=*)
      # shellcheck disable=SC2034
      BREWFILES=()
      ;;
    --dotpkg | --dotpkg=* | --dotpkgs | --dotpkgs=*)
      # shellcheck disable=SC2034
      DOTPKGS=()
      ;;
    --ssh-key | --ssh-key=* | --ssh-keys | --ssh-keys=*)
      # shellcheck disable=SC2034
      SSH_KEYS=()
      ;;
  esac
done

usage() {
  cat <<EOS
Usage: ${tty_dim}[NONINTERACTIVE=1] [CI=1]${tty_reset} ${tty_bold}piroboot.sh${tty_reset} ${tty_dim}[options]${tty_reset}

${tty_tp}Options:${tty_reset}
  --brewfile       installs brewfiles ${tty_dim}[default: ${BREWFILES_CSV_DISPLAY}]${tty_reset}
  --dotpkg         stows dot packages into target ${tty_dim}[default: ${DOTPKGS_CSV_DISPLAY}]${tty_reset}
  --ssh-key        installs 1password ssh keys into target .ssh ${tty_dim}[default: ${SSH_KEYS_CSV_DISPLAY}]${tty_reset}
  --op-token       1password service account token ${tty_dim}[default: ${OP_TOKEN_DISPLAY}]${tty_reset}
  --target         installs dotpkgs and identities relative to here ${tty_dim}[default: ${TARGET}]${tty_reset}
  --version        shows version of this script
  --debug          shows debug messages
  -h, --help       displays this help message
  -y, --yes        runs with all defaults and no prompts, sets NONINTERACTIVE=1

${tty_tp}Environment Variables:${tty_reset}
  TANAAB_BREWFILE  comma-separated list of brewfiles to install
  TANAAB_DOTPKG    comma-separated list of stow package paths to install
  TANAAB_SSH_KEY   comma-separated list of 1password ssh keys as vault/item[:filename]
  TANAAB_OP_TOKEN  1password service account token; falls back to OP_SERVICE_ACCOUNT_TOKEN
  TANAAB_TARGET    target directory for dotpkgs and identities
  TANAAB_FORCE     set to a truthy value to force supported operations
  TANAAB_DEBUG     set to a truthy value to show debug messages
  NONINTERACTIVE   installs without prompting for user input
  CI               installs in CI mode (e.g. does not prompt for user input)
EOS
  if [[ "${1:-0}" != "noexit" ]]; then
    exit "${1:-0}"
  fi
}

show_version() {
  # @TODO: consolidate this with similar usage further down
  if [[ -z "${SCRIPT_VERSION-}" ]]; then
    SCRIPT_VERSION="$(git describe --tags --always --abbrev=1)"
  fi

  printf "%s\n" "$SCRIPT_VERSION"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --brewfile)
      append_array_value BREWFILES "$2"
      shift 2
      ;;
    --brewfile=*)
      append_array_value BREWFILES "${1#*=}"
      shift
      ;;
    --brewfiles)
      append_csv_to_array BREWFILES "$2"
      shift 2
      ;;
    --brewfiles=*)
      append_csv_to_array BREWFILES "${1#*=}"
      shift
      ;;
    --dotpkg)
      append_array_value DOTPKGS "$2"
      shift 2
      ;;
    --dotpkg=*)
      append_array_value DOTPKGS "${1#*=}"
      shift
      ;;
    --dotpkgs)
      append_csv_to_array DOTPKGS "$2"
      shift 2
      ;;
    --dotpkgs=*)
      append_csv_to_array DOTPKGS "${1#*=}"
      shift
      ;;
    --ssh-key)
      append_array_value SSH_KEYS "$2"
      shift 2
      ;;
    --ssh-key=*)
      append_array_value SSH_KEYS "${1#*=}"
      shift
      ;;
    --ssh-keys)
      append_csv_to_array SSH_KEYS "$2"
      shift 2
      ;;
    --ssh-keys=*)
      append_csv_to_array SSH_KEYS "${1#*=}"
      shift
      ;;
    --op-token)
      OP_TOKEN="$2"
      shift 2
      ;;
    --op-token=*)
      OP_TOKEN="${1#*=}"
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

brewfile_is_url() {
  [[ "$1" =~ ^[[:alpha:]][[:alnum:].+-]*:// ]]
}

normalize_local_path() {
  local path="$1"
  local path_dir="."
  local path_name="$path"
  local base_dir
  local resolved_dir

  if [[ "${path}" == */* ]]; then
    path_dir="${path%/*}"
    path_name="${path##*/}"
  fi

  if [[ "${path}" == /* ]]; then
    base_dir="${path_dir}"
  else
    base_dir="${PWD}/${path_dir}"
  fi

  if [[ -d "${base_dir}" ]]; then
    resolved_dir="$(cd "${base_dir}" 2>/dev/null && pwd -P)"
  else
    resolved_dir=""
  fi

  if [[ -n "${resolved_dir}" ]]; then
    printf "%s/%s" "${resolved_dir}" "${path_name}"
  elif [[ "${path}" == /* ]]; then
    printf "%s" "${path}"
  else
    printf "%s/%s" "${PWD}" "${path}"
  fi
}

normalize_brewfile() {
  local brewfile="$1"

  if brewfile_is_url "${brewfile}"; then
    printf "%s" "${brewfile}"
  else
    normalize_local_path "${brewfile}"
  fi
}

normalize_brewfiles() {
  local brewfile
  local normalized
  local -a normalized_brewfiles=()

  if [[ "${#BREWFILES[@]}" -eq 0 ]]; then
    return 0
  fi

  for brewfile in "${BREWFILES[@]}"; do
    normalized="$(normalize_brewfile "${brewfile}")"
    normalized_brewfiles+=("${normalized}")
  done

  BREWFILES=("${normalized_brewfiles[@]}")
}

validate_brewfiles() {
  local brewfile

  if [[ "${#BREWFILES[@]}" -eq 0 ]]; then
    return 0
  fi

  for brewfile in "${BREWFILES[@]}"; do
    if brewfile_is_url "${brewfile}"; then
      continue
    fi

    if [[ ! -f "${brewfile}" ]]; then
      abort "brewfile not found: ${brewfile}"
    fi
  done
}

normalize_dotpkg() {
  local dotpkg="$1"

  if [[ -d "${dotpkg}" ]]; then
    (
      cd "${dotpkg}" 2>/dev/null || exit 1
      pwd -P
    )
  elif [[ "${dotpkg}" == /* ]]; then
    printf "%s" "${dotpkg}"
  else
    printf "%s/%s" "${PWD}" "${dotpkg}"
  fi
}

normalize_dotpkgs() {
  local dotpkg
  local normalized
  local -a normalized_dotpkgs=()

  if [[ "${#DOTPKGS[@]}" -eq 0 ]]; then
    return 0
  fi

  for dotpkg in "${DOTPKGS[@]}"; do
    normalized="$(normalize_dotpkg "${dotpkg}")"
    normalized_dotpkgs+=("${normalized}")
  done

  DOTPKGS=("${normalized_dotpkgs[@]}")
}

validate_dotpkgs() {
  local dotpkg

  if [[ "${#DOTPKGS[@]}" -eq 0 ]]; then
    return 0
  fi

  for dotpkg in "${DOTPKGS[@]}"; do
    if [[ ! -d "${dotpkg}" ]]; then
      abort "dot package not found: ${dotpkg}"
    fi
  done
}

ssh_key_spec_base() {
  local ssh_key="$1"

  printf "%s" "${ssh_key%%:*}"
}

ssh_key_spec_filename_override() {
  local ssh_key="$1"

  if [[ "${ssh_key}" == *:* ]]; then
    printf "%s" "${ssh_key#*:}"
  fi
}

ssh_key_spec_vault() {
  local base

  base="$(ssh_key_spec_base "$1")"
  printf "%s" "${base%%/*}"
}

ssh_key_spec_item() {
  local base

  base="$(ssh_key_spec_base "$1")"
  printf "%s" "${base#*/}"
}

ssh_key_filename() {
  local filename_override

  filename_override="$(ssh_key_spec_filename_override "$1")"
  if [[ -n "${filename_override}" ]]; then
    printf "%s" "${filename_override}"
  else
    ssh_key_spec_item "$1"
  fi
}

ssh_key_secret_ref() {
  local vault
  local item

  vault="$(ssh_key_spec_vault "$1")"
  item="$(ssh_key_spec_item "$1")"
  printf "op://%s/%s/private key?ssh-format=openssh" "${vault}" "${item}"
}

ssh_key_destination_path() {
  local filename

  filename="$(ssh_key_filename "$1")"
  printf "%s/.ssh/%s" "${TARGET}" "${filename}"
}

validate_ssh_key_spec() {
  local ssh_key="$1"
  local base
  local vault
  local item
  local filename_override

  base="$(ssh_key_spec_base "${ssh_key}")"
  vault="$(ssh_key_spec_vault "${ssh_key}")"
  item="$(ssh_key_spec_item "${ssh_key}")"
  filename_override="$(ssh_key_spec_filename_override "${ssh_key}")"

  if [[ -z "${base}" ]] || [[ "${base}" != */* ]] || [[ -z "${vault}" ]] || [[ -z "${item}" ]] || [[ "${item}" == *"/"* ]]; then
    abort "ssh key must use vault/item[:filename] format: ${ssh_key}"
  fi

  if [[ "${ssh_key}" == *:* ]] && [[ -z "${filename_override}" ]]; then
    abort "ssh key filename override cannot be empty: ${ssh_key}"
  fi

  if [[ -n "${filename_override}" ]] && [[ "${filename_override}" == *"/"* || "${filename_override}" == *":"* || "${filename_override}" == "." || "${filename_override}" == ".." ]]; then
    abort "ssh key filename override must be a single filename: ${ssh_key}"
  fi
}

validate_ssh_keys() {
  local ssh_key
  local filename
  local -a seen_filenames=()

  if [[ "${#SSH_KEYS[@]}" -eq 0 ]]; then
    return 0
  fi

  for ssh_key in "${SSH_KEYS[@]}"; do
    validate_ssh_key_spec "${ssh_key}"

    filename="$(ssh_key_filename "${ssh_key}")"
    if array_contains "${filename}" seen_filenames; then
      abort "ssh key destination filename is duplicated: ${filename}"
    fi

    seen_filenames+=("${filename}")
  done
}

TARGET="$(normalize_local_path "${TARGET}")"
normalize_brewfiles
validate_brewfiles
normalize_dotpkgs
validate_dotpkgs
validate_ssh_keys
BREWFILES_CSV="$(array_join "," BREWFILES)"
DOTPKGS_CSV="$(array_join "," DOTPKGS)"
SSH_KEYS_CSV="$(array_join "," SSH_KEYS)"

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
  if [[ "${os}" == "Darwin" ]]; then
    DETECTED_OS="macos"
  else
    DETECTED_OS="${os}"
  fi
}

default_homebrew_prefix() {
  local arch="$1"

  if [[ "${arch}" == "arm64" ]]; then
    echo "/opt/homebrew"
  else
    echo "/usr/local"
  fi
}

# @TODO: do we want to also allow for also just dotfile?
# DOTPKGS="${TANAAB_DOTPKGS-"ai,git,ssh"}"

# core packages that should be present regardless of any user-provided Brewfile
declare -a TANAAB_CORE_BREW_PACKAGES=(
  "formula|git|git"
  "cask|1password-cli|op"
  "formula|curl|curl"
  "formula|zsh|zsh"
  "formula|jq|jq"
  "formula|stow|stow"
)

# @TODO: we need to make sure this is masked in any display
# OP_AUTH="${TANAAB_OP_AUTH:-$OP_TOKEN}"

# GET THE LTF right away once we know we are not exiting through usage/version.
TANAAB_TMPFILE="$(mktemp -t tanaab.XXXXXX)"

# derive the rest of the runtime defaults after argument parsing
detect_arch
detect_os

ARCH="${TANAAB_ARCH:-"$DETECTED_ARCH"}"
OS="${TANAAB_OS:-"$DETECTED_OS"}"
HOMEBREW_PREFIX="${HOMEBREW_PREFIX:-"$(default_homebrew_prefix "$ARCH")"}"
HOMEBREW_INSTALLER_URL="https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh"
TANAAB_TMPDIR=$(get_abs_dir "$TANAAB_TMPFILE")

# USER isn't always set so provide a fall back for the installer and subprocesses.
if [[ -z "${USER-}" ]]; then
  USER="$(chomp "$(id -un)")"
  export USER
fi

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

value_enabled() {
  case "${1:-}" in
    '' | 0 | false | FALSE | False | no | NO | No | off | OFF | Off)
      return 1
      ;;
    *)
      return 0
      ;;
  esac
}

debug_enabled() {
  value_enabled "${DEBUG:-}"
}

force_enabled() {
  value_enabled "${FORCE:-}"
}

# set debug-related envvars for child processes
if debug_enabled; then
  export HOMEBREW_DEBUG=1
fi

debug() {
  if debug_enabled; then
    printf "${tty_dim}debug${tty_reset} %s\n" "$(shell_join "$@")" >&2
  fi
}

# shellcheck disable=SC2329
debug_multi() {
  if debug_enabled; then
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
debug raw BREWFILES="$(array_join "," BREWFILES)"
debug raw DOTPKGS="$(array_join "," DOTPKGS)"
debug raw DEBUG="$DEBUG"
debug raw FORCE="$FORCE"
debug raw SSH_KEYS="$(array_join "," SSH_KEYS)"
debug raw OP_TOKEN="${OP_TOKEN_DISPLAY}"
debug raw HOMEBREW_PREFIX="$HOMEBREW_PREFIX"
debug raw TARGET="$TARGET"
debug raw OS="$OS"
debug raw USER="$USER"
debug raw TMPFILE="$TANAAB_TMPFILE"
debug raw TMPDIR="$TANAAB_TMPDIR"

#######################################################################  tool-verification

# precautions
unset HAVE_SUDO_ACCESS
unset BREW
unset OP_CLI
unset BREW_NEEDS_INSTALL
unset BREWFILES_NEED_INSTALL
unset SSH_KEYS_NEED_INSTALL
unset DOTPKGS_NEED_STOW
unset EFFECTIVE_BREWFILE
unset DOTPKG_BACKUP_DIR
unset STOW

declare -a PLANNED_ACTIONS=()
declare -a CORE_BREW_FORMULAS_TO_INSTALL=()
declare -a CORE_BREW_CASKS_TO_INSTALL=()
declare -a CORE_BREW_CASK_DISPLAY_TO_INSTALL=()
declare -a CORE_BREW_DISPLAY_TO_INSTALL=()
declare -a RESOLVED_BREWFILES=()
declare -a SSH_KEY_DISPLAY_TO_INSTALL=()
declare -a SSH_KEY_DISPLAY_TO_OVERWRITE=()
declare -a DOTPKGS_TO_STOW=()
declare -a DOTPKG_CONFLICT_TARGETS=()
declare -a CURRENT_DOTPKG_CONFLICT_TARGETS=()

plan_action() {
  PLANNED_ACTIONS+=("$1")
}

have_planned_actions() {
  [[ "${#PLANNED_ACTIONS[@]}" -gt 0 ]]
}

show_planned_actions() {
  if ! have_planned_actions; then
    return 0
  fi

  log "${tty_bold}this script is about to:${tty_reset}"
  log

  local action
  for action in "${PLANNED_ACTIONS[@]}"; do
    log "  - ${action}"
  done
}

finish_noop() {
  log "${tty_bold}nothing to do${tty_reset}. ${tty_green}no changes are needed right now${tty_reset}."
  exit 0
}

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

# shellcheck disable=SC2329
test_brew() {
  if [[ ! -x "$1" ]]; then
    return 1
  fi

  "$1" --version &>/dev/null
}

# shellcheck disable=SC2329
test_stow() {
  if [[ ! -x "$1" ]]; then
    return 1
  fi

  "$1" --version &>/dev/null
}

# shellcheck disable=SC2329
test_op() {
  if [[ ! -x "$1" ]]; then
    return 1
  fi

  "$1" --version &>/dev/null
}

brew_formula_installed() {
  "${BREW}" list --formula "$1" &>/dev/null
}

brew_cask_installed() {
  "${BREW}" list --cask "$1" &>/dev/null
}

find_first_existing_parent() {
  dir="$1"

  while [[ ! -d "$dir" ]]; do
    dir=$(dirname "$dir")
  done

  echo "$dir"
}

find_homebrew() {
  local candidate
  local -a candidates=()

  if [[ -n "${HOMEBREW_PREFIX-}" ]]; then
    candidates+=("${HOMEBREW_PREFIX}/bin/brew")
  fi

  candidates+=("/opt/homebrew/bin/brew" "/usr/local/bin/brew")

  for candidate in "${candidates[@]}"; do
    if test_brew "${candidate}"; then
      echo "${candidate}"
      return 0
    fi
  done

  find_tool brew
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

load_homebrew_shellenv() {
  local brew="$1"

  eval "$("${brew}" shellenv)"
  HOMEBREW_PREFIX="$("${brew}" --prefix)"
  BREW="${brew}"
}

queue_core_brew_package() {
  local type="$1"
  local package="$2"
  local display="$3"

  CORE_BREW_DISPLAY_TO_INSTALL+=("${display}")

  if [[ "${type}" == "formula" ]]; then
    CORE_BREW_FORMULAS_TO_INSTALL+=("${package}")
  elif [[ "${type}" == "cask" ]]; then
    CORE_BREW_CASKS_TO_INSTALL+=("${package}")
    CORE_BREW_CASK_DISPLAY_TO_INSTALL+=("${display}")
  else
    abort "unknown core homebrew package type: ${type}"
  fi
}

plan_homebrew() {
  BREW="$(find_homebrew || true)"

  if [[ -n "${BREW}" ]]; then
    load_homebrew_shellenv "${BREW}"
    debug "using Homebrew at ${BREW}"
    return 0
  fi

  BREW_NEEDS_INSTALL="1"
  plan_action "${tty_tp}install${tty_reset} ${tty_ts}homebrew${tty_reset} ${tty_dim}using the official installer (expected prefix: ${tty_ts}${HOMEBREW_PREFIX}${tty_dim})${tty_reset}"
}

install_homebrew() {
  local installer="${TANAAB_TMPDIR}/homebrew-install.sh"

  log "${tty_tp}installing${tty_reset} ${tty_ts}homebrew${tty_reset} ${tty_dim}because it is not installed${tty_reset}"
  execute "${CURL}" \
    --fail \
    --location \
    --silent \
    --show-error \
    --output "${installer}" \
    "${HOMEBREW_INSTALLER_URL}"
  execute chmod +x "${installer}"

  if [[ -n "${NONINTERACTIVE-}" ]]; then
    execute env NONINTERACTIVE=1 CI="${CI:-1}" /bin/bash "${installer}"
  else
    execute env NONINTERACTIVE=1 /bin/bash "${installer}"
  fi

  BREW="$(find_homebrew || true)"
  if [[ -z "${BREW}" ]]; then
    abort "homebrew install finished but \`brew\` could not be found afterwards."
  fi

  load_homebrew_shellenv "${BREW}"
  log "${tty_bold}installed${tty_reset} ${tty_green}homebrew${tty_reset}"
  debug "using Homebrew at ${BREW}"
}

plan_core_homebrew_packages() {
  local entry
  local type
  local package
  local display

  CORE_BREW_FORMULAS_TO_INSTALL=()
  CORE_BREW_CASKS_TO_INSTALL=()
  CORE_BREW_CASK_DISPLAY_TO_INSTALL=()
  CORE_BREW_DISPLAY_TO_INSTALL=()

  for entry in "${TANAAB_CORE_BREW_PACKAGES[@]}"; do
    IFS='|' read -r type package display <<< "${entry}"

    if [[ "${BREW_NEEDS_INSTALL:-0}" == "1" ]]; then
      queue_core_brew_package "${type}" "${package}" "${display}"
    elif [[ "${type}" == "formula" ]] && ! brew_formula_installed "${package}"; then
      queue_core_brew_package "${type}" "${package}" "${display}"
    elif [[ "${type}" == "cask" ]] && ! brew_cask_installed "${package}"; then
      queue_core_brew_package "${type}" "${package}" "${display}"
    fi
  done

  if [[ "${#CORE_BREW_DISPLAY_TO_INSTALL[@]}" -gt 0 ]]; then
    plan_action "${tty_tp}install${tty_reset} core homebrew packages: ${tty_ts}$(array_join ", " CORE_BREW_DISPLAY_TO_INSTALL)${tty_reset}"
  fi
}

install_core_homebrew_packages() {
  if [[ "${#CORE_BREW_FORMULAS_TO_INSTALL[@]}" -gt 0 ]]; then
    log "${tty_tp}installing${tty_reset} ${tty_dim}core homebrew formulas:${tty_reset} ${tty_ts}$(array_join ", " CORE_BREW_FORMULAS_TO_INSTALL)${tty_reset}"
    execute "${BREW}" install "${CORE_BREW_FORMULAS_TO_INSTALL[@]}"
  fi

  if [[ "${#CORE_BREW_CASKS_TO_INSTALL[@]}" -gt 0 ]]; then
    log "${tty_tp}installing${tty_reset} ${tty_dim}core homebrew casks:${tty_reset} ${tty_ts}$(array_join ", " CORE_BREW_CASK_DISPLAY_TO_INSTALL)${tty_reset}"
    execute "${BREW}" install --cask "${CORE_BREW_CASKS_TO_INSTALL[@]}"
  fi
}

fetch_brewfile_url() {
  local url="$1"
  local destination

  destination="$(mktemp "${TANAAB_TMPDIR}/brewfile-url.XXXXXX")"
  debug "fetching brewfile ${url} to ${destination}"

  if ! "${CURL}" \
    --fail \
    --location \
    --silent \
    --show-error \
    --output "${destination}" \
    "${url}"; then
    abort "failed to fetch brewfile: ${url}"
  fi

  printf "%s" "${destination}"
}

resolve_brewfile_source() {
  local brewfile="$1"

  if brewfile_is_url "${brewfile}"; then
    fetch_brewfile_url "${brewfile}"
  else
    printf "%s" "${brewfile}"
  fi
}

resolve_brewfiles() {
  local brewfile
  local resolved_brewfile

  RESOLVED_BREWFILES=()

  if [[ "${#BREWFILES[@]}" -eq 0 ]]; then
    return 0
  fi

  for brewfile in "${BREWFILES[@]}"; do
    resolved_brewfile="$(resolve_brewfile_source "${brewfile}")"
    RESOLVED_BREWFILES+=("${resolved_brewfile}")
  done
}

prepare_effective_brewfile() {
  local source_brewfile
  local effective_brewfile

  EFFECTIVE_BREWFILE=""

  if [[ "${#RESOLVED_BREWFILES[@]}" -eq 0 ]]; then
    return 0
  fi

  effective_brewfile="$(mktemp "${TANAAB_TMPDIR}/brewfile-effective.XXXXXX")"
  : > "${effective_brewfile}"

  for source_brewfile in "${RESOLVED_BREWFILES[@]}"; do
    if [[ ! -f "${source_brewfile}" ]] || [[ ! -s "${source_brewfile}" ]]; then
      continue
    fi

    {
      printf "# source: %s\n" "${source_brewfile}"
      cat "${source_brewfile}"
      printf "\n"
    } >> "${effective_brewfile}"
  done

  EFFECTIVE_BREWFILE="${effective_brewfile}"
  debug "prepared effective brewfile at ${EFFECTIVE_BREWFILE}"
}

brewfile_has_entries() {
  if [[ -z "${1:-}" ]] || [[ ! -f "$1" ]]; then
    return 1
  fi

  grep -Eq '^[[:space:]]*[^#[:space:]]' "$1"
}

brew_bundle_check() {
  local brewfile="$1"
  local status

  "${BREW}" bundle check --file "${brewfile}" --no-upgrade >/dev/null 2>&1
  status="$?"

  if [[ "${status}" -eq 0 ]]; then
    return 0
  fi

  if [[ "${status}" -eq 1 ]]; then
    return 1
  fi

  abort "failed to check brew bundle state for ${brewfile}"
}

plan_brewfiles() {
  BREWFILES_NEED_INSTALL=""

  if [[ "${#BREWFILES[@]}" -eq 0 ]]; then
    return 0
  fi

  resolve_brewfiles
  prepare_effective_brewfile

  if ! brewfile_has_entries "${EFFECTIVE_BREWFILE:-}"; then
    debug "skipping brewfile install because there are no brew bundle entries"
    return 0
  fi

  if [[ "${BREW_NEEDS_INSTALL:-0}" == "1" ]]; then
    BREWFILES_NEED_INSTALL="1"
  elif ! brew_bundle_check "${EFFECTIVE_BREWFILE}"; then
    BREWFILES_NEED_INSTALL="1"
  fi

  if [[ -n "${BREWFILES_NEED_INSTALL:-}" ]]; then
    plan_action "${tty_tp}install${tty_reset} brewfile packages from: ${tty_ts}$(array_join ", " BREWFILES)${tty_reset}"
  fi
}

install_brewfiles() {
  if [[ -z "${BREWFILES_NEED_INSTALL:-}" ]]; then
    return 0
  fi

  if ! brewfile_has_entries "${EFFECTIVE_BREWFILE:-}"; then
    return 0
  fi

  if brew_bundle_check "${EFFECTIVE_BREWFILE}"; then
    debug "brewfile packages are already installed"
    return 0
  fi

  log "${tty_tp}installing${tty_reset} ${tty_dim}brewfile packages from:${tty_reset} ${tty_ts}$(array_join ", " BREWFILES)${tty_reset}"
  execute "${BREW}" bundle install --file "${EFFECTIVE_BREWFILE}" --no-upgrade
}

ensure_stow() {
  if [[ -n "${STOW:-}" ]] && test_stow "${STOW}"; then
    return 0
  fi

  STOW="$(find_tool stow || true)"
  [[ -n "${STOW}" ]]
}

ensure_op() {
  if [[ -n "${OP_CLI:-}" ]] && test_op "${OP_CLI}"; then
    return 0
  fi

  OP_CLI="$(find_tool op || true)"
  [[ -n "${OP_CLI}" ]]
}

ssh_dir_path() {
  printf "%s/.ssh" "${TARGET}"
}

ssh_dir_ready_for_private_keys() {
  local ssh_dir

  ssh_dir="$(ssh_dir_path)"

  if [[ -L "${ssh_dir}" ]]; then
    abort_multi "$(cat <<EOABORT
ssh key installation target is a symlinked directory: ${ssh_dir}
refusing to write private keys through a symlink. replace it with a real directory first.
EOABORT
)"
  fi

  if [[ -e "${ssh_dir}" ]] && [[ ! -d "${ssh_dir}" ]]; then
    abort "ssh key installation target exists but is not a directory: ${ssh_dir}"
  fi
}

op_read_ssh_key_to_file() {
  local ssh_key="$1"
  local destination="$2"
  local secret_ref
  local ssh_key_base

  secret_ref="$(ssh_key_secret_ref "${ssh_key}")"
  ssh_key_base="$(ssh_key_spec_base "${ssh_key}")"
  debug "${tty_blue}running${tty_reset}" "${OP_CLI}" read "${secret_ref}" ">" "${destination}"

  if ! (
    umask 077
    /usr/bin/env \
      -u OP_CONNECT_HOST \
      -u OP_CONNECT_TOKEN \
      OP_SERVICE_ACCOUNT_TOKEN="${OP_TOKEN}" \
      "${OP_CLI}" read "${secret_ref}" > "${destination}"
  ); then
    abort "failed to read ssh key from 1password: ${ssh_key_base}"
  fi

  if [[ ! -s "${destination}" ]]; then
    abort "1password returned an empty ssh key: ${ssh_key_base}"
  fi
}

plan_ssh_keys() {
  local ssh_key
  local ssh_dir
  local destination_path
  local filename

  SSH_KEYS_NEED_INSTALL=""
  SSH_KEY_DISPLAY_TO_INSTALL=()
  SSH_KEY_DISPLAY_TO_OVERWRITE=()

  if [[ "${#SSH_KEYS[@]}" -eq 0 ]]; then
    return 0
  fi

  if [[ -z "${OP_TOKEN:-}" ]]; then
    abort_multi "$(cat <<EOABORT
ssh key installation requires a 1password service account token.
set TANAAB_OP_TOKEN or OP_SERVICE_ACCOUNT_TOKEN, or pass --op-token.
EOABORT
)"
  fi

  ssh_dir_ready_for_private_keys
  ssh_dir="$(ssh_dir_path)"

  for ssh_key in "${SSH_KEYS[@]}"; do
    filename="$(ssh_key_filename "${ssh_key}")"
    destination_path="$(ssh_key_destination_path "${ssh_key}")"
    append_unique_array_value SSH_KEY_DISPLAY_TO_INSTALL "${filename}"

    if [[ -e "${destination_path}" ]] || [[ -L "${destination_path}" ]]; then
      if [[ -d "${destination_path}" ]] && [[ ! -L "${destination_path}" ]]; then
        abort "ssh key destination exists as a directory: ${destination_path}"
      fi

      if ! force_enabled; then
        abort_multi "$(cat <<EOABORT
ssh key already exists: ${destination_path}
remove or back up the existing key first, or rerun with --force to overwrite it.
EOABORT
)"
      fi

      append_unique_array_value SSH_KEY_DISPLAY_TO_OVERWRITE "${filename}"
    fi
  done

  if [[ "${#SSH_KEY_DISPLAY_TO_INSTALL[@]}" -eq 0 ]]; then
    return 0
  fi

  SSH_KEYS_NEED_INSTALL="1"

  if [[ "${#SSH_KEY_DISPLAY_TO_OVERWRITE[@]}" -gt 0 ]]; then
    plan_action "${tty_tp}install${tty_reset} ssh keys into ${tty_ts}${ssh_dir}${tty_reset}: ${tty_ts}$(array_join ", " SSH_KEY_DISPLAY_TO_INSTALL)${tty_reset} ${tty_dim}(overwriting: $(array_join ", " SSH_KEY_DISPLAY_TO_OVERWRITE))${tty_reset}"
  else
    plan_action "${tty_tp}install${tty_reset} ssh keys into ${tty_ts}${ssh_dir}${tty_reset}: ${tty_ts}$(array_join ", " SSH_KEY_DISPLAY_TO_INSTALL)${tty_reset}"
  fi
}

install_ssh_keys() {
  local ssh_key
  local ssh_dir
  local destination_path
  local filename
  local key_tmpfile
  local installed_any="1"

  if [[ -z "${SSH_KEYS_NEED_INSTALL:-}" ]]; then
    return 0
  fi

  if ! ensure_op; then
    abort "1password cli is required for ssh key installation but could not be found."
  fi

  ssh_dir_ready_for_private_keys
  ssh_dir="$(ssh_dir_path)"
  auto_mkdirp "${ssh_dir}"
  auto_chmod 700 "${ssh_dir}"

  for ssh_key in "${SSH_KEYS[@]}"; do
    filename="$(ssh_key_filename "${ssh_key}")"
    destination_path="$(ssh_key_destination_path "${ssh_key}")"

    if [[ -e "${destination_path}" ]] || [[ -L "${destination_path}" ]]; then
      if [[ -d "${destination_path}" ]] && [[ ! -L "${destination_path}" ]]; then
        abort "ssh key destination exists as a directory: ${destination_path}"
      fi

      if ! force_enabled; then
        abort_multi "$(cat <<EOABORT
ssh key already exists: ${destination_path}
remove or back up the existing key first, or rerun with --force to overwrite it.
EOABORT
)"
      fi

      log "${tty_tp}installing${tty_reset} ssh key ${tty_ts}${filename}${tty_reset} ${tty_dim}into${tty_reset} ${tty_ts}${ssh_dir}${tty_reset} ${tty_dim}(overwriting existing key)${tty_reset}"
      auto_rm "${destination_path}"
    else
      log "${tty_tp}installing${tty_reset} ssh key ${tty_ts}${filename}${tty_reset} ${tty_dim}into${tty_reset} ${tty_ts}${ssh_dir}${tty_reset}"
    fi

    key_tmpfile="$(mktemp "${TANAAB_TMPDIR}/ssh-key.XXXXXX")"
    op_read_ssh_key_to_file "${ssh_key}" "${key_tmpfile}"
    auto_mv "${key_tmpfile}" "${destination_path}"
    auto_chmod 600 "${destination_path}"
    installed_any="0"
  done

  if [[ "${installed_any}" -eq 1 ]]; then
    return 0
  fi

  log "${tty_bold}installed${tty_reset} ssh keys into ${tty_green}${ssh_dir}${tty_reset}"
}

timestamp_now() {
  /bin/date +"%Y%m%d-%H%M%S"
}

simulate_dotpkg() {
  local dotpkg="$1"
  local dotpkg_parent
  local dotpkg_name

  dotpkg_parent="$(dirname "${dotpkg}")"
  dotpkg_name="$(basename "${dotpkg}")"

  "${STOW}" \
    --simulate \
    --verbose=1 \
    --dir "${dotpkg_parent}" \
    --target "${TARGET}" \
    "${dotpkg_name}" 2>&1
}

strip_stow_simulation_noise() {
  local output="$1"
  local line

  while IFS= read -r line; do
    if [[ "${line}" == "WARNING: in simulation mode so not modifying filesystem." ]]; then
      continue
    fi

    printf "%s\n" "${line}"
  done <<< "${output}"
}

stow_output_has_conflicts() {
  [[ "$1" == *"would cause conflicts:"* ]] || [[ "$1" == *" existing target "* ]]
}

extract_dotpkg_conflict_target() {
  local line="$1"
  local conflict_target=""

  if [[ "${line}" == *" existing target "* ]] && [[ "${line}" == *" since "* ]]; then
    conflict_target="${line#* existing target }"
    conflict_target="${conflict_target%% since *}"
  elif [[ "${line}" == *"existing target is not owned by stow:"* ]]; then
    conflict_target="${line##*: }"
  elif [[ "${line}" == *"existing target is stowed to a different package:"* ]]; then
    conflict_target="${line##*: }"
    conflict_target="${conflict_target%% => *}"
  fi

  printf "%s" "${conflict_target}"
}

collect_dotpkg_conflicts() {
  local array_name="$1"
  local output="$2"
  local line
  local conflict_target
  local found="1"

  while IFS= read -r line; do
    conflict_target="$(extract_dotpkg_conflict_target "${line}")"
    if [[ -n "${conflict_target}" ]]; then
      append_unique_array_value "${array_name}" "${conflict_target}"
      found="0"
    fi
  done <<< "${output}"

  return "${found}"
}

evaluate_dotpkg() {
  local dotpkg="$1"
  local simulate_output
  local cleaned_output
  local simulate_status

  CURRENT_DOTPKG_NEEDS_STOW=""
  CURRENT_DOTPKG_CONFLICT_TARGETS=()

  simulate_output="$(simulate_dotpkg "${dotpkg}")"
  simulate_status="$?"
  cleaned_output="$(strip_stow_simulation_noise "${simulate_output}")"

  if [[ -n "${cleaned_output}" ]]; then
    debug_multi "stow simulate ${dotpkg}:" "${cleaned_output}"
  fi

  if [[ "${simulate_status}" -eq 0 ]]; then
    if [[ -n "${cleaned_output}" ]]; then
      CURRENT_DOTPKG_NEEDS_STOW="1"
    fi
    return 0
  fi

  if [[ "${simulate_status}" -eq 1 ]] && stow_output_has_conflicts "${cleaned_output}"; then
    if ! collect_dotpkg_conflicts CURRENT_DOTPKG_CONFLICT_TARGETS "${cleaned_output}"; then
      abort_multi "$(cat <<EOABORT
failed to determine which files need backup for dot package: ${dotpkg}
${cleaned_output:-${simulate_output}}
EOABORT
)"
    fi

    CURRENT_DOTPKG_NEEDS_STOW="1"
    return 0
  fi

  abort_multi "$(cat <<EOABORT
failed to simulate stow for dot package: ${dotpkg}
${cleaned_output:-${simulate_output}}
EOABORT
)"
}

evaluate_dotpkgs() {
  local dotpkg
  local conflict_target

  DOTPKGS_TO_STOW=()
  DOTPKG_CONFLICT_TARGETS=()

  if [[ "${#DOTPKGS[@]}" -eq 0 ]]; then
    return 0
  fi

  if [[ ! -d "${TARGET}" ]]; then
    DOTPKGS_TO_STOW=("${DOTPKGS[@]}")
    return 0
  fi

  if ! ensure_stow; then
    return 1
  fi

  for dotpkg in "${DOTPKGS[@]}"; do
    evaluate_dotpkg "${dotpkg}"

    if [[ -n "${CURRENT_DOTPKG_NEEDS_STOW:-}" ]]; then
      append_unique_array_value DOTPKGS_TO_STOW "${dotpkg}"
      if [[ "${#CURRENT_DOTPKG_CONFLICT_TARGETS[@]}" -gt 0 ]]; then
        for conflict_target in "${CURRENT_DOTPKG_CONFLICT_TARGETS[@]}"; do
          append_unique_array_value DOTPKG_CONFLICT_TARGETS "${conflict_target}"
        done
      fi
    fi
  done
}

stow_dotpkg() {
  local dotpkg="$1"
  local dotpkg_parent
  local dotpkg_name

  dotpkg_parent="$(dirname "${dotpkg}")"
  dotpkg_name="$(basename "${dotpkg}")"

  execute "${STOW}" \
    --dir "${dotpkg_parent}" \
    --target "${TARGET}" \
    "${dotpkg_name}"
}

backup_dotpkg_conflicts() {
  local conflict_target
  local source_path
  local backup_path
  local moved_any="1"

  if [[ "${#CURRENT_DOTPKG_CONFLICT_TARGETS[@]}" -eq 0 ]]; then
    return 0
  fi

  for conflict_target in "${CURRENT_DOTPKG_CONFLICT_TARGETS[@]}"; do
    source_path="${TARGET}/${conflict_target}"

    if [[ ! -e "${source_path}" ]] && [[ ! -L "${source_path}" ]]; then
      continue
    fi

    if [[ -z "${DOTPKG_BACKUP_DIR:-}" ]]; then
      DOTPKG_BACKUP_DIR="${TARGET}/.tanaab-backups/stow-$(timestamp_now)"
    fi

    backup_path="${DOTPKG_BACKUP_DIR}/${conflict_target}"
    auto_mkdirp "${DOTPKG_BACKUP_DIR}"
    auto_mkdirp "$(dirname "${backup_path}")"

    if [[ -L "${source_path}" ]] && [[ -e "${source_path}" ]]; then
      auto_cp_follow "${source_path}" "${backup_path}"
      auto_rm "${source_path}"
    else
      auto_mv "${source_path}" "${backup_path}"
    fi

    moved_any="0"
  done

  return "${moved_any}"
}

plan_dotpkgs() {
  DOTPKGS_NEED_STOW=""
  DOTPKG_BACKUP_DIR=""

  if [[ "${#DOTPKGS[@]}" -eq 0 ]]; then
    return 0
  fi

  if ! evaluate_dotpkgs; then
    DOTPKGS_TO_STOW=("${DOTPKGS[@]}")
    DOTPKG_CONFLICT_TARGETS=()
  fi

  if [[ "${#DOTPKGS_TO_STOW[@]}" -eq 0 ]]; then
    return 0
  fi

  DOTPKGS_NEED_STOW="1"

  if [[ "${#DOTPKG_CONFLICT_TARGETS[@]}" -gt 0 ]]; then
    DOTPKG_BACKUP_DIR="${TARGET}/.tanaab-backups/stow-$(timestamp_now)"
    plan_action "${tty_tp}backup${tty_reset} conflicting dotfiles to ${tty_ts}${DOTPKG_BACKUP_DIR}${tty_reset}"
  fi

  plan_action "${tty_tp}stow${tty_reset} dot packages into ${tty_ts}${TARGET}${tty_reset}: ${tty_ts}$(array_join ", " DOTPKGS_TO_STOW)${tty_reset}"
}

install_dotpkgs() {
  local dotpkg
  local stowed_any="1"
  local backed_up_conflicts="1"

  if [[ -z "${DOTPKGS_NEED_STOW:-}" ]]; then
    return 0
  fi

  auto_mkdirp "${TARGET}"

  if ! ensure_stow; then
    abort "stow is required for dot package management but could not be found."
  fi

  for dotpkg in "${DOTPKGS[@]}"; do
    evaluate_dotpkg "${dotpkg}"

    if [[ -z "${CURRENT_DOTPKG_NEEDS_STOW:-}" ]]; then
      continue
    fi

    log "${tty_tp}stowing${tty_reset} ${tty_ts}${dotpkg}${tty_reset} ${tty_dim}into${tty_reset} ${tty_ts}${TARGET}${tty_reset}"

    if [[ "${#CURRENT_DOTPKG_CONFLICT_TARGETS[@]}" -gt 0 ]]; then
      if ! backup_dotpkg_conflicts; then
        abort "failed to back up conflicting dotfiles before stowing ${dotpkg}"
      fi
      backed_up_conflicts="0"
    fi

    stow_dotpkg "${dotpkg}"
    stowed_any="0"
  done

  if [[ "${stowed_any}" -eq 1 ]]; then
    debug "dot packages are already stowed"
    return 0
  fi

  if [[ -n "${DOTPKG_BACKUP_DIR:-}" ]] && [[ "${backed_up_conflicts}" -eq 0 ]]; then
    log "${tty_bold}backed up${tty_reset} conflicting dotfiles to ${tty_green}${DOTPKG_BACKUP_DIR}${tty_reset}"
  fi
}

refresh_permission_dirs() {
  HOMEBREW_PERM_DIR="$(find_first_existing_parent "$HOMEBREW_PREFIX")"
  PERM_DIR="$(find_first_existing_parent "$TARGET")"

  debug "resolved Homebrew prefix ${HOMEBREW_PREFIX} to a perm check on ${HOMEBREW_PERM_DIR}"
  debug "resolved install destination ${TARGET} to a perm check on ${PERM_DIR}"
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

####################################################################### version validation

needs_sudo() {
  if [[ ! -w "$HOMEBREW_PERM_DIR" ]] || [[ ! -w "$PERM_DIR" ]] || [[ ! -w "$TANAAB_TMPDIR" ]]; then
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

# abort if unsupported os
if [[ "${OS}" != "macos" ]]; then
  abort_multi "$(cat <<EOABORT
This script is only for ${tty_green}macOS${tty_reset}. ${tty_red}${OS}${tty_reset} is not supported!
Check the project README for current support details: ${tty_underline}${tty_magenta}https://github.com/pirog/me${tty_reset}
EOABORT
)"
fi

# abort if unsupported arch
if [[ "${ARCH}" != "x64" ]] && [[ "${ARCH}" != "arm64" ]]; then
  abort_multi "$(cat <<EOABORT
This script currently only supports ${tty_green}x64${tty_reset} and ${tty_green}arm64${tty_reset} systems.
Check the project README for current support details: ${tty_underline}${tty_magenta}https://github.com/pirog/me${tty_reset}
EOABORT
)"
fi

# abort if macos version is too low
if [[ "${OS}" == "macos" ]]; then
  macos_version="$(major_minor "$(/usr/bin/sw_vers -productVersion)")"
  if ! version_compare "${macos_version}" "${MACOS_OLDEST_SUPPORTED}"; then
    abort_multi "$(cat <<EOABORT
Your macOS version ${tty_red}${macos_version}${tty_reset} is ${tty_bold}too old${tty_reset}! Min required version is ${tty_green}${MACOS_OLDEST_SUPPORTED}${tty_reset}
Check the project README for current support details: ${tty_underline}${tty_magenta}https://github.com/pirog/me${tty_reset}
EOABORT
)"
  fi
fi

plan_homebrew
plan_core_homebrew_packages
plan_brewfiles
plan_ssh_keys
plan_dotpkgs

if ! have_planned_actions; then
  finish_noop
fi

refresh_permission_dirs

# @NOTE: in order to do what we want here does the user actually need to be a sudoer?

if needs_sudo && ! have_sudo_access; then
  abort_multi "$(cat <<EOABORT
${tty_bold}${USER}${tty_reset} cannot write to ${tty_red}${TARGET}${tty_reset} or the expected Homebrew location ${tty_red}${HOMEBREW_PREFIX}${tty_reset} and is not a ${tty_bold}sudo${tty_reset} user!
Rerun setup with a sudoer or use --target to install into a directory ${tty_bold}${USER}${tty_reset} can write to.
For more information on advanced usage rerurn with --help or check out: ${tty_underline}${tty_magenta}https://github.com/pirog/me${tty_reset}
EOABORT
)"
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
  log "${tty_bold}running${tty_reset} in ${tty_yellow}non-interactive mode${tty_reset} ${tty_dim}because \$NONINTERACTIVE is set${tty_reset}"
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
  echo "press ${tty_bold}RETURN${tty_reset}/${tty_bold}ENTER${tty_reset} to continue or any other key to abort:"
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
auto_cp_follow() {
  local source="$1"
  local dest="$2"
  local perm_dest
  perm_dest="$(find_first_existing_parent "$dest")"

  if have_sudo_access && [[ ! -w "$perm_dest" ]]; then
    execute_sudo cp -RL "$source" "$dest"
  else
    execute cp -RL "$source" "$dest"
  fi
}

# shellcheck disable=SC2329
auto_rm() {
  local path="$1"
  local perm_dir
  perm_dir="$(find_first_existing_parent "$path")"

  if have_sudo_access && [[ ! -w "$perm_dir" ]]; then
    execute_sudo rm -f "$path"
  else
    execute rm -f "$path"
  fi
}

# shellcheck disable=SC2329
auto_chmod() {
  local mode="$1"
  local path="$2"
  local perm_dir
  perm_dir="$(find_first_existing_parent "$path")"

  if have_sudo_access && [[ ! -w "$perm_dir" ]]; then
    execute_sudo chmod "${mode}" "$path"
  else
    execute chmod "${mode}" "$path"
  fi
}

# Invalidate sudo timestamp before exiting (if it wasn't active before).
if [[ -x /usr/bin/sudo ]] && ! /usr/bin/sudo -n -v 2>/dev/null; then
  trap '/usr/bin/sudo -k' EXIT
fi

# Things can fail later if `pwd` doesn't exist.
# Also sudo prints a warning message for no good reason
cd "/usr" || exit 1

# summarize planned changes only when the user can still choose to continue
if [[ -z "${NONINTERACTIVE-}" ]] && have_planned_actions; then
  show_planned_actions
  wait_for_user
fi

# flag for password here if needed
if needs_sudo; then
  log "please enter ${tty_bold}sudo${tty_reset} password:"
  execute_sudo true
fi

if [[ "${BREW_NEEDS_INSTALL:-0}" == "1" ]]; then
  install_homebrew
fi

install_core_homebrew_packages
install_brewfiles
install_ssh_keys
install_dotpkgs

# FIN!
exit 0
