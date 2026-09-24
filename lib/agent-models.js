import { readFile } from 'node:fs/promises';
import path from 'node:path';

import validateAgentModels from '../utils/validate-agent-models.js';

/** Read profiles from the owning Me checkout/plugin, independently of Agent System or cwd. */
export async function loadAgentModels(root = new URL('../', import.meta.url)) {
  const manifestPath =
    root instanceof URL ? new URL('agent.yaml', root) : path.join(root, 'agent.yaml');
  const manifest = globalThis.Bun.YAML.parse(await readFile(manifestPath, 'utf8'));
  if (manifest?.['schema-version'] !== 1) throw new Error('agent.yaml schema-version must be 1.');
  return validateAgentModels(manifest.models);
}
