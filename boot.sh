#!/bin/bash
set -euo pipefail
# bootstrap a macOS machine by delegating to the hosted bootbox entrypoint.
#
# examples:
#
#   $ ./boot.sh --op-token "$OP_TOKEN"
#   $ ./boot.sh --op-token "$OP_TOKEN" --ssh-key vmruk4ny353aly6tbom7z3v2hy/id_botbox1
#   $ DEBUG=1 ./boot.sh --op-token "$OP_TOKEN" --yes
#
# option precedence: cli options override environment variables, which override defaults.
#
# run `./boot.sh --help` for more advanced usage.

MACOS_OLDEST_SUPPORTED="26.0"
REQUIRED_CURL_VERSION="7.41.0"
BOOTBOX_URL="https://bootbox.tanaab.sh/bootbox.sh"
DEFAULT_SSH_KEY="vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_bootbox"

abort() {
  printf "%serror%s: %s\n" "${tty_red-}" "${tty_reset-}" "$@" >&2
  exit 1
}

abort_multi() {
  while read -r line; do
    printf "%serror%s: %s\n" "${tty_red-}" "${tty_reset-}" "${line}" >&2
  done <<< "$@"
  exit 1
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

chomp() {
  printf "%s" "${1/"$'\n'"/}"
}

shell_join() {
  local arg

  printf "%s" "${1:-}"
  if [[ $# -eq 0 ]]; then
    return 0
  fi

  shift

  for arg in "$@"; do
    printf " "
    printf "%s" "${arg// /\ }"
  done
}

# shellcheck disable=SC2292
if [ -z "${BASH_VERSION:-}" ]; then
  abort "bash is required to interpret this script."
fi

if [[ -n "${CI-}" && -n "${INTERACTIVE-}" ]]; then
  abort "cannot run force-interactive mode in CI."
fi

# shellcheck disable=SC2016
if [[ -n "${INTERACTIVE-}" && -n "${NONINTERACTIVE-}" ]]; then
  abort 'both `$INTERACTIVE` and `$NONINTERACTIVE` are set. please unset at least one variable and try again.'
fi

if [[ -n "${POSIXLY_CORRECT+1}" ]]; then
  abort 'bash must not run in POSIX mode. please unset POSIXLY_CORRECT and try again.'
fi

if [[ -t 1 ]]; then
  tty_escape() { printf "\033[%sm" "$1"; }
else
  tty_escape() { :; }
fi

tty_mkbold() { tty_escape "1;$1"; }
tty_mkdim() { tty_escape "2;$1"; }
tty_bold="$(tty_mkbold 39)"
tty_dim="$(tty_mkdim 39)"
# shellcheck disable=SC2034 # keep the shared palette available even when a given change doesn't use green directly
tty_green="$(tty_escape 32)"
tty_magenta="$(tty_escape 35)"
tty_red="$(tty_mkbold 31)"
tty_reset="$(tty_escape 0)"
tty_underline="$(tty_escape "4;39")"
tty_yellow="$(tty_escape 33)"
tty_tp="$(tty_escape '38;2;0;200;138')"    # #00c88a
# shellcheck disable=SC2034 # reserved for future plan/action styling
tty_ts="$(tty_escape '38;2;219;39;119')"   # #db2777

SCRIPT_NAME="${0##*/}"
# Keep a single top-level assignment so release automation can stamp the entrypoint in place.
SCRIPT_VERSION="${SCRIPT_VERSION:-$(git describe --tags --always --abbrev=1 2>/dev/null || printf '%s' '0.0.0-unreleased')}"

DEBUG="${TANAAB_DEBUG:-${DEBUG:-${RUNNER_DEBUG:-}}}"
FORCE="${TANAAB_FORCE:-}"
OP_TOKEN="${TANAAB_OP_TOKEN:-${OP_SERVICE_ACCOUNT_TOKEN:-}}"
SSH_KEYS_CSV="${TANAAB_SSH_KEY:-${DEFAULT_SSH_KEY}}"
declare -a ORIGINAL_ARGS=("$@")
declare -a SSH_KEYS=()
declare -a SSH_KEYS_TO_INSTALL=()
declare -a SSH_KEYS_TO_OVERWRITE=()
declare -a SSH_KEYS_TO_SKIP=()
declare -a PLANNED_ACTIONS=()
BOOT_TMPDIR=""
BOOTBOX_SCRIPT_PATH=""
CORE_NEEDS_REMEDIATION="0"
CURL=""
DETECTED_ARCH=""
DETECTED_OS=""
ARCH=""
OS=""

if [[ -n "${TANAAB_SSH_KEYS:-}" ]]; then
  SSH_KEYS_CSV="${SSH_KEYS_CSV}${SSH_KEYS_CSV:+,}${TANAAB_SSH_KEYS}"
fi

append_csv_to_array SSH_KEYS "${SSH_KEYS_CSV}"

if [[ "${#ORIGINAL_ARGS[@]}" -gt 0 ]]; then
  for arg in "${ORIGINAL_ARGS[@]}"; do
    case "${arg}" in
      --ssh-key | --ssh-key=* | --ssh-keys | --ssh-keys=*)
        SSH_KEYS=()
        break
        ;;
    esac
  done
fi

debug_enabled() {
  value_enabled "${DEBUG:-}"
}

force_enabled() {
  value_enabled "${FORCE:-}"
}

debug() {
  if debug_enabled; then
    printf "${tty_dim}debug${tty_reset} %s\n" "$(shell_join "$@")" >&2
  fi
}

log() {
  printf "%s\n" "$(shell_join "$@")"
}

warn() {
  printf "${tty_yellow}warn${tty_reset}: %s\n" "$(chomp "$@")" >&2
}

show_version() {
  printf "%s\n" "${SCRIPT_VERSION}"
  exit 0
}

usage() {
  local debug_display="off"
  local force_display="off"
  local ssh_keys_display="none"
  local op_token_display="none"

  if debug_enabled; then
    debug_display="on"
  fi

  if force_enabled; then
    force_display="on"
  fi

  ssh_keys_display="$(array_join "," SSH_KEYS)"
  ssh_keys_display="${ssh_keys_display:-none}"

  if [[ -n "${OP_TOKEN:-}" ]]; then
    op_token_display="$(mask_secret_for_display "${OP_TOKEN}")"
  fi

  cat <<EOS
Usage: ${tty_dim}[NONINTERACTIVE=1] [CI=1]${tty_reset} ${tty_bold}${SCRIPT_NAME}${tty_reset} ${tty_dim}[options]${tty_reset}

${tty_tp}Options:${tty_reset}
  --ssh-key        installs 1password ssh keys as vault/item[:filename] ${tty_dim}[default: ${ssh_keys_display}]${tty_reset}
  --op-token       auths with 1password service account token ${tty_dim}[default: ${op_token_display}]${tty_reset}
  --version        shows version of this script
  --debug          shows debug messages ${tty_dim}[default: ${debug_display}]${tty_reset}
  --force          forces supported bootbox operations ${tty_dim}[default: ${force_display}]${tty_reset}
  -h, --help       displays this help message
  -y, --yes        runs with all defaults and no prompts, sets NONINTERACTIVE=1

${tty_tp}Environment Variables:${tty_reset}
  TANAAB_SSH_KEY      comma-separated list of 1password ssh keys as vault/item[:filename]
  TANAAB_OP_TOKEN     1password service account token; falls back to OP_SERVICE_ACCOUNT_TOKEN
  TANAAB_FORCE        set to a truthy value to force supported operations
  TANAAB_DEBUG        set to a truthy value to show debug messages
  NONINTERACTIVE      installs without prompting for user input
  CI                  installs in CI mode (e.g. does not prompt for user input)
EOS
  if [[ "${1:-0}" != "noexit" ]]; then
    exit "${1:-0}"
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --ssh-key)
        if [[ $# -lt 2 ]]; then
          usage "noexit"
          abort "option ${tty_bold}--ssh-key${tty_reset} requires a value."
        fi
        append_array_value SSH_KEYS "$2"
        shift 2
        ;;
      --ssh-key=*)
        if [[ -z "${1#*=}" ]]; then
          usage "noexit"
          abort "option ${tty_bold}--ssh-key${tty_reset} must not be empty."
        fi
        append_array_value SSH_KEYS "${1#*=}"
        shift
        ;;
      --ssh-keys)
        if [[ $# -lt 2 ]]; then
          usage "noexit"
          abort "option ${tty_bold}--ssh-keys${tty_reset} requires a value."
        fi
        append_csv_to_array SSH_KEYS "$2"
        shift 2
        ;;
      --ssh-keys=*)
        if [[ -z "${1#*=}" ]]; then
          usage "noexit"
          abort "option ${tty_bold}--ssh-keys${tty_reset} must not be empty."
        fi
        append_csv_to_array SSH_KEYS "${1#*=}"
        shift
        ;;
      --op-token)
        if [[ $# -lt 2 ]]; then
          usage "noexit"
          abort "option ${tty_bold}--op-token${tty_reset} requires a value."
        fi
        OP_TOKEN="$2"
        shift 2
        ;;
      --op-token=*)
        if [[ -z "${1#*=}" ]]; then
          usage "noexit"
          abort "option ${tty_bold}--op-token${tty_reset} must not be empty."
        fi
        OP_TOKEN="${1#*=}"
        shift
        ;;
      --debug)
        DEBUG="1"
        shift
        ;;
      --force)
        FORCE="1"
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
        abort "unrecognized option ${tty_bold}$1${tty_reset}; see usage above."
        ;;
    esac
  done
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

major_minor() {
  echo "${1%%.*}.$(
    x="${1#*.}"
    echo "${x%%.*}"
  )"
}

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

  mm_a="${mm_a#0}"
  mm_b="${mm_b#0}"

  if [ "${mm_a:-0}" -lt "${mm_b:-0}" ]; then
    return 1
  fi

  return 0
)

