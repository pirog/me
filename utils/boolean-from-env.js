import { valueEnabled } from './value-enabled.js';

export function booleanFromEnv(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return valueEnabled(value);
}
