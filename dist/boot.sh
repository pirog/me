#!/bin/bash
set -euo pipefail
# bootstrap a macOS machine by delegating to the hosted bootbox entrypoint.
#
# examples:
#
#   $ ./boot.sh --op-token "$OP_TOKEN"
#   $ ./boot.sh --op-token "$OP_TOKEN" --ssh-key vmruk4ny353aly6tbom7z3v2hy/id_agentbox1
#   $ ./boot.sh --op-token "$OP_TOKEN" --tanaab canon --tanaab agentbox
#   $ PIROME_DEBUG=1 ./boot.sh --op-token "$OP_TOKEN" --yes
#
# option precedence: cli options override environment variables, which override defaults.
#
# run `./boot.sh --help` for more advanced usage.

MACOS_OLDEST_SUPPORTED="26.0"
REQUIRED_CURL_VERSION="7.41.0"
BOOTBOX_URL="https://bootbox.tanaab.sh/bootbox.sh"
DEFAULT_SSH_KEY="vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_agentbox1"
TANAAB_GITHUB_ORG="tanaabased"
AGENTBOX_HEALTH_SCRIPT_PATH="/opt/tanaab/agentbox/bin/health.sh"
AGENTBOX_HEALTH_PLIST_PATH="/Library/LaunchDaemons/dev.tanaab.agentbox.health.plist"

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

array_contains_value() {
  local array_name="$1"
  local expected="$2"
  local item
  local value_count="0"
  local -a values=()

  eval "value_count=\${#${array_name}[@]}"
  if [[ "${value_count}" -eq 0 ]]; then
    return 1
  fi

  eval "values=(\"\${${array_name}[@]}\")"
  for item in "${values[@]}"; do
    if [[ "${item}" == "${expected}" ]]; then
      return 0
    fi
  done

  return 1
}

dedupe_array_values() {
  local array_name="$1"
  local item
  local quoted
  local value_count="0"
  local -a values=()
  local -a unique_values=()

  eval "value_count=\${#${array_name}[@]}"
  if [[ "${value_count}" -eq 0 ]]; then
    return 0
  fi

  eval "values=(\"\${${array_name}[@]}\")"
  for item in "${values[@]}"; do
    if ! array_contains_value unique_values "${item}"; then
      unique_values+=("${item}")
    fi
  done

  eval "${array_name}=()"
  for item in "${unique_values[@]}"; do
    printf -v quoted '%q' "${item}"
    eval "${array_name}+=(${quoted})"
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

# shellcheck disable=SC2016
if [[ -n "${INTERACTIVE-}" && -n "${NONINTERACTIVE-}" ]]; then
  abort 'both $INTERACTIVE and $NONINTERACTIVE are set. please unset at least one variable and try again.'
fi

if [[ -n "${CI-}" && -n "${INTERACTIVE-}" ]]; then
  abort "cannot run force-interactive mode in CI."
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

DEBUG="${PIROME_DEBUG:-${DEBUG:-${RUNNER_DEBUG:-}}}"
FORCE="${PIROME_FORCE:-}"
OP_TOKEN="${PIROME_OP_TOKEN:-${OP_SERVICE_ACCOUNT_TOKEN:-}}"
SSH_KEYS_CSV="${PIROME_SSH_KEY:-${DEFAULT_SSH_KEY}}"
ME_PAYLOAD_DIR_INPUT="${PIROME_PAYLOAD_DIR:-}"
TANAAB_REPOS_CSV="${PIROME_TANAAB:-}"
declare -a SSH_KEYS=()
declare -a SSH_KEYS_TO_INSTALL=()
declare -a SSH_KEYS_TO_OVERWRITE=()
declare -a SSH_KEYS_TO_SKIP=()
declare -a TANAAB_REPOS=()
declare -a ME_APPLY_DOTPKGS=()
declare -a ME_APPLY_CASK_SKIPS=()
declare -a PLANNED_ACTIONS=()
BOOT_TMPDIR=""
BOOTBOX_SCRIPT_PATH=""
CORE_NEEDS_REMEDIATION="0"
CURL=""
DETECTED_ARCH=""
DETECTED_OS=""
ARCH=""
OS=""
ME_PAYLOAD_DIR=""
ME_PAYLOAD_SOURCE_KIND=""
ME_PAYLOAD_CANONICAL_PATH=""
ME_APPLY_BREWFILE=""
ME_HOMEBREW_BUNDLE_CASK_SKIP=""
AGENTBOX_HOST_DETECTED="0"
SSH_KEY_CLI_SEEN="0"
TANAAB_CLI_SEEN="0"

if [[ -n "${PIROME_SSH_KEYS:-}" ]]; then
  SSH_KEYS_CSV="${SSH_KEYS_CSV}${SSH_KEYS_CSV:+,}${PIROME_SSH_KEYS}"
fi

if [[ -n "${PIROME_TANAABS:-}" ]]; then
  TANAAB_REPOS_CSV="${TANAAB_REPOS_CSV}${TANAAB_REPOS_CSV:+,}${PIROME_TANAABS}"
fi

append_csv_to_array SSH_KEYS "${SSH_KEYS_CSV}"
append_csv_to_array TANAAB_REPOS "${TANAAB_REPOS_CSV}"

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
  local tanaab_repos_display="none"

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

  dedupe_array_values TANAAB_REPOS
  tanaab_repos_display="$(array_join "," TANAAB_REPOS)"
  tanaab_repos_display="${tanaab_repos_display:-none}"

  cat <<EOS
Usage: ${tty_dim}[NONINTERACTIVE=1] [CI=1]${tty_reset} ${tty_bold}${SCRIPT_NAME}${tty_reset} ${tty_dim}[options]${tty_reset}

${tty_tp}Options:${tty_reset}
  --ssh-key        installs 1password ssh keys as vault/item[:filename] ${tty_dim}[default: ${ssh_keys_display}]${tty_reset}
  --op-token       auths with 1password service account token ${tty_dim}[default: ${op_token_display}]${tty_reset}
  --tanaab         clones or safely updates a repeatable @tanaabased repository name ${tty_dim}[default: ${tanaab_repos_display}]${tty_reset}
  --version        shows version of this script
  --debug          shows debug messages ${tty_dim}[default: ${debug_display}]${tty_reset}
  --force          forces supported bootbox operations ${tty_dim}[default: ${force_display}]${tty_reset}
  -h, --help       displays this help message
  -y, --yes        runs with all defaults and no prompts, sets NONINTERACTIVE=1

${tty_tp}Environment Variables:${tty_reset}
  PIROME_SSH_KEY      comma-separated list of 1password ssh keys as vault/item[:filename]
  PIROME_OP_TOKEN     1password service account token; falls back to OP_SERVICE_ACCOUNT_TOKEN
  PIROME_TANAAB       comma-separated list of @tanaabased repository names; same as --tanaab
  PIROME_FORCE        set to a truthy value to force supported operations
  PIROME_DEBUG        set to a truthy value to show debug messages
  NONINTERACTIVE      installs without prompting for user input
  CI                  installs in CI mode (e.g. does not prompt for user input)
EOS
  if [[ "${1:-0}" != "noexit" ]]; then
    exit "${1:-0}"
  fi
}

