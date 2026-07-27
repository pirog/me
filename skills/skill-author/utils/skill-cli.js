import { CANON_SKILL_BRAND_COLOR } from '../lib/skill-identity.js';

const ANSI_ESCAPE_PREFIX = '\u001B[';

function supportsColor(stream = process.stdout) {
  const forceColor = process.env.FORCE_COLOR;
  if (forceColor !== undefined) {
    return !['0', 'false'].includes(forceColor.toLowerCase());
  }
  if (process.env.NO_COLOR !== undefined) return false;
  return Boolean(stream?.isTTY);
}

function applyAnsi(code, text, stream = process.stdout) {
  const value = String(text);
  return supportsColor(stream)
    ? `${ANSI_ESCAPE_PREFIX}${code}m${value}${ANSI_ESCAPE_PREFIX}0m`
    : value;
}

function applyRgb(hex, text, stream = process.stdout) {
  const value = String(text);
  if (!supportsColor(stream)) return value;

  const normalized = hex.replace(/^#/, '');
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `${ANSI_ESCAPE_PREFIX}38;2;${red};${green};${blue}m${value}${ANSI_ESCAPE_PREFIX}0m`;
}

export function bold(text, stream = process.stdout) {
  return applyAnsi('1', text, stream);
}

export function dim(text, stream = process.stdout) {
  return applyAnsi('2', text, stream);
}

export function tp(text, stream = process.stdout) {
  return applyRgb(CANON_SKILL_BRAND_COLOR, text, stream);
}

export function renderCliHelp({ usage, summary, options, environmentVariables = [] }) {
  const lines = [usage];
  if (summary) lines.push('', summary);
  if (options.length > 0) lines.push('', `${tp('Options')}:`, ...options);
  if (environmentVariables.length > 0) {
    lines.push('', `${tp('Environment Variables')}:`, ...environmentVariables);
  }
  return lines.join('\n');
}