test_curl() {
  if [[ ! -x "$1" ]]; then
    return 1
  fi

  local curl_version_output curl_name_and_version
  curl_version_output="$("$1" --version 2>/dev/null)"
  curl_name_and_version="${curl_version_output%% (*}"
  version_compare "$(major_minor "${curl_name_and_version##* }")" "$(major_minor "${REQUIRED_CURL_VERSION}")"
}

plan_action() {
  PLANNED_ACTIONS+=("$1")
}

ssh_key_spec_base() {
  printf "%s" "${1%%:*}"
}

ssh_key_spec_filename_override() {
  if [[ "$1" == *:* ]]; then
    printf "%s" "${1#*:}"
  fi
}

ssh_key_spec_item() {
  local spec_base

  spec_base="$(ssh_key_spec_base "$1")"
  printf "%s" "${spec_base##*/}"
}

ssh_key_filename() {
  local filename_override

  filename_override="$(ssh_key_spec_filename_override "$1")"
  if [[ -n "${filename_override}" ]]; then
    printf "%s" "${filename_override}"
    return 0
  fi

  ssh_key_spec_item "$1"
}

ssh_key_target_root() {
  printf "%s" "${TANAAB_TARGET:-${HOME}}"
}

ssh_key_destination_path() {
  printf "%s/.ssh/%s" "$(ssh_key_target_root)" "$(ssh_key_filename "$1")"
}

describe_ssh_key_specs() {
  local first="1"
  local ssh_key
  local destination_path

  if [[ $# -eq 0 ]]; then
    return 0
  fi

  for ssh_key in "$@"; do
    if [[ "${first}" == "1" ]]; then
      first="0"
    else
      printf ", "
    fi

    destination_path="$(ssh_key_destination_path "${ssh_key}")"
    printf "%s ${tty_dim}->${tty_reset} ${tty_ts}%s${tty_reset}" "${ssh_key}" "${destination_path}"
  done
}

collect_ssh_key_actions() {
  local ssh_key
  local destination_path

  SSH_KEYS_TO_INSTALL=()
  SSH_KEYS_TO_OVERWRITE=()
  SSH_KEYS_TO_SKIP=()

  for ssh_key in "${SSH_KEYS[@]}"; do
    destination_path="$(ssh_key_destination_path "${ssh_key}")"

    if [[ -e "${destination_path}" ]]; then
      if force_enabled; then
        SSH_KEYS_TO_OVERWRITE+=("${ssh_key}")
      else
        SSH_KEYS_TO_SKIP+=("${ssh_key}")
      fi
    else
      SSH_KEYS_TO_INSTALL+=("${ssh_key}")
    fi
  done
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

getc() {
  local save_state
  save_state="$(/bin/stty -g)"
  /bin/stty raw -echo
  IFS='' read -r -n 1 -d '' "$@"
  /bin/stty "${save_state}"
}

wait_for_user() {
  local c

  trap 'stty sane; tput sgr0; echo; exit 1' SIGINT

  echo
  echo "press ${tty_bold}RETURN${tty_reset}/${tty_bold}ENTER${tty_reset} to continue or any other key to abort:"
  getc c
  if ! [[ "${c}" == $'\r' || "${c}" == $'\n' ]]; then
    exit 1
  fi
}

execute() {
  debug "${tty_tp}running${tty_reset}" "$@"
  if ! "$@"; then
    abort "$(printf "failed during: %s" "$(shell_join "$@")")"
  fi
}

cleanup() {
  if [[ -n "${BOOT_TMPDIR:-}" && -d "${BOOT_TMPDIR}" ]]; then
    rm -rf "${BOOT_TMPDIR}"
  fi
}

validate_inputs() {
  if [[ -z "${OP_TOKEN:-}" ]]; then
    abort_multi "$(cat <<EOABORT
you must provide a 1Password service account token before using this wrapper.
set ${tty_bold}TANAAB_OP_TOKEN${tty_reset} or ${tty_bold}OP_SERVICE_ACCOUNT_TOKEN${tty_reset}, or pass ${tty_bold}--op-token${tty_reset}.
EOABORT
)"
  fi

  if [[ "${#SSH_KEYS[@]}" -eq 0 ]]; then
    abort "at least one ssh key is required. pass --ssh-key or set TANAAB_SSH_KEY."
  fi

}

validate_platform() {
  detect_arch
  detect_os

  ARCH="${TANAAB_ARCH:-${DETECTED_ARCH}}"
  OS="${TANAAB_OS:-${DETECTED_OS}}"

  if [[ "${EUID:-${UID}}" == "0" ]]; then
    abort "cannot run this script as root."
  fi

  CURL="$(command -v curl || true)"
  if [[ -z "${CURL}" ]] || ! test_curl "${CURL}"; then
    abort_multi "$(cat <<EOABORT
you must install cURL ${REQUIRED_CURL_VERSION} or higher before using this wrapper.
EOABORT
)"
  fi

  if [[ "${OS}" != "macos" ]]; then
    abort_multi "$(cat <<EOABORT
this script only supports ${tty_ts}macOS${tty_reset}; ${tty_red}${OS}${tty_reset} is not supported.
check the project README for current support details: ${tty_underline}${tty_magenta}https://github.com/pirog/me${tty_reset}
EOABORT
)"
  fi

  if [[ "${ARCH}" != "x64" ]] && [[ "${ARCH}" != "arm64" ]]; then
    abort_multi "$(cat <<EOABORT
this script currently only supports ${tty_ts}x64${tty_reset} and ${tty_ts}arm64${tty_reset} systems.
check the project README for current support details: ${tty_underline}${tty_magenta}https://github.com/pirog/me${tty_reset}
EOABORT
)"
  fi

  local macos_version
  macos_version="$(major_minor "$(/usr/bin/sw_vers -productVersion)")"
  if ! version_compare "${macos_version}" "${MACOS_OLDEST_SUPPORTED}"; then
    abort_multi "$(cat <<EOABORT
your macOS version ${tty_red}${macos_version}${tty_reset} is ${tty_bold}too old${tty_reset}; minimum supported version is ${tty_ts}${MACOS_OLDEST_SUPPORTED}${tty_reset}.
check the project README for current support details: ${tty_underline}${tty_magenta}https://github.com/pirog/me${tty_reset}
EOABORT
)"
  fi
}

