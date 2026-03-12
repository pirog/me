#!/bin/bash
set -euo pipefail
# describe what this CLI does.
#
# examples:
#
#   $ ./bash-cli.sh
#   $ ./bash-cli.sh --debug
#   $ SCRIPT_VERSION=0.1.0 ./bash-cli.sh --version
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
ORIGOPTS="$*"

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

  if debug_enabled; then
    debug_display="on"
  fi

  if force_enabled; then
    force_display="on"
  fi

  cat <<EOS
Usage: ${tty_bold}${CLI_NAME}${tty_reset} ${tty_dim}[options] [arguments...]${tty_reset}

${tty_tp}Options:${tty_reset}
  --force               enables force mode ${tty_dim}[default: ${force_display}]${tty_reset}
  --debug               shows debug messages ${tty_dim}[default: ${debug_display}]${tty_reset}
  --version             shows the CLI version ${tty_dim}[default: ${SCRIPT_VERSION}]${tty_reset}
  -h, --help            displays this help message

${tty_tp}Environment Variables:${tty_reset}
  DEBUG                 enables debug output
  FORCE_COLOR           overrides detected color support
  NO_COLOR              disables color output
  RUNNER_DEBUG          enables debug output when set to 1
  TANAAB_DEBUG          enables debug output
  TANAAB_FORCE          enables force mode

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
  debug "raw args ${CLI_NAME} ${ORIGOPTS}"
  debug raw DEBUG="${DEBUG:-}"
  debug raw FORCE="${FORCE:-}"
  debug raw POSITIONALS="$(shell_join "${POSITIONALS[@]}")"

  if [[ "${#POSITIONALS[@]}" -gt 0 ]]; then
    warn "handle or reject positional arguments before shipping this CLI"
  fi

  note "replace run_cli() with project-specific behavior"
  success "wire your command execution flow here"
}

main() {
  parse_args "$@"
  run_cli
}

main "$@"
