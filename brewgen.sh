#!/bin/bash
set -u
# generate a Brewfile from the current homebrew state for selected package types.
#
# examples:
#
#   $ ./brewgen.sh
#   $ ./brewgen.sh --brewfile ./Brewfile.work
#   $ ./brewgen.sh --package-type tap --package-type brew --force
#   $ ./brewgen.sh --exclude codex --exclude visual-studio-code
#
# option precedence: cli options override environment variables, which override defaults.
#
# run `./brewgen.sh --help` for more advanced usage.
#
# Any code that has been modified by the original falls under
# Copyright (c) 2026, Tanaab Maneuvering Systems LLC
#
# All rights reserved.
# See license in the repo: https://github.com/pirog/me/blob/main/LICENSE
#
# shellcheck disable=SC2312

abort() {
  printf "%s\n" "$@" >&2
  exit 1
}

# shellcheck disable=SC2292
if [ -z "${BASH_VERSION:-}" ]; then
  abort "bash is required to interpret this script."
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
tty_green="$(tty_escape 32)"
tty_red="$(tty_mkbold 31)"
tty_reset="$(tty_escape 0)"
tty_yellow="$(tty_escape 33)"
tty_tp="$(tty_escape '38;2;0;200;138')"

if [[ -n "${POSIXLY_CORRECT+1}" ]]; then
  abort "bash must not run in POSIX mode. please unset ${tty_bold}POSIXLY_CORRECT${tty_reset} and try again."
fi

BREWFILE="${TANAAB_BREWFILE:-Brewfile}"
DEBUG="${TANAAB_DEBUG:-${DEBUG:-${RUNNER_DEBUG:-}}}"
EXCLUDES_CSV="${TANAAB_EXCLUDE:-}"
FORCE="${TANAAB_FORCE:-}"
PACKAGE_TYPES_CSV="${TANAAB_PACKAGE_TYPES:-tap,cask,brew}"

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

# shellcheck disable=SC2034
declare -a PACKAGE_TYPES=()
append_csv_to_array PACKAGE_TYPES "${PACKAGE_TYPES_CSV}"

# shellcheck disable=SC2034
declare -a EXCLUDES=()
append_csv_to_array EXCLUDES "${EXCLUDES_CSV}"

for arg in "$@"; do
  case "${arg}" in
    --package-type | --package-type=*)
      PACKAGE_TYPES=()
      break
      ;;
  esac
done

for arg in "$@"; do
  case "${arg}" in
    --exclude | --exclude=*)
      EXCLUDES=()
      break
      ;;
  esac
done

show_version() {
  if [[ -n "${SCRIPT_VERSION:-}" ]]; then
    printf "%s\n" "${SCRIPT_VERSION}"
    exit 0
  fi

  if command -v git >/dev/null 2>&1; then
    if SCRIPT_VERSION="$(git describe --tags --always --abbrev=1 2>/dev/null)"; then
      printf "%s\n" "${SCRIPT_VERSION}"
      exit 0
    fi
  fi

  printf "unknown\n"
  exit 0
}

usage() {
  local package_types_display
  local excludes_display

  package_types_display="$(array_join "," PACKAGE_TYPES)"
  package_types_display="${package_types_display:-none}"
  excludes_display="$(array_join "," EXCLUDES)"
  excludes_display="${excludes_display:-none}"

  cat <<EOS
Usage: ${tty_bold}brewgen.sh${tty_reset} ${tty_dim}[options]${tty_reset}

${tty_tp}Options:${tty_reset}
  --brewfile            writes the Brewfile to this path ${tty_dim}[default: ${BREWFILE}]${tty_reset}
  --exclude             excludes this package from the final Brewfile ${tty_dim}[default: ${excludes_display}]${tty_reset}
  --force               overwrites existing output files ${tty_dim}[default: off]${tty_reset}
  --package-type        limits generation to this package type ${tty_dim}[default: ${package_types_display}]${tty_reset}
  --version             shows version of this script
  --debug               shows debug messages
  -h, --help            displays this help message

${tty_tp}Environment Variables:${tty_reset}
  TANAAB_BREWFILE       brewfile output path
  TANAAB_EXCLUDE        comma-separated package names to exclude
  TANAAB_FORCE          set to a truthy value to overwrite existing files
  TANAAB_PACKAGE_TYPES  comma-separated package types to dump
  TANAAB_DEBUG          set to a truthy value to show debug messages

EOS
  if [[ "${1:-0}" != "noexit" ]]; then
    exit "${1:-0}"
  fi
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

boolean_enabled() {
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
  boolean_enabled "${DEBUG:-}"
}

force_enabled() {
  boolean_enabled "${FORCE:-}"
}

lowercase() {
  printf "%s" "$1" | tr '[:upper:]' '[:lower:]'
}

normalize_package_type() {
  case "$(lowercase "$1")" in
    formula)
      printf "brew"
      ;;
    brew | tap | cask | mas | vscode | go | cargo | uv | flatpak)
      printf "%s" "$(lowercase "$1")"
      ;;
    *)
      return 1
      ;;
  esac
}