apply_noninteractive_mode() {
  # shellcheck disable=SC2016
  if [[ -z "${NONINTERACTIVE-}" ]]; then
    if [[ -n "${CI-}" ]]; then
      warn "${tty_tp}running${tty_reset} in ${tty_ts}non-interactive mode${tty_reset} because \`\$CI\` is set."
      NONINTERACTIVE=1
    elif [[ ! -t 0 ]]; then
      if [[ -z "${INTERACTIVE-}" ]]; then
        warn "${tty_tp}running${tty_reset} in ${tty_ts}non-interactive mode${tty_reset} because \`stdin\` is not a TTY."
        NONINTERACTIVE=1
      else
        warn "${tty_tp}running${tty_reset} in ${tty_ts}interactive mode${tty_reset} despite \`stdin\` not being a TTY because \`\$INTERACTIVE\` is set."
      fi
    fi
  else
    log "${tty_tp}running${tty_reset} in ${tty_ts}non-interactive mode${tty_reset} ${tty_dim}because \$NONINTERACTIVE is set${tty_reset}"
  fi
}

sync_bootbox_env() {
  if [[ -n "${DEBUG-}" ]]; then
    export TANAAB_DEBUG="${DEBUG}"
  else
    unset TANAAB_DEBUG || true
  fi

  if [[ -n "${FORCE-}" ]]; then
    export TANAAB_FORCE="${FORCE}"
  else
    unset TANAAB_FORCE || true
  fi

  if [[ -n "${NONINTERACTIVE-}" ]]; then
    export NONINTERACTIVE="${NONINTERACTIVE}"
  else
    unset NONINTERACTIVE || true
  fi
}

