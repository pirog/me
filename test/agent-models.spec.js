import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { loadAgentModels } from '../lib/agent-models.js';
import agentModelsConfig from '../utils/agent-models-config.js';
import validateAgentModels from '../utils/validate-agent-models.js';

describe('agent model configuration', () => {
  it('should retain Astra defaults with Luna and Sol work profiles', async () => {
    const models = await loadAgentModels();
    assert.deepEqual(models, {
      default: { model: 'openai/gpt-6-astra', effort: 'high' },
      low: { model: 'openai/gpt-6-luna', effort: 'medium' },
      medium: { model: 'openai/gpt-6-sol', effort: 'high' },
      high: { model: 'openai/gpt-6-astra', effort: 'high' },
    });
    assert.deepEqual(agentModelsConfig(models), {
      model: 'gpt-6-astra',
      model_reasoning_effort: 'high',
    });
  });

  it('should load the owning profile regardless of the task cwd', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'me-agent-models-'));
    try {
      await writeFile(path.join(root, 'agent.yaml'), 'schema-version: 99\n');
      const moduleUrl = new URL('../lib/agent-models.js', import.meta.url).href;
      const { stdout } = await promisify(execFile)(
        process.execPath,
        [
          '-e',
          `import {loadAgentModels} from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(await loadAgentModels()));`,
        ],
        { cwd: root },
      );
      assert.deepEqual(JSON.parse(stdout), await loadAgentModels());
      await assert.rejects(loadAgentModels(root), /schema-version/);
      await assert.rejects(loadAgentModels(path.join(root, 'missing')), { code: 'ENOENT' });
    } finally {
      await rm(root, { recursive: true });
    }
  });

  it('should project only a default pair without mutation or task-time xhigh justification', () => {
    const models = { default: { model: 'openai/future-model', effort: 'xhigh' } };
    const before = structuredClone(models);
    assert.deepEqual(agentModelsConfig(models), {
      model: 'future-model',
      model_reasoning_effort: 'xhigh',
    });
    assert.deepEqual(models, before);
  });

  for (const [label, models] of [
    ['missing models', undefined],
    ['missing default', {}],
    [
      'incomplete tiers',
      {
        default: { model: 'openai/example', effort: 'high' },
        low: { model: 'openai/example', effort: 'medium' },
      },
    ],
    ['unknown profile', { default: { model: 'openai/example', effort: 'high' }, extra: {} }],
    ['unqualified model', { default: { model: 'example', effort: 'high' } }],
    ['malformed model', { default: { model: 'openai/model with spaces', effort: 'high' } }],
    ['unsupported automatic effort', { default: { model: 'openai/example', effort: 'ultra' } }],
    [
      'old configured reason',
      { default: { model: 'openai/example', effort: 'xhigh', reason: 'old schema' } },
    ],
  ]) {
    it(`should reject ${label}`, () => {
      assert.throws(() => validateAgentModels(models));
    });
  }

  it('should reject an unsupported Codex provider without substituting a model', () => {
    assert.throws(
      () => agentModelsConfig({ default: { model: 'other/model', effort: 'high' } }),
      /openai provider/,
    );
  });
});