abort_option_usage() {
  usage "noexit"
  abort "$1"
}

require_next_option_value() {
  local option="$1"
  local argc="$2"

  if [[ "${argc}" -lt 2 ]]; then
    abort_option_usage "option ${tty_bold}${option}${tty_reset} requires a value."
  fi
}

require_inline_option_value() {
  local option="$1"
  local value="$2"

  if [[ -z "${value}" ]]; then
    abort_option_usage "option ${tty_bold}${option}${tty_reset} must not be empty."
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --ssh-key)
        require_next_option_value "--ssh-key" "$#"
        if [[ "${SSH_KEY_CLI_SEEN}" == "0" ]]; then
          SSH_KEYS=()
          SSH_KEY_CLI_SEEN="1"
        fi
        append_array_value SSH_KEYS "$2"
        shift 2
        ;;
      --ssh-key=*)
        require_inline_option_value "--ssh-key" "${1#*=}"
        if [[ "${SSH_KEY_CLI_SEEN}" == "0" ]]; then
          SSH_KEYS=()
          SSH_KEY_CLI_SEEN="1"
        fi
        append_array_value SSH_KEYS "${1#*=}"
        shift
        ;;
      --ssh-keys)
        require_next_option_value "--ssh-keys" "$#"
        if [[ "${SSH_KEY_CLI_SEEN}" == "0" ]]; then
          SSH_KEYS=()
          SSH_KEY_CLI_SEEN="1"
        fi
        append_csv_to_array SSH_KEYS "$2"
        shift 2
        ;;
      --ssh-keys=*)
        require_inline_option_value "--ssh-keys" "${1#*=}"
        if [[ "${SSH_KEY_CLI_SEEN}" == "0" ]]; then
          SSH_KEYS=()
          SSH_KEY_CLI_SEEN="1"
        fi
        append_csv_to_array SSH_KEYS "${1#*=}"
        shift
        ;;
      --op-token)
        require_next_option_value "--op-token" "$#"
        OP_TOKEN="$2"
        shift 2
        ;;
      --op-token=*)
        require_inline_option_value "--op-token" "${1#*=}"
        OP_TOKEN="${1#*=}"
        shift
        ;;
      --tanaab)
        require_next_option_value "--tanaab" "$#"
        if [[ "${TANAAB_CLI_SEEN}" == "0" ]]; then
          TANAAB_REPOS=()
          TANAAB_CLI_SEEN="1"
        fi
        append_array_value TANAAB_REPOS "$2"
        shift 2
        ;;
      --tanaab=*)
        require_inline_option_value "--tanaab" "${1#*=}"
        if [[ "${TANAAB_CLI_SEEN}" == "0" ]]; then
          TANAAB_REPOS=()
          TANAAB_CLI_SEEN="1"
        fi
        append_array_value TANAAB_REPOS "${1#*=}"
        shift
        ;;
      --tanaabs)
        require_next_option_value "--tanaabs" "$#"
        if [[ "${TANAAB_CLI_SEEN}" == "0" ]]; then
          TANAAB_REPOS=()
          TANAAB_CLI_SEEN="1"
        fi
        append_csv_to_array TANAAB_REPOS "$2"
        shift 2
        ;;
      --tanaabs=*)
        require_inline_option_value "--tanaabs" "${1#*=}"
        if [[ "${TANAAB_CLI_SEEN}" == "0" ]]; then
          TANAAB_REPOS=()
          TANAAB_CLI_SEEN="1"
        fi
        append_csv_to_array TANAAB_REPOS "${1#*=}"
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

display_home_path() {
  local path="$1"

  if [[ "${path}" == "${HOME}" ]]; then
    printf "~"
    return 0
  fi

  if [[ "${path}" == "${HOME}/"* ]]; then
    printf "%s/%s" "~" "${path#"${HOME}"/}"
    return 0
  fi

  printf "%s" "${path}"
}