core_remediation_needed() {
  [[ "${CORE_NEEDS_REMEDIATION:-0}" == "1" ]]
}

run_bootbox_from_tmpdir() (
  cd "${BOOT_TMPDIR}" || exit 1
  "$@"
)

plan_wrapper_execution() {
  if core_remediation_needed; then
    plan_action "${tty_tp}ensure${tty_reset} ${tty_ts}homebrew${tty_reset} is installed"
    plan_action "${tty_tp}install${tty_reset} ${tty_ts}core homebrew packages${tty_reset}"
  fi

  collect_ssh_key_actions

  if [[ "${#SSH_KEYS_TO_INSTALL[@]}" -gt 0 ]]; then
    plan_action "${tty_tp}install${tty_reset} ssh keys: $(describe_ssh_key_specs "${SSH_KEYS_TO_INSTALL[@]}")"
  fi

  if [[ "${#SSH_KEYS_TO_OVERWRITE[@]}" -gt 0 ]]; then
    plan_action "${tty_tp}overwrite${tty_reset} existing ssh keys because ${tty_bold}--force${tty_reset} is set: $(describe_ssh_key_specs "${SSH_KEYS_TO_OVERWRITE[@]}")"
  fi

  if [[ "${#SSH_KEYS_TO_SKIP[@]}" -gt 0 ]]; then
    plan_action "${tty_tp}skip${tty_reset} existing ssh keys because ${tty_bold}--force${tty_reset} is not set: $(describe_ssh_key_specs "${SSH_KEYS_TO_SKIP[@]}")"
  fi
}

