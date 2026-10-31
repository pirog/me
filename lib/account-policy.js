import { readFile } from 'node:fs/promises';

/** Loads the repo-owned account policy without reading credentials or private configuration. */
export async function accountPolicy() {
  return readFile(new URL('../references/account-policy.md', import.meta.url), 'utf8');
}
