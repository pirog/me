#!/bin/bash
set -euo pipefail
# describe what this CLI does.
#
# examples:
#
#   $ ./bash-cli.sh
#   $ ./bash-cli.sh --debug
#   $ TANAAB_ITEM=a,b ./bash-cli.sh --item c --item d
#
# option precedence: cli options override environment variables, which override defaults.
#
# run `./bash-cli.sh --help` for more advanced usage.

abort() {
  printf "%s\n" "$@" >&2
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

# shellcheck disable=SC2292
if [ -z "${BASH_VERSION:-}" ]; then
  abort "Bash is required to interpret this script."
fi

if [[ -n "${POSIXLY_CORRECT+1}" ]]; then
  abort "Bash must not run in POSIX mode. Please unset POSIXLY_CORRECT and try again."
fi

if { [[ -t 1 ]] || value_enabled "${FORCE_COLOR:-}"; } && [[ -z "${NO_COLOR-}" ]]; then
  tty_escape() { printf "\033[%sm" "$1"; }
else
  tty_escape() { :; }
fi

tty_mkbold() { tty_escape "1;$1"; }
tty_mkdim() { tty_escape "2;$1"; }
tty_bold="$(tty_mkbold 39)"
tty_dim="$(tty_mkdim 39)"
tty_green="$(tty_escape 32)"
tty_red="$(tty_mkbold 31)"
tty_reset="$(tty_escape 0)"
tty_yellow="$(tty_escape 33)"
tty_tp="$(tty_escape '38;2;0;200;138')"   # #00c88a
tty_ts="$(tty_escape '38;2;219;39;119')"  # #db2777

CLI_NAME="${0##*/}"
SCRIPT_VERSION="${SCRIPT_VERSION:-0.0.0}"
DEBUG="${TANAAB_DEBUG:-${DEBUG:-${RUNNER_DEBUG:-}}}"
FORCE="${TANAAB_FORCE:-}"
ITEMS_CSV="${TANAAB_ITEM:-}"
ORIGOPTS="$*"
declare -a ORIGINAL_ARGS=("$@")

# shellcheck disable=SC2034
declare -a POSITIONALS=()

chomp() {
  printf "%s" "${1/"$'\n'"/}"
}

debug_enabled() {
  value_enabled "${DEBUG:-}"
}

force_enabled() {
  value_enabled "${FORCE:-}"
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

cli_overrides_option() {
  local option_name="$1"
  shift
  local arg

  for arg in "$@"; do
    case "${arg}" in
      "${option_name}" | "${option_name}"=*)
        return 0
        ;;
    esac
  done

  return 1
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

# shellcheck disable=SC2034
declare -a ITEMS=()
append_csv_to_array ITEMS "${ITEMS_CSV}"

if cli_overrides_option '--item' "${ORIGINAL_ARGS[@]}"; then
  # Any CLI-provided repeatable flag replaces the env-seeded list for that option.
  # shellcheck disable=SC2034
  ITEMS=()
fi

show_version() {
  printf "%s\n" "${SCRIPT_VERSION}"
  exit 0
}

debug() {
  if debug_enabled; then
    printf "${tty_dim}debug${tty_reset} %s\n" "$(shell_join "$@")" >&2
  fi
}

log() {
  printf "%s\n" "$(shell_join "$@")"
}

note() {
  printf "${tty_ts}note${tty_reset}: %s\n" "$(chomp "$(shell_join "$@")")"
}

success() {
  printf "${tty_green}done${tty_reset}: %s\n" "$(chomp "$(shell_join "$@")")"
}

warn() {
  printf "${tty_yellow}warn${tty_reset}: %s\n" "$(chomp "$(shell_join "$@")")" >&2
}

fail() {
  local message="$1"
  local exit_code="${2:-1}"

  printf "${tty_red}error${tty_reset}: %s\n" "$(chomp "${message}")" >&2
  exit "${exit_code}"
}

usage() {
  local debug_display="off"
  local force_display="off"
  local items_display="none"

  if debug_enabled; then
    debug_display="on"
  fi

  if force_enabled; then
    force_display="on"
  fi

  items_display="$(array_join "," ITEMS)"
  items_display="${items_display:-none}"

  cat <<EOS
Usage: ${tty_bold}${CLI_NAME}${tty_reset} ${tty_dim}[options] [arguments...]${tty_reset}

${tty_tp}Options:${tty_reset}
  --force               enables force mode ${tty_dim}[default: ${force_display}]${tty_reset}
  --item                adds a repeatable item ${tty_dim}[default: ${items_display}]${tty_reset}
  --debug               shows debug messages ${tty_dim}[default: ${debug_display}]${tty_reset}
  --version             shows the CLI version ${tty_dim}[default: ${SCRIPT_VERSION}]${tty_reset}
  -h, --help            displays this help message

${tty_tp}Environment Variables:${tty_reset}
  TANAAB_DEBUG          enables debug output
  TANAAB_FORCE          enables force mode
  TANAAB_ITEM           comma-separated repeatable items

EOS
  if [[ "${1:-0}" != "noexit" ]]; then
    exit "${1:-0}"
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --force)
        FORCE="1"
        shift
        ;;
      --force=*)
        FORCE="${1#*=}"
        shift
        ;;
      --item)
        append_array_value ITEMS "$2"
        shift 2
        ;;
      --item=*)
        append_array_value ITEMS "${1#*=}"
        shift
        ;;
      --debug)
        DEBUG="1"
        shift
        ;;
      --debug=*)
        DEBUG="${1#*=}"
        shift
        ;;
      -h | --help)
        usage
        ;;
      --version)
        show_version
        ;;
      --)
        shift
        while [[ $# -gt 0 ]]; do
          POSITIONALS+=("$1")
          shift
        done
        ;;
      -*)
        usage "noexit"
        fail "unrecognized option ${tty_bold}$1${tty_reset}! See available options in usage above."
        ;;
      *)
        POSITIONALS+=("$1")
        shift
        ;;
    esac
  done
}

run_cli() {
  local items_display="none"
  local positionals_display="none"

  items_display="$(array_join "," ITEMS)"
  items_display="${items_display:-none}"

  if [[ "${#POSITIONALS[@]}" -gt 0 ]]; then
    positionals_display="$(shell_join "${POSITIONALS[@]}")"
  fi

  debug "raw args ${CLI_NAME} ${ORIGOPTS}"
  debug raw DEBUG="${DEBUG:-}"
  debug raw FORCE="${FORCE:-}"
  debug raw ITEMS="${items_display}"
  debug raw POSITIONALS="${positionals_display}"

  if [[ "${#POSITIONALS[@]}" -gt 0 ]]; then
    warn "handle or reject positional arguments before shipping this CLI"
  fi

  note "received repeatable items: ${items_display}"
  note "replace run_cli() with project-specific behavior"
  success "wire your command execution flow here"
}

main() {
  parse_args "$@"
  run_cli
}

main "$@"