validate_package_types() {
  local package_type
  local normalized
  local seen=" "
  local -a normalized_package_types=()

  if [[ "${#PACKAGE_TYPES[@]}" -eq 0 ]]; then
    abort "at least one package type must be specified."
  fi

  for package_type in "${PACKAGE_TYPES[@]}"; do
    normalized="$(normalize_package_type "${package_type}" || true)"
    if [[ -z "${normalized}" ]]; then
      abort "unsupported package type: ${package_type}"
    fi

    if [[ "${seen}" != *" ${normalized} "* ]]; then
      normalized_package_types+=("${normalized}")
      seen="${seen}${normalized} "
    fi
  done

  PACKAGE_TYPES=("${normalized_package_types[@]}")
}

validate_excludes() {
  local exclude
  local seen=" "
  local -a normalized_excludes=()

  if [[ "${#EXCLUDES[@]}" -eq 0 ]]; then
    return 0
  fi

  for exclude in "${EXCLUDES[@]}"; do
    if [[ "${seen}" != *" ${exclude} "* ]]; then
      normalized_excludes+=("${exclude}")
      seen="${seen}${exclude} "
    fi
  done

  EXCLUDES=("${normalized_excludes[@]}")
}

debug() {
  if debug_enabled; then
    printf "${tty_dim}debug${tty_reset} %s\n" "$(shell_join "$@")" >&2
  fi
}

log() {
  printf "%s\n" "$*"
}

warn() {
  printf "${tty_yellow}warning${tty_reset}: %s\n" "$*" >&2
}

execute() {
  debug "$@"
  "$@"
}

test_brew() {
  if [[ ! -x "$1" ]]; then
    return 1
  fi

  "$1" --version >/dev/null 2>&1
}

find_brew() {
  local candidate

  if command -v brew >/dev/null 2>&1; then
    command -v brew
    return 0
  fi

  for candidate in /opt/homebrew/bin/brew /usr/local/bin/brew; do
    if test_brew "${candidate}"; then
      printf "%s\n" "${candidate}"
      return 0
    fi
  done

  return 1
}

normalize_path() {
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

prepare_output_path() {
  local label="$1"
  local path="$2"
  local parent

  if [[ -d "${path}" ]]; then
    abort "${label} path is a directory: ${path}"
  fi

  parent="$(dirname "${path}")"
  if [[ ! -d "${parent}" ]]; then
    if ! execute mkdir -p "${parent}"; then
      abort "failed to create ${label} parent directory: ${parent}"
    fi
  fi

  if [[ ! -w "${parent}" ]]; then
    abort "cannot write to ${label} parent directory: ${parent}"
  fi

  if [[ -e "${path}" ]] && ! force_enabled; then
    abort "${label} already exists: ${path}. re-run with --force to overwrite it."
  fi
}

ensure_brew_bundle_available() {
  if ! execute "${BREW}" bundle --help >/dev/null 2>&1; then
    abort "\`brew bundle\` is required. update homebrew and try again."
  fi
}

brew_dump_flag_for_package_type() {
  case "$1" in
    brew)
      printf "%s" "--formula"
      ;;
    tap)
      printf "%s" "--tap"
      ;;
    cask)
      printf "%s" "--cask"
      ;;
    mas | vscode | go | cargo | uv | flatpak)
      printf "%s" "--$1"
      ;;
    *)
      abort "unsupported package type: $1"
      ;;
  esac
}

dump_package_type() {
  local package_type="$1"
  local dump_flag
  local tmpfile
  local content

  dump_flag="$(brew_dump_flag_for_package_type "${package_type}")"
  tmpfile="$(mktemp -t brewgen.section.XXXXXX)"

  if ! "${BREW}" bundle dump --file "${tmpfile}" --force "${dump_flag}"; then
    rm -f "${tmpfile}"
    return 1
  fi

  content="$(cat "${tmpfile}")"
  rm -f "${tmpfile}"
  printf "%s" "${content}"
}

exclude_match() {
  local package_name="$1"
  local exclude

  for exclude in "${EXCLUDES[@]}"; do
    if [[ "${exclude}" == "${package_name}" ]]; then
      return 0
    fi
  done

  return 1
}

