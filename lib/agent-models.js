import { readFile } from 'node:fs/promises';
import path from 'node:path';

import validateAgentModels from '../utils/validate-agent-models.js';

/** Read Me profiles for Codex config generation; task routing belongs to Agent System. */
export async function loadAgentModels(root = new URL('../', import.meta.url)) {
  const manifestPath =
    root instanceof URL
      ? new URL('.agent-system/agent.yaml', root)
      : path.join(root, '.agent-system', 'agent.yaml');
  const manifest = globalThis.Bun.YAML.parse(await readFile(manifestPath, 'utf8'));
  if (manifest?.['schema-version'] !== 1)
    throw new Error('.agent-system/agent.yaml schema-version must be 1.');
  return validateAgentModels(manifest.models);
}
