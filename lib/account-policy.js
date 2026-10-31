import { open, readFile } from 'node:fs/promises';
import path from 'node:path';

const unavailable =
  'private account defaults are unavailable; use an explicit operator-approved account selection or stop the affected service operation. do not guess a default.';

/** Loads guidance and optional private preferences, never credentials or authorization grants. */
export async function accountPolicy(pluginData) {
  const policy = await readFile(
    new URL('../references/account-policy.md', import.meta.url),
    'utf8',
  );
  if (policy.length > 12_000) throw new Error('account-policy-too-large');
  if (!pluginData || !path.isAbsolute(pluginData)) return `${policy}\n${unavailable}\n`;

  let file;
  try {
    file = await open(path.join(pluginData, 'account-defaults.json'), 'r');
    const buffer = Buffer.alloc(8193);
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0);
    if (bytesRead > 8192) throw new Error('account-defaults-too-large');
    const preferences = JSON.parse(buffer.subarray(0, bytesRead).toString('utf8'));
    if (!validPreferences(preferences)) throw new Error('account-defaults-invalid');
    return `${policy}\n## private account preferences\n\nthese values select defaults only. omitted roles/services have no configured default. they do not establish execution identity, authenticate connections or grant authority. do not publish them.\n\n${JSON.stringify(preferences.defaults)}\n`;
  } catch {
    return `${policy}\n${unavailable} configure valid account-defaults.json in the host-provided PLUGIN_DATA directory.\n`;
  } finally {
    await file?.close();
  }
}

function validPreferences(value) {
  if (!value || value.version !== 1 || !onlyKeys(value, ['version', 'defaults'])) return false;
  if (!onlyKeys(value.defaults, ['pirog', 'tanaabot'])) return false;
  return Object.values(value.defaults).every(
    (accounts) =>
      onlyKeys(accounts, ['github', 'google']) &&
      Object.entries(accounts).every(([service, identity]) => {
        if (typeof identity !== 'string' || identity.length > 254) return false;
        return service === 'github'
          ? /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(identity)
          : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(identity);
      }),
  );
}

function onlyKeys(value, keys) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0 &&
    Object.keys(value).every((key) => keys.includes(key))
  );
}