extract_package_name() {
  if [[ "$1" =~ ^[[:space:]]*[a-z_]+[[:space:]]+\"([^\"]+)\" ]]; then
    printf "%s" "${BASH_REMATCH[1]}"
    return 0
  fi

  return 1
}

filter_section_excludes() {
  local section="$1"
  local line
  local package_name
  local output=""
  local pending_comments=""

  if [[ "${#EXCLUDES[@]}" -eq 0 ]]; then
    printf "%s" "${section}"
    return 0
  fi

  while IFS= read -r line || [[ -n "${line}" ]]; do
    if [[ -z "${line}" ]]; then
      continue
    fi

    if [[ "${line}" == \#* ]]; then
      pending_comments="${pending_comments}${pending_comments:+$'\n'}${line}"
      continue
    fi

    if package_name="$(extract_package_name "${line}" || true)"; then
      if exclude_match "${package_name}"; then
        pending_comments=""
        continue
      fi
    fi

    if [[ -n "${pending_comments}" ]]; then
      output="${output}${output:+$'\n'}${pending_comments}"
      pending_comments=""
    fi

    output="${output}${output:+$'\n'}${line}"
  done <<< "${section}"

  printf "%s" "${output}"
}

generate_brewfile() {
  local package_type
  local section
  local tmpfile
  local output=""

  tmpfile="$(mktemp -t brewgen.brewfile.XXXXXX)"
  log "${tty_tp}writing${tty_reset} brewfile to ${tty_green}${BREWFILE}${tty_reset}"
  debug "package types: $(array_join "," PACKAGE_TYPES)"

  for package_type in "${PACKAGE_TYPES[@]}"; do
    debug "dumping package type ${package_type}"
    if ! section="$(dump_package_type "${package_type}")"; then
      rm -f "${tmpfile}"
      abort "failed to dump package type: ${package_type}"
    fi

    section="$(filter_section_excludes "${section}")"

    while [[ "${section}" == *$'\n' ]]; do
      section="${section%$'\n'}"
    done

    if [[ -n "${section}" ]]; then
      output="${output}${output:+$'\n\n'}${section}"
    fi
  done

  if ! printf "%s\n" "${output}" > "${tmpfile}"; then
    rm -f "${tmpfile}"
    abort "failed to write temporary brewfile output."
  fi

  if ! execute mv -f "${tmpfile}" "${BREWFILE}"; then
    rm -f "${tmpfile}"
    abort "failed to generate brewfile: ${BREWFILE}"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --brewfile)
      if [[ $# -lt 2 ]]; then
        abort "--brewfile requires a value."
      fi
      BREWFILE="$2"
      shift 2
      ;;
    --brewfile=*)
      BREWFILE="${1#*=}"
      shift
      ;;
    --package-type)
      if [[ $# -lt 2 ]]; then
        abort "--package-type requires a value."
      fi
      append_array_value PACKAGE_TYPES "$2"
      shift 2
      ;;
    --package-type=*)
      append_array_value PACKAGE_TYPES "${1#*=}"
      shift
      ;;
    --exclude)
      if [[ $# -lt 2 ]]; then
        abort "--exclude requires a value."
      fi
      append_array_value EXCLUDES "$2"
      shift 2
      ;;
    --exclude=*)
      append_array_value EXCLUDES "${1#*=}"
      shift
      ;;
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
      if [[ $# -gt 0 ]]; then
        usage "noexit"
        abort "positional arguments are not supported: $(shell_join "$@")"
      fi
      break
      ;;
    -*)
      usage "noexit"
      abort "${tty_red}unrecognized option${tty_reset} ${tty_bold}$1${tty_reset}! see available options in usage above."
      ;;
    *)
      usage "noexit"
      abort "positional arguments are not supported: $1"
      ;;
  esac
done

BREWFILE="$(normalize_path "${BREWFILE}")"
validate_package_types
validate_excludes

export HOMEBREW_NO_AUTO_UPDATE="${HOMEBREW_NO_AUTO_UPDATE:-1}"
if debug_enabled; then
  export HOMEBREW_DEBUG=1
fi

BREW="$(find_brew || true)"
if [[ -z "${BREW}" ]]; then
  abort "homebrew is required. install homebrew or add \`brew\` to ${tty_bold}PATH${tty_reset} and try again."
fi

prepare_output_path "brewfile" "${BREWFILE}"

debug "running brewgen.sh"
debug "raw args brewgen.sh ${ORIGOPTS}"
debug raw BREW="${BREW}"
debug raw BREWFILE="${BREWFILE}"
debug raw "${tty_bold}DEBUG${tty_reset}=${DEBUG}"
debug raw FORCE="${FORCE}"
debug raw "${tty_bold}HOMEBREW_NO_AUTO_UPDATE${tty_reset}=${HOMEBREW_NO_AUTO_UPDATE}"
debug raw PACKAGE_TYPES="$(array_join "," PACKAGE_TYPES)"
debug raw EXCLUDES="$(array_join "," EXCLUDES)"

ensure_brew_bundle_available
generate_brewfile

log "brewfile generation ${tty_green}complete${tty_reset}"
