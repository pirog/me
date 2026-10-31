import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { inspectAccountDefaults } from './account-defaults.js';

/** Adds bounded private account preferences to the policy without resolving credentials. */
export async function accountPolicy(pluginData) {
  const policy = await readFile(
    new URL('../references/account-policy.md', import.meta.url),
    'utf8',
  );
  const runtime =
    pluginData && path.isAbsolute(pluginData)
      ? {
          argvPrefix: [
            process.execPath,
            fileURLToPath(new URL('../scripts/account-binding-task.js', import.meta.url)),
          ],
          pluginData,
        }
      : null;
  const guidePath = fileURLToPath(new URL('../references/account-binding.md', import.meta.url));
  const state = await inspectAccountDefaults(pluginData);
  return `${policy}\n<piroplugin-account-context>\n${JSON.stringify({ version: 1, guidePath, runtime, ...state })}\n</piroplugin-account-context>\n`;
}