expand_home_path() {
  local path="$1"

  if [[ "${path}" == "~" ]]; then
    printf "%s" "${HOME}"
    return 0
  fi

  if [[ "${path}" == \~/* ]]; then
    printf "%s/%s" "${HOME}" "${path#\~/}"
    return 0
  fi

  printf "%s" "${path}"
}

resolve_existing_dir_path() (
  local path

  path="$(expand_home_path "$1")"
  if [[ ! -d "${path}" ]]; then
    return 1
  fi

  cd "${path}" 2>/dev/null && pwd -P
)

relative_path_from_dir() {
  local from_dir="$1"
  local target_dir="$2"
  local from_rest
  local target_rest
  local relative_path=""
  local common_index="0"
  local index
  local -a from_parts=()
  local -a target_parts=()

  from_dir="$(resolve_existing_dir_path "${from_dir}")" || return 1
  target_dir="$(resolve_existing_dir_path "${target_dir}")" || return 1
  from_rest="${from_dir#/}"
  target_rest="${target_dir#/}"
  IFS='/' read -r -a from_parts <<< "${from_rest}"
  IFS='/' read -r -a target_parts <<< "${target_rest}"

  while [[ "${common_index}" -lt "${#from_parts[@]}" ]] \
    && [[ "${common_index}" -lt "${#target_parts[@]}" ]] \
    && [[ "${from_parts[${common_index}]}" == "${target_parts[${common_index}]}" ]]; do
    common_index=$((common_index + 1))
  done

  for ((index = common_index; index < ${#from_parts[@]}; index++)); do
    relative_path="${relative_path}${relative_path:+/}.."
  done

  for ((index = common_index; index < ${#target_parts[@]}; index++)); do
    relative_path="${relative_path}${relative_path:+/}${target_parts[${index}]}"
  done

  printf "%s" "${relative_path:-.}"
}

me_payload_display() {
  display_home_path "${ME_PAYLOAD_DIR}"
}

me_payload_source_display() {
  case "${ME_PAYLOAD_SOURCE_KIND:-unresolved}" in
    explicit)
      printf "explicit payload dir"
      ;;
    source)
      printf "source-relative payload"
      ;;
    existing)
      printf "existing canonical checkout"
      ;;
    clone)
      printf "new ssh clone"
      ;;
    *)
      printf "unresolved"
      ;;
  esac
}

me_apply_brewfile_display() {
  display_home_path "${ME_APPLY_BREWFILE}"
}

agentbox_host_installed() {
  [[ -x "${AGENTBOX_HEALTH_SCRIPT_PATH}" && -f "${AGENTBOX_HEALTH_PLIST_PATH}" ]]
}

tailscale_formula_installed() {
  command -v brew >/dev/null 2>&1 && brew list --formula tailscale >/dev/null 2>&1
}

prepare_me_apply_cask_skips() {
  local cask
  local -a inherited_cask_skips=()

  ME_APPLY_CASK_SKIPS=()
  AGENTBOX_HOST_DETECTED="0"
  if [[ -n "${HOMEBREW_BUNDLE_CASK_SKIP:-}" ]]; then
    read -r -a inherited_cask_skips <<< "${HOMEBREW_BUNDLE_CASK_SKIP}"
    for cask in "${inherited_cask_skips[@]}"; do
      append_array_value ME_APPLY_CASK_SKIPS "${cask}"
    done
  fi

  if agentbox_host_installed; then
    AGENTBOX_HOST_DETECTED="1"
    append_array_value ME_APPLY_CASK_SKIPS "tailscale-app"
    append_array_value ME_APPLY_CASK_SKIPS "1password"
  elif tailscale_formula_installed; then
    append_array_value ME_APPLY_CASK_SKIPS "tailscale-app"
  fi

  dedupe_array_values ME_APPLY_CASK_SKIPS
  if [[ "${#ME_APPLY_CASK_SKIPS[@]}" -eq 0 ]]; then
    ME_HOMEBREW_BUNDLE_CASK_SKIP=""
    return 0
  fi

  ME_HOMEBREW_BUNDLE_CASK_SKIP="$(array_join " " ME_APPLY_CASK_SKIPS)"
}

me_payload_valid() {
  local dir="$1"

  [[ -d "${dir}" ]] || return 1
  [[ -d "${dir}/.git" || -f "${dir}/.git" ]] || return 1
  [[ -f "${dir}/boot.sh" ]] || return 1
  [[ -f "${dir}/Brewfile" ]] || return 1
  [[ -d "${dir}/dotfiles" ]] || return 1
  [[ -f "${dir}/.codex-plugin/plugin.json" ]] || return 1
}

validate_me_payload_dir() {
  local dir="$1"

  if ! me_payload_valid "${dir}"; then
    abort "me payload at ${tty_ts}$(display_home_path "${dir}")${tty_reset} must be a git checkout containing boot.sh, Brewfile, dotfiles/, and .codex-plugin/plugin.json."
  fi
}

me_script_real_path() {
  local link_target
  local script_dir
  local script_path="${0}"

  if [[ "${script_path}" != */* ]]; then
    if [[ -f "${script_path}" ]]; then
      script_path="./${script_path}"
    else
      script_path="$(command -v "${script_path}" 2>/dev/null || true)"
    fi
  fi

  if [[ -z "${script_path}" ]]; then
    return 1
  fi

  while [[ -L "${script_path}" ]]; do
    script_dir="$(cd -P "$(dirname "${script_path}")" 2>/dev/null && pwd)" || return 1
    link_target="$(readlink "${script_path}")" || return 1
    case "${link_target}" in
      /*)
        script_path="${link_target}"
        ;;
      *)
        script_path="${script_dir}/${link_target}"
        ;;
    esac
  done

  script_dir="$(cd -P "$(dirname "${script_path}")" 2>/dev/null && pwd)" || return 1
  printf "%s/%s" "${script_dir}" "$(basename "${script_path}")"
}

resolve_source_relative_me_payload() {
  local candidate
  local resolved_candidate
  local script_dir
  local script_path

  script_path="$(me_script_real_path)" || return 1
  script_dir="$(dirname "${script_path}")"

  for candidate in "${script_dir}" "${script_dir}/.." "${script_dir}/../.."; do
    resolved_candidate="$(resolve_existing_dir_path "${candidate}")" || continue
    if me_payload_valid "${resolved_candidate}"; then
      printf "%s" "${resolved_candidate}"
      return 0
    fi
  done

  return 1
}

prepare_me_payload() {
  local explicit_payload_dir
  local existing_payload_dir
  local source_payload_dir

  ME_PAYLOAD_CANONICAL_PATH="${HOME}/tanaab/me"
  ME_PAYLOAD_DIR_INPUT="$(trim_whitespace "${ME_PAYLOAD_DIR_INPUT}")"

  if [[ -n "${ME_PAYLOAD_DIR_INPUT}" ]]; then
    if ! explicit_payload_dir="$(resolve_existing_dir_path "${ME_PAYLOAD_DIR_INPUT}")"; then
      abort "me payload dir ${tty_ts}${ME_PAYLOAD_DIR_INPUT}${tty_reset} must resolve to an existing directory."
    fi

    validate_me_payload_dir "${explicit_payload_dir}"
    ME_PAYLOAD_DIR="${explicit_payload_dir}"
    ME_PAYLOAD_SOURCE_KIND="explicit"
    return 0
  fi

  if source_payload_dir="$(resolve_source_relative_me_payload)"; then
    ME_PAYLOAD_DIR="${source_payload_dir}"
    ME_PAYLOAD_SOURCE_KIND="source"
    return 0
  fi

  if [[ -e "${ME_PAYLOAD_CANONICAL_PATH}" ]]; then
    if ! existing_payload_dir="$(resolve_existing_dir_path "${ME_PAYLOAD_CANONICAL_PATH}")"; then
      abort "canonical me payload path ${tty_ts}$(display_home_path "${ME_PAYLOAD_CANONICAL_PATH}")${tty_reset} exists but is not a directory."
    fi

    validate_me_payload_dir "${existing_payload_dir}"
    ME_PAYLOAD_DIR="${existing_payload_dir}"
    ME_PAYLOAD_SOURCE_KIND="existing"
    return 0
  fi

  ME_PAYLOAD_DIR="${ME_PAYLOAD_CANONICAL_PATH}"
  ME_PAYLOAD_SOURCE_KIND="clone"
}

tanaab_repo_target_path() {
  printf "%s/tanaab/%s" "${HOME}" "$1"
}

legacy_tanaab_source_value() {
  case "${1:-}" in
    ssh | 0 | false | FALSE | False | no | NO | No | off | OFF | Off | null | NULL | Null)
      return 0
      ;;
  esac

  [[ "${1:-}" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$ ]]
}

validate_tanaab_repos() {
  local repo

  dedupe_array_values TANAAB_REPOS
  if [[ "${#TANAAB_REPOS[@]}" -eq 0 ]]; then
    return 0
  fi

  for repo in "${TANAAB_REPOS[@]}"; do
    if legacy_tanaab_source_value "${repo}"; then
      abort "tanaab value ${tty_ts}${repo}${tty_reset} must name a repository in ${tty_ts}@${TANAAB_GITHUB_ORG}${tty_reset}; source modes and falsey disable values are no longer supported."
    fi

    if [[ "${repo}" == "me" ]]; then
      abort "tanaab repository name ${tty_ts}me${tty_reset} is reserved for the ${tty_ts}@pirog/me${tty_reset} payload."
    fi

    if [[ "${#repo}" -gt 100 || ! "${repo}" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
      abort "tanaab value ${tty_ts}${repo}${tty_reset} must be a safe GitHub repository name containing only letters, numbers, dots, underscores, or hyphens."
    fi
  done
}

discover_me_apply_payload() {
  local dotfiles_root="${ME_PAYLOAD_DIR}/dotfiles"
  local dotpkg

  ME_APPLY_BREWFILE="${ME_PAYLOAD_DIR}/Brewfile"
  ME_APPLY_DOTPKGS=()

  if [[ ! -f "${ME_APPLY_BREWFILE}" ]]; then
    abort "me payload at ${tty_ts}$(me_payload_display)${tty_reset} is missing required Brewfile ${tty_ts}$(me_apply_brewfile_display)${tty_reset}."
  fi

  if [[ ! -d "${dotfiles_root}" ]]; then
    abort "me payload at ${tty_ts}$(me_payload_display)${tty_reset} is missing required dotfiles directory ${tty_ts}$(display_home_path "${dotfiles_root}")${tty_reset}."
  fi

  while IFS= read -r dotpkg; do
    append_array_value ME_APPLY_DOTPKGS "${dotpkg}"
  done < <(find "${dotfiles_root}" -mindepth 1 -maxdepth 1 -type d | LC_ALL=C sort)

  if [[ "${#ME_APPLY_DOTPKGS[@]}" -eq 0 ]]; then
    abort "me payload at ${tty_ts}$(me_payload_display)${tty_reset} must contain at least one top-level dotpkg under ${tty_ts}$(display_home_path "${dotfiles_root}")${tty_reset}."
  fi
}

build_git_ssh_command_from_ssh_keys() {
  local repo_name="${1:-repo}"
  local ssh_key
  local key_path
  local arg
  local command_string=""
  local -a ssh_command=(ssh)
  local -a existing_key_paths=()

  for ssh_key in "${SSH_KEYS[@]}"; do
    key_path="$(ssh_key_destination_path "${ssh_key}")"
    if [[ -f "${key_path}" ]]; then
      existing_key_paths+=("${key_path}")
    fi
  done

  if [[ "${#existing_key_paths[@]}" -eq 0 ]]; then
    abort "cannot clone ${tty_ts}${repo_name}${tty_reset} via ssh because no installed ssh key paths were found."
  fi

  for key_path in "${existing_key_paths[@]}"; do
    ssh_command+=(-i "${key_path}")
  done

  ssh_command+=(-o IdentitiesOnly=yes)

  for arg in "${ssh_command[@]}"; do
    printf -v command_string '%s%q ' "${command_string}" "${arg}"
  done

  printf "%s" "${command_string% }"
}

github_repo_origin_supported() {
  local owner="$1"
  local repo="$2"
  local origin_url="$3"

  case "${origin_url}" in
    "git@github.com:${owner}/${repo}.git" | "ssh://git@github.com/${owner}/${repo}.git" | "ssh://git@github.com:${owner}/${repo}.git" | "https://github.com/${owner}/${repo}" | "https://github.com/${owner}/${repo}.git")
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

github_repo_ssh_url() {
  printf "git@github.com:%s/%s.git" "$1" "$2"
}

fetch_existing_repo_main() {
  local repo_label="$1"
  local repo_dir="$2"
  local origin_url="$3"
  local git_ssh_command
  local repo_display

  repo_display="$(display_home_path "${repo_dir}")"

  if [[ "${origin_url}" == git@* || "${origin_url}" == ssh://* ]]; then
    git_ssh_command="$(build_git_ssh_command_from_ssh_keys "${repo_label}")"
    debug "${tty_tp}fetching${tty_reset}" "${tty_ts}origin/main${tty_reset}" for "${tty_ts}${repo_display}${tty_reset}"
    env GIT_SSH_COMMAND="${git_ssh_command}" git -C "${repo_dir}" fetch origin main
    return
  fi

  debug "${tty_tp}fetching${tty_reset}" "${tty_ts}origin/main${tty_reset}" for "${tty_ts}${repo_display}${tty_reset}"
  git -C "${repo_dir}" fetch origin main
}

refresh_existing_repo() {
  local repo_label="$1"
  local repo_dir="$2"
  local owner="$3"
  local repo="$4"
  local branch
  local current_head
  local origin_head
  local origin_url
  local repo_display
  local status_output
  local upstream

  repo_display="$(display_home_path "${repo_dir}")"

  status_output="$(git -C "${repo_dir}" status --porcelain --untracked-files=normal 2>/dev/null || true)"
  if [[ -n "${status_output}" ]]; then
    warn "${tty_tp}using${tty_reset} existing ${repo_label} checkout at ${tty_ts}${repo_display}${tty_reset} without updating because it has local changes."
    return 0
  fi

  branch="$(git -C "${repo_dir}" symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
  if [[ "${branch}" != "main" ]]; then
    warn "${tty_tp}using${tty_reset} existing ${repo_label} checkout at ${tty_ts}${repo_display}${tty_reset} without updating because its current branch is ${tty_ts}${branch:-detached}${tty_reset}, not ${tty_ts}main${tty_reset}."
    return 0
  fi

  upstream="$(git -C "${repo_dir}" rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
  if [[ "${upstream}" != "origin/main" ]]; then
    warn "${tty_tp}using${tty_reset} existing ${repo_label} checkout at ${tty_ts}${repo_display}${tty_reset} without updating because ${tty_ts}main${tty_reset} does not track ${tty_ts}origin/main${tty_reset}."
    return 0
  fi

  origin_url="$(git -C "${repo_dir}" config --get remote.origin.url 2>/dev/null || true)"
  if ! github_repo_origin_supported "${owner}" "${repo}" "${origin_url}"; then
    warn "${tty_tp}using${tty_reset} existing ${repo_label} checkout at ${tty_ts}${repo_display}${tty_reset} without updating because ${tty_ts}origin${tty_reset} is not ${tty_ts}@${owner}/${repo}${tty_reset}."
    return 0
  fi

  if ! fetch_existing_repo_main "${repo_label}" "${repo_dir}" "${origin_url}"; then
    warn "${tty_tp}using${tty_reset} existing ${repo_label} checkout at ${tty_ts}${repo_display}${tty_reset} because ${tty_ts}origin/main${tty_reset} could not be fetched."
    return 0
  fi

  current_head="$(git -C "${repo_dir}" rev-parse HEAD)"
  origin_head="$(git -C "${repo_dir}" rev-parse origin/main)"

  if [[ "${current_head}" == "${origin_head}" ]]; then
    debug "${repo_label} checkout at ${repo_display} already matches origin/main"
    return 0
  fi

  if git -C "${repo_dir}" merge-base --is-ancestor HEAD origin/main; then
    log "${tty_tp}updating${tty_reset} ${repo_label} checkout at ${tty_ts}${repo_display}${tty_reset} with a fast-forward to ${tty_ts}origin/main${tty_reset}"
    execute git -C "${repo_dir}" merge --ff-only origin/main
    return 0
  fi

  if git -C "${repo_dir}" merge-base --is-ancestor origin/main HEAD; then
    warn "${tty_tp}using${tty_reset} existing ${repo_label} checkout at ${tty_ts}${repo_display}${tty_reset} without updating because local ${tty_ts}main${tty_reset} is ahead of ${tty_ts}origin/main${tty_reset}."
    return 0
  fi

  warn "${tty_tp}using${tty_reset} existing ${repo_label} checkout at ${tty_ts}${repo_display}${tty_reset} without updating because local ${tty_ts}main${tty_reset} has diverged from ${tty_ts}origin/main${tty_reset}."
}

refresh_existing_me_payload() {
  if [[ "${ME_PAYLOAD_SOURCE_KIND}" != "existing" ]]; then
    return 0
  fi

  refresh_existing_repo "me payload" "${ME_PAYLOAD_DIR}" "pirog" "me"
}

clone_github_repo_via_ssh() {
  local owner="$1"
  local repo="$2"
  local target="$3"
  local git_ssh_command
  local repo_label="@${owner}/${repo}"

  if [[ -e "${target}" || -L "${target}" ]]; then
    abort "refusing to replace existing path ${tty_ts}$(display_home_path "${target}")${tty_reset} while cloning ${tty_ts}${repo_label}${tty_reset}."
  fi

  git_ssh_command="$(build_git_ssh_command_from_ssh_keys "${repo_label}")"
  execute mkdir -p "$(dirname "${target}")"
  log "${tty_tp}cloning${tty_reset} ${tty_ts}${repo_label}${tty_reset} via ssh to ${tty_ts}$(display_home_path "${target}")${tty_reset}"
  execute env GIT_SSH_COMMAND="${git_ssh_command}" git clone "$(github_repo_ssh_url "${owner}" "${repo}")" "${target}"
}

materialize_me_payload() {
  local resolved_payload_dir

  case "${ME_PAYLOAD_SOURCE_KIND}" in
    explicit | source)
      if [[ "${ME_PAYLOAD_DIR}" != "${ME_PAYLOAD_CANONICAL_PATH}" ]]; then
        warn "${tty_tp}using${tty_reset} me payload at ${tty_ts}$(me_payload_display)${tty_reset} in place; stowed files will reference this checkout."
      fi
      ;;
    existing)
      refresh_existing_me_payload
      ;;
    clone)
      clone_github_repo_via_ssh "pirog" "me" "${ME_PAYLOAD_CANONICAL_PATH}"
      if ! resolved_payload_dir="$(resolve_existing_dir_path "${ME_PAYLOAD_CANONICAL_PATH}")"; then
        abort "cloned me payload did not resolve at ${tty_ts}$(display_home_path "${ME_PAYLOAD_CANONICAL_PATH}")${tty_reset}."
      fi
      ME_PAYLOAD_DIR="${resolved_payload_dir}"
      ;;
    *)
      abort "unsupported internal me payload source ${tty_bold}${ME_PAYLOAD_SOURCE_KIND:-unresolved}${tty_reset}."
      ;;
  esac

  validate_me_payload_dir "${ME_PAYLOAD_DIR}"
}

resolve_existing_git_checkout_path() {
  local repo_label="$1"
  local target="$2"
  local resolved_target

  if ! resolved_target="$(resolve_existing_dir_path "${target}")"; then
    abort "existing ${repo_label} path ${tty_ts}$(display_home_path "${target}")${tty_reset} must resolve to a directory."
  fi

  if [[ ! -d "${resolved_target}/.git" && ! -f "${resolved_target}/.git" ]]; then
    abort "existing ${repo_label} path ${tty_ts}$(display_home_path "${target}")${tty_reset} must be a Git checkout."
  fi

  printf "%s" "${resolved_target}"
}

materialize_tanaab_repo() {
  local repo="$1"
  local repo_label="@${TANAAB_GITHUB_ORG}/${repo}"
  local target
  local resolved_target

  target="$(tanaab_repo_target_path "${repo}")"
  if [[ -e "${target}" || -L "${target}" ]]; then
    resolved_target="$(resolve_existing_git_checkout_path "${repo_label}" "${target}")"
    refresh_existing_repo "${repo_label}" "${resolved_target}" "${TANAAB_GITHUB_ORG}" "${repo}"
    return 0
  fi

  clone_github_repo_via_ssh "${TANAAB_GITHUB_ORG}" "${repo}" "${target}"
  resolve_existing_git_checkout_path "${repo_label}" "${target}" >/dev/null
}

materialize_tanaab_repos() {
  local repo

  if [[ "${#TANAAB_REPOS[@]}" -eq 0 ]]; then
    return 0
  fi

  for repo in "${TANAAB_REPOS[@]}"; do
    materialize_tanaab_repo "${repo}"
  done
}

plugin_links_dir() {
  printf "%s/dotfiles/ai/.codex/plugins" "${ME_PAYLOAD_DIR}"
}

resolve_symlink_dir_target() {
  local link_path="$1"
  local link_target
  local target_path

  [[ -L "${link_path}" ]] || return 1
  link_target="$(readlink "${link_path}")" || return 1
  if [[ "${link_target}" == /* ]]; then
    target_path="${link_target}"
  else
    target_path="$(dirname "${link_path}")/${link_target}"
  fi

  resolve_existing_dir_path "${target_path}"
}

remove_plugin_links_for_checkout() {
  local repo_dir="$1"
  local keep_name="${2:-}"
  local -a links_to_remove
  local installed_link_path
  local installed_link_target
  local link_name
  local link_path
  local link_target
  local links_dir

  links_dir="$(plugin_links_dir)"
  [[ -d "${links_dir}" ]] || return 0

  for link_path in "${links_dir}"/*; do
    [[ -L "${link_path}" ]] || continue
    link_target="$(resolve_symlink_dir_target "${link_path}" 2>/dev/null || true)"
    [[ "${link_target}" == "${repo_dir}" ]] || continue

    link_name="$(basename "${link_path}")"
    if [[ -n "${keep_name}" && "${link_name}" == "${keep_name}" ]]; then
      continue
    fi

    links_to_remove=("${link_path}")
    installed_link_path="${HOME}/.codex/plugins/${link_name}"
    if [[ -L "${installed_link_path}" ]]; then
      installed_link_target="$(resolve_symlink_dir_target "${installed_link_path}" 2>/dev/null || true)"
      if [[ "${installed_link_target}" == "${repo_dir}" ]]; then
        log "${tty_tp}removing${tty_reset} installed Codex plugin link ${tty_ts}$(display_home_path "${installed_link_path}")${tty_reset} for ${tty_ts}$(display_home_path "${repo_dir}")${tty_reset}"
        links_to_remove+=("${installed_link_path}")
      fi
    fi

    log "${tty_tp}removing${tty_reset} stale Codex plugin link ${tty_ts}$(display_home_path "${link_path}")${tty_reset} for ${tty_ts}$(display_home_path "${repo_dir}")${tty_reset}"
    execute rm -f "${links_to_remove[@]}"
  done
}

ensure_plugin_link_for_checkout() {
  local repo_dir="$1"
  local plugin_name="$2"
  local ai_dotpkg_path="${ME_PAYLOAD_DIR}/dotfiles/ai"
  local current_link_target
  local existing_target
  local link_path
  local relative_link_target
  local links_dir

  if [[ ! -d "${ai_dotpkg_path}" ]]; then
    abort "me payload at ${tty_ts}$(me_payload_display)${tty_reset} is missing required ${tty_ts}ai${tty_reset} dotpkg needed for generated Codex plugin links."
  fi

  links_dir="$(plugin_links_dir)"
  link_path="${links_dir}/${plugin_name}"
  execute mkdir -p "${links_dir}"
  relative_link_target="$(relative_path_from_dir "${links_dir}" "${repo_dir}")" || abort "could not determine a relative Codex plugin link from ${tty_ts}$(display_home_path "${links_dir}")${tty_reset} to ${tty_ts}$(display_home_path "${repo_dir}")${tty_reset}."

  if [[ -L "${link_path}" ]]; then
    existing_target="$(resolve_symlink_dir_target "${link_path}" 2>/dev/null || true)"
    if [[ "${existing_target}" == "${repo_dir}" ]]; then
      current_link_target="$(readlink "${link_path}")"
      if [[ "${current_link_target}" == /* ]]; then
        log "${tty_tp}normalizing${tty_reset} Codex plugin link ${tty_ts}$(display_home_path "${link_path}")${tty_reset} to a Stow-compatible relative target"
        execute ln -sfn "${relative_link_target}" "${link_path}"
      fi
      debug "Codex plugin link $(display_home_path "${link_path}") already points to $(display_home_path "${repo_dir}")"
      return 0
    fi

    abort "refusing to replace Codex plugin link ${tty_ts}$(display_home_path "${link_path}")${tty_reset} because it points somewhere other than ${tty_ts}$(display_home_path "${repo_dir}")${tty_reset}."
  fi

  if [[ -e "${link_path}" ]]; then
    abort "refusing to replace existing Codex plugin path ${tty_ts}$(display_home_path "${link_path}")${tty_reset}; expected a generated symlink."
  fi

  log "${tty_tp}linking${tty_reset} Codex plugin ${tty_ts}${plugin_name}${tty_reset} to ${tty_ts}$(display_home_path "${repo_dir}")${tty_reset}"
  execute ln -s "${relative_link_target}" "${link_path}"
}

reconcile_tanaab_repo_plugin() {
  local repo="$1"
  local repo_dir="$2"
  local manifest_path="${repo_dir}/.codex-plugin/plugin.json"
  local plugin_name

  if [[ ! -f "${manifest_path}" ]]; then
    remove_plugin_links_for_checkout "${repo_dir}"
    debug "@${TANAAB_GITHUB_ORG}/${repo} is not a Codex plugin"
    return 0
  fi

  plugin_name="$(jq -er 'if (.name | type) == "string" and (.name | length) > 0 then .name else empty end' "${manifest_path}" 2>/dev/null || true)"
  if [[ -z "${plugin_name}" || "${#plugin_name}" -gt 100 || ! "${plugin_name}" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
    warn "${tty_tp}preserving${tty_reset} existing plugin links for ${tty_ts}@${TANAAB_GITHUB_ORG}/${repo}${tty_reset} because ${tty_ts}.codex-plugin/plugin.json${tty_reset} does not contain a valid plugin name."
    return 0
  fi

  remove_plugin_links_for_checkout "${repo_dir}" "${plugin_name}"
  ensure_plugin_link_for_checkout "${repo_dir}" "${plugin_name}"
}

reconcile_tanaab_plugin_links() {
  local origin_url
  local repo
  local repo_dir
  local resolved_repo_dir
  local tanaab_root="${HOME}/tanaab"

  [[ -d "${tanaab_root}" ]] || return 0
  for repo_dir in "${tanaab_root}"/*; do
    [[ -d "${repo_dir}" ]] || continue
    [[ -d "${repo_dir}/.git" || -f "${repo_dir}/.git" ]] || continue

    repo="$(basename "${repo_dir}")"
    resolved_repo_dir="$(resolve_existing_dir_path "${repo_dir}")" || continue
    origin_url="$(git -C "${resolved_repo_dir}" config --get remote.origin.url 2>/dev/null || true)"
    if ! github_repo_origin_supported "${TANAAB_GITHUB_ORG}" "${repo}" "${origin_url}"; then
      continue
    fi

    reconcile_tanaab_repo_plugin "${repo}" "${resolved_repo_dir}"
  done
}

plan_tanaab_repos() {
  local repo
  local repo_label
  local target

  if [[ "${#TANAAB_REPOS[@]}" -eq 0 ]]; then
    return 0
  fi

  for repo in "${TANAAB_REPOS[@]}"; do
    repo_label="@${TANAAB_GITHUB_ORG}/${repo}"
    target="$(tanaab_repo_target_path "${repo}")"
    if [[ -e "${target}" || -L "${target}" ]]; then
      resolve_existing_git_checkout_path "${repo_label}" "${target}" >/dev/null
      plan_action "${tty_tp}use${tty_reset} existing ${tty_ts}${repo_label}${tty_reset} checkout at ${tty_ts}$(display_home_path "${target}")${tty_reset} and fast-forward clean ${tty_ts}main${tty_reset} to ${tty_ts}origin/main${tty_reset} when safe"
    else
      plan_action "${tty_tp}clone${tty_reset} ${tty_ts}${repo_label}${tty_reset} via ssh to ${tty_ts}$(display_home_path "${target}")${tty_reset}"
    fi
  done
}

plan_plugin_reconciliation() {
  plan_action "${tty_tp}reconcile${tty_reset} generated Codex plugin links for verified ${tty_ts}@${TANAAB_GITHUB_ORG}${tty_reset} checkouts under ${tty_ts}~/tanaab${tty_reset}"
}

plan_me_payload() {
  case "${ME_PAYLOAD_SOURCE_KIND}" in
    explicit)
      plan_action "${tty_tp}use${tty_reset} ${tty_ts}me${tty_reset} payload from ${tty_ts}$(me_payload_display)${tty_reset} ${tty_dim}(explicit payload dir)${tty_reset}"
      ;;
    source)
      plan_action "${tty_tp}use${tty_reset} ${tty_ts}me${tty_reset} payload from ${tty_ts}$(me_payload_display)${tty_reset} ${tty_dim}(source-relative payload)${tty_reset}"
      ;;
    existing)
      plan_action "${tty_tp}use${tty_reset} existing ${tty_ts}me${tty_reset} payload at ${tty_ts}$(me_payload_display)${tty_reset} and fast-forward clean ${tty_ts}main${tty_reset} to ${tty_ts}origin/main${tty_reset} when safe"
      ;;
    clone)
      plan_action "${tty_tp}clone${tty_reset} ${tty_ts}@pirog/me${tty_reset} via ssh to ${tty_ts}$(me_payload_display)${tty_reset}"
      ;;
  esac
}

plan_me_apply() {
  plan_action "${tty_tp}run${tty_reset} ${tty_ts}bootbox${tty_reset} against the ${tty_ts}me${tty_reset} payload at ${tty_ts}$(me_payload_display)${tty_reset} using its ${tty_ts}Brewfile${tty_reset} and dotpkgs on ${tty_ts}~${tty_reset}"
  if [[ -n "${ME_HOMEBREW_BUNDLE_CASK_SKIP}" ]]; then
    plan_action "${tty_tp}skip${tty_reset} Homebrew casks ${tty_ts}$(array_join ", " ME_APPLY_CASK_SKIPS)${tty_reset} during the ${tty_ts}me${tty_reset} Brewfile apply"
  fi
}

run_bootbox_for_me_apply() {
  local dotpkg
  local -a bootbox_args=(--brewfile "${ME_APPLY_BREWFILE}")

  for dotpkg in "${ME_APPLY_DOTPKGS[@]}"; do
    bootbox_args+=(--dotpkg "${dotpkg}")
  done

  if [[ -n "${ME_HOMEBREW_BUNDLE_CASK_SKIP}" ]]; then
    HOMEBREW_BUNDLE_CASK_SKIP="${ME_HOMEBREW_BUNDLE_CASK_SKIP}" \
      bootbox_run_or_abort "bootbox failed while applying me payload ${tty_ts}$(me_payload_display)${tty_reset}." "${bootbox_args[@]}"
  else
    bootbox_run_or_abort "bootbox failed while applying me payload ${tty_ts}$(me_payload_display)${tty_reset}." "${bootbox_args[@]}"
  fi
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

ssh_key_destination_path() {
  printf "%s/.ssh/%s" "${HOME}" "$(ssh_key_filename "$1")"
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

  if [[ "${#SSH_KEYS[@]}" -gt 0 ]]; then
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
  fi
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

interactive_tty_available() {
  [[ -r /dev/tty && -w /dev/tty ]] || [[ -t 0 ]]
}

interactive_tty_input() {
  if [[ -r /dev/tty && -w /dev/tty ]]; then
    printf "/dev/tty"
  else
    printf "/dev/stdin"
  fi
}

getc() {
  local input_path
  local save_state

  input_path="$(interactive_tty_input)"
  save_state="$(/bin/stty -g < "${input_path}")"
  /bin/stty raw -echo < "${input_path}"
  IFS='' read -r -n 1 -d '' "$@" < "${input_path}"
  /bin/stty "${save_state}" < "${input_path}"
}

wait_for_user() {
  local c

  trap 'if [[ -r /dev/tty ]]; then /bin/stty sane < /dev/tty; else /bin/stty sane; fi; tput sgr0; echo; exit 1' SIGINT

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
  validate_tanaab_repos

  if [[ -z "${OP_TOKEN:-}" ]]; then
    abort_multi "$(cat <<EOABORT
you must provide a 1Password service account token before using this wrapper.
set ${tty_bold}PIROME_OP_TOKEN${tty_reset} or ${tty_bold}OP_SERVICE_ACCOUNT_TOKEN${tty_reset}, or pass ${tty_bold}--op-token${tty_reset}.
EOABORT
)"
  fi

  if [[ "${#SSH_KEYS[@]}" -eq 0 ]]; then
    abort "at least one ssh key is required. pass --ssh-key or set PIROME_SSH_KEY."
  fi
}

validate_platform() {
  detect_arch
  detect_os

  ARCH="${DETECTED_ARCH}"
  OS="${DETECTED_OS}"

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

  local user_groups
  user_groups="$(/usr/bin/id -Gn 2>/dev/null || true)"
  if [[ " ${user_groups} " != *" admin "* ]]; then
    abort "you must run this script as a macOS administrator."
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
      warn "${tty_tp}running${tty_reset} in ${tty_ts}non-interactive mode${tty_reset} because \$CI is set."
      NONINTERACTIVE=1
    elif ! interactive_tty_available; then
      if [[ -z "${INTERACTIVE-}" ]]; then
        warn "${tty_tp}running${tty_reset} in ${tty_ts}non-interactive mode${tty_reset} because no interactive terminal is available."
        NONINTERACTIVE=1
      else
        abort "cannot run interactive mode because no interactive terminal is available."
      fi
    elif [[ ! -t 0 ]]; then
      debug "${tty_tp}using${tty_reset} ${tty_ts}/dev/tty${tty_reset} for interactive input because stdin is not a tty."
    fi
  else
    log "${tty_tp}running${tty_reset} in ${tty_ts}non-interactive mode${tty_reset} ${tty_dim}because \$NONINTERACTIVE is set${tty_reset}"
  fi
}

core_remediation_needed() {
  [[ "${CORE_NEEDS_REMEDIATION:-0}" == "1" ]]
}

run_bootbox_from_tmpdir() (
  cd "${BOOT_TMPDIR}" || exit 1
  "$@"
)

bootbox_run() {
  local env_name
  local arg
  local mask_next="0"
  local -a unset_env_names=(
    BOOTBOX_BREWFILE
    BOOTBOX_BREWFILES
    BOOTBOX_DOTPKG
    BOOTBOX_DOTPKGS
    BOOTBOX_SSH_KEY
    BOOTBOX_SSH_KEYS
    BOOTBOX_OP_TOKEN
    BOOTBOX_FORCE
    BOOTBOX_DEBUG
    BOOTBOX_QUIET
    BOOTBOX_NO_SUDO
    BOOTBOX_EXTERNAL_SUDO
    BOOTBOX_ARCH
    BOOTBOX_OS
    BOOTBOX_TARGET
    TANAAB_BREWFILE
    TANAAB_BREWFILES
    TANAAB_DOTPKG
    TANAAB_DOTPKGS
    TANAAB_SSH_KEY
    TANAAB_SSH_KEYS
    TANAAB_OP_TOKEN
    OP_SERVICE_ACCOUNT_TOKEN
    TANAAB_FORCE
    TANAAB_DEBUG
    TANAAB_QUIET
    TANAAB_ARCH
    TANAAB_OS
    TANAAB_TARGET
    INTERACTIVE
  )
  local -a bootbox_command=(env)
  local -a bootbox_display_command=()

  for env_name in "${unset_env_names[@]}"; do
    bootbox_command+=(-u "${env_name}")
  done

  if [[ -n "${DEBUG-}" ]]; then
    bootbox_command+=("BOOTBOX_DEBUG=${DEBUG}")
    bootbox_display_command+=("PIROME_DEBUG=${DEBUG}")
  fi

  if [[ -n "${FORCE-}" ]]; then
    bootbox_command+=("BOOTBOX_FORCE=${FORCE}")
    bootbox_display_command+=("PIROME_FORCE=${FORCE}")
  fi

  # The wrapper owns user-facing status; delegated bootbox runs should stay quiet.
  bootbox_command+=("BOOTBOX_QUIET=1")
  bootbox_display_command+=("BOOTBOX_QUIET=1")

  # The wrapper owns the confirmation gate; delegated bootbox runs should not prompt again.
  bootbox_command+=("NONINTERACTIVE=1")
  bootbox_display_command+=("NONINTERACTIVE=1")

  bootbox_command+=(/bin/bash "${BOOTBOX_SCRIPT_PATH}")
  bootbox_display_command+=(/bin/bash "${BOOTBOX_SCRIPT_PATH}")

  for arg in "$@"; do
    bootbox_command+=("${arg}")

    if [[ "${mask_next}" == "1" ]]; then
      bootbox_display_command+=("$(mask_secret_for_display "${arg}")")
      mask_next="0"
      continue
    fi

    if [[ "${arg}" == --op-token=* ]]; then
      bootbox_display_command+=("--op-token=$(mask_secret_for_display "${arg#*=}")")
      continue
    fi

    bootbox_display_command+=("${arg}")

    if [[ "${arg}" == "--op-token" ]]; then
      mask_next="1"
    fi
  done

  debug "${tty_tp}delegating${tty_reset} to ${tty_ts}bootbox${tty_reset} from ${tty_ts}${BOOT_TMPDIR}${tty_reset} with $(shell_join "${bootbox_display_command[@]}")"
  run_bootbox_from_tmpdir "${bootbox_command[@]}"
}

bootbox_run_or_abort() {
  local failure_message="$1"
  shift

  if ! bootbox_run "$@"; then
    abort "${failure_message}"
  fi
}

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

  plan_me_payload
  plan_tanaab_repos
  plan_plugin_reconciliation
  plan_me_apply
}

prepare_bootbox_script() {
  BOOT_TMPDIR="$(mktemp -d -t me-boot.XXXXXX)"
  BOOTBOX_SCRIPT_PATH="${BOOT_TMPDIR}/bootbox.sh"

  execute "${CURL}" -fsSL "${BOOTBOX_URL}" -o "${BOOTBOX_SCRIPT_PATH}"
  execute chmod 700 "${BOOTBOX_SCRIPT_PATH}"
}

run_bootbox_check_core() {
  debug "${tty_tp}checking${tty_reset} ${tty_ts}bootbox core requirements${tty_reset} from ${tty_ts}${BOOT_TMPDIR}${tty_reset}"
  if bootbox_run --check-core; then
    CORE_NEEDS_REMEDIATION="0"
    debug "bootbox core requirements are satisfied"
    return 0
  fi

  CORE_NEEDS_REMEDIATION="1"
  debug "bootbox core requirements need remediation"
  return 1
}

ensure_bootbox_core_requirements() {
  if ! core_remediation_needed; then
    return 0
  fi

  bootbox_run_or_abort "bootbox failed while ensuring core requirements."
  if ! run_bootbox_check_core; then
    abort "bootbox core requirements are still not satisfied after remediation."
  fi
}

run_bootbox_for_ssh_key() {
  local ssh_key="$1"
  bootbox_run_or_abort "bootbox failed while installing ssh key ${tty_ts}$(ssh_key_filename "${ssh_key}")${tty_reset}." \
    --op-token "${OP_TOKEN}" --ssh-key "${ssh_key}"
}

run_bootbox() {
  local ssh_key
  local destination_path
  local -a ssh_keys_to_run=()

  collect_ssh_key_actions

  if [[ "${#SSH_KEYS_TO_SKIP[@]}" -gt 0 ]]; then
    for ssh_key in "${SSH_KEYS_TO_SKIP[@]}"; do
      destination_path="$(ssh_key_destination_path "${ssh_key}")"
      warn "${tty_tp}skipping${tty_reset} ssh key ${tty_ts}${ssh_key}${tty_reset} because ${tty_ts}${destination_path}${tty_reset} already exists and ${tty_bold}--force${tty_reset} is not set."
    done
  fi

  if [[ "${#SSH_KEYS_TO_INSTALL[@]}" -eq 0 && "${#SSH_KEYS_TO_OVERWRITE[@]}" -eq 0 ]]; then
    debug "no SSH keys require installation after wrapper-side filtering"
    return 0
  fi

  if [[ "${#SSH_KEYS_TO_INSTALL[@]}" -gt 0 ]]; then
    ssh_keys_to_run+=("${SSH_KEYS_TO_INSTALL[@]}")
  fi

  if [[ "${#SSH_KEYS_TO_OVERWRITE[@]}" -gt 0 ]]; then
    ssh_keys_to_run+=("${SSH_KEYS_TO_OVERWRITE[@]}")
  fi

  for ssh_key in "${ssh_keys_to_run[@]}"; do
    run_bootbox_for_ssh_key "${ssh_key}"
  done
}

run_me_post_bootstrap_summary() {
  log
  log "me setup ${tty_green}succeeded${tty_reset}"
}

main() {
  trap cleanup EXIT
  parse_args "$@"
  validate_inputs
  validate_platform
  apply_noninteractive_mode
  prepare_me_apply_cask_skips

  debug "${tty_tp}running${tty_reset}" "${SCRIPT_NAME}" script version: "${SCRIPT_VERSION}"
  debug raw CI="${CI:-}"
  debug raw NONINTERACTIVE="${NONINTERACTIVE:-}"
  debug raw DEBUG="${DEBUG:-}"
  debug raw FORCE="${FORCE:-}"
  debug raw OP_TOKEN="$(mask_secret_for_display "${OP_TOKEN}")"
  debug raw SSH_KEYS="$(array_join "," SSH_KEYS)"
  debug raw TANAAB_REPOS="$(array_join "," TANAAB_REPOS)"
  debug raw AGENTBOX_HOST_DETECTED="${AGENTBOX_HOST_DETECTED}"
  debug raw HOMEBREW_BUNDLE_CASK_SKIP="${ME_HOMEBREW_BUNDLE_CASK_SKIP}"
  debug raw BOOTBOX_URL="${BOOTBOX_URL}"
  debug raw CURL="${CURL}"
  debug raw ARCH="${ARCH}"
  debug raw OS="${OS}"
  prepare_me_payload
  debug raw PIROME_PAYLOAD_DIR="$(me_payload_display)"
  debug raw ME_PAYLOAD_SOURCE="$(me_payload_source_display)"

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
  materialize_me_payload
  materialize_tanaab_repos
  reconcile_tanaab_plugin_links
  discover_me_apply_payload
  debug raw ME_APPLY_BREWFILE="$(me_apply_brewfile_display)"
  debug raw ME_APPLY_DOTPKGS="$(array_join "," ME_APPLY_DOTPKGS)"
  run_bootbox_for_me_apply
  run_me_post_bootstrap_summary
}

main "$@"