prepare_bootbox_script() {
  BOOT_TMPDIR="$(mktemp -d -t me-boot.XXXXXX)"
  BOOTBOX_SCRIPT_PATH="${BOOT_TMPDIR}/bootbox.sh"

  execute "${CURL}" -fsSL "${BOOTBOX_URL}" -o "${BOOTBOX_SCRIPT_PATH}"
  execute chmod 700 "${BOOTBOX_SCRIPT_PATH}"
}

run_bootbox_check_core() {
  local -a bootbox_command=(
    env
    -u TANAAB_BREWFILE
    -u TANAAB_BREWFILES
    -u TANAAB_DOTPKG
    -u TANAAB_DOTPKGS
    -u TANAAB_SSH_KEY
    -u TANAAB_SSH_KEYS
    -u TANAAB_OP_TOKEN
    -u OP_SERVICE_ACCOUNT_TOKEN
    -u TANAAB_TARGET
    /bin/bash
    "${BOOTBOX_SCRIPT_PATH}"
    --check-core
  )

  debug "${tty_tp}checking${tty_reset} ${tty_ts}bootbox core requirements${tty_reset} from ${tty_ts}${BOOT_TMPDIR}${tty_reset}"
  if run_bootbox_from_tmpdir "${bootbox_command[@]}"; then
    CORE_NEEDS_REMEDIATION="0"
    debug "bootbox core requirements are satisfied"
    return 0
  fi

  CORE_NEEDS_REMEDIATION="1"
  debug "bootbox core requirements need remediation"
  return 1
}

ensure_bootbox_core_requirements() {
  local -a bootbox_command=(
    env
    -u TANAAB_BREWFILE
    -u TANAAB_BREWFILES
    -u TANAAB_DOTPKG
    -u TANAAB_DOTPKGS
    -u TANAAB_SSH_KEY
    -u TANAAB_SSH_KEYS
    -u TANAAB_OP_TOKEN
    -u OP_SERVICE_ACCOUNT_TOKEN
    -u TANAAB_TARGET
    /bin/bash
    "${BOOTBOX_SCRIPT_PATH}"
  )
  local -a bootbox_display_command=(
    env
    -u TANAAB_BREWFILE
    -u TANAAB_BREWFILES
    -u TANAAB_DOTPKG
    -u TANAAB_DOTPKGS
    -u TANAAB_SSH_KEY
    -u TANAAB_SSH_KEYS
    -u TANAAB_OP_TOKEN
    -u OP_SERVICE_ACCOUNT_TOKEN
    -u TANAAB_TARGET
    /bin/bash
    "${BOOTBOX_SCRIPT_PATH}"
  )

  if ! core_remediation_needed; then
    return 0
  fi

  debug "${tty_tp}delegating${tty_reset} to ${tty_ts}bootbox${tty_reset} from ${tty_ts}${BOOT_TMPDIR}${tty_reset} with $(shell_join "${bootbox_display_command[@]}")"
  if ! run_bootbox_from_tmpdir "${bootbox_command[@]}"; then
    abort "bootbox failed while ensuring core requirements."
  fi

  if ! run_bootbox_check_core; then
    abort "bootbox core requirements are still not satisfied after remediation."
  fi
}

run_bootbox_for_ssh_key() {
  local ssh_key="$1"
  local -a bootbox_command=(
    env
    -u TANAAB_BREWFILE
    -u TANAAB_BREWFILES
    -u TANAAB_DOTPKG
    -u TANAAB_DOTPKGS
    -u TANAAB_SSH_KEY
    -u TANAAB_SSH_KEYS
    -u TANAAB_OP_TOKEN
    -u OP_SERVICE_ACCOUNT_TOKEN
    /bin/bash
    "${BOOTBOX_SCRIPT_PATH}"
    --op-token
    "${OP_TOKEN}"
    --ssh-key
    "${ssh_key}"
  )
  local -a bootbox_display_command=(
    env
    -u TANAAB_BREWFILE
    -u TANAAB_BREWFILES
    -u TANAAB_DOTPKG
    -u TANAAB_DOTPKGS
    -u TANAAB_SSH_KEY
    -u TANAAB_SSH_KEYS
    -u TANAAB_OP_TOKEN
    -u OP_SERVICE_ACCOUNT_TOKEN
    /bin/bash
    "${BOOTBOX_SCRIPT_PATH}"
    --op-token
    "$(mask_secret_for_display "${OP_TOKEN}")"
    --ssh-key
    "${ssh_key}"
  )

  debug "${tty_tp}delegating${tty_reset} to ${tty_ts}bootbox${tty_reset} from ${tty_ts}${BOOT_TMPDIR}${tty_reset} with $(shell_join "${bootbox_display_command[@]}")"
  if ! run_bootbox_from_tmpdir "${bootbox_command[@]}"; then
    abort "bootbox failed while installing ssh key ${tty_ts}$(ssh_key_filename "${ssh_key}")${tty_reset}."
  fi
}

run_bootbox() {
  local ssh_key
  local destination_path

  collect_ssh_key_actions

  for ssh_key in "${SSH_KEYS_TO_SKIP[@]}"; do
    destination_path="$(ssh_key_destination_path "${ssh_key}")"
    warn "${tty_tp}skipping${tty_reset} ssh key ${tty_ts}${ssh_key}${tty_reset} because ${tty_ts}${destination_path}${tty_reset} already exists and ${tty_bold}--force${tty_reset} is not set."
  done

  if [[ "${#SSH_KEYS_TO_INSTALL[@]}" -eq 0 && "${#SSH_KEYS_TO_OVERWRITE[@]}" -eq 0 ]]; then
    debug "no SSH keys require installation after wrapper-side filtering"
    return 0
  fi

  for ssh_key in "${SSH_KEYS_TO_INSTALL[@]}"; do
    run_bootbox_for_ssh_key "${ssh_key}"
  done

  for ssh_key in "${SSH_KEYS_TO_OVERWRITE[@]}"; do
    run_bootbox_for_ssh_key "${ssh_key}"
  done
}

main() {
  trap cleanup EXIT
  parse_args "$@"
  validate_inputs
  validate_platform
  apply_noninteractive_mode
  sync_bootbox_env

  debug "${tty_tp}running${tty_reset}" "${SCRIPT_NAME}" script version: "${SCRIPT_VERSION}"
  debug raw CI="${CI:-}"
  debug raw NONINTERACTIVE="${NONINTERACTIVE:-}"
  debug raw DEBUG="${DEBUG:-}"
  debug raw FORCE="${FORCE:-}"
  debug raw OP_TOKEN="$(mask_secret_for_display "${OP_TOKEN}")"
  debug raw SSH_KEYS="$(array_join "," SSH_KEYS)"
  debug raw BOOTBOX_URL="${BOOTBOX_URL}"
  debug raw CURL="${CURL}"
  debug raw ARCH="${ARCH}"
  debug raw OS="${OS}"

  prepare_bootbox_script
  run_bootbox_check_core || true
  debug raw CORE_NEEDS_REMEDIATION="${CORE_NEEDS_REMEDIATION}"
  plan_wrapper_execution

  if [[ -z "${NONINTERACTIVE-}" ]] && have_planned_actions; then
    show_planned_actions
    wait_for_user
  fi

  ensure_bootbox_core_requirements
  run_bootbox
}

main "$@"
