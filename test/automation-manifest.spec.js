import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { loadAutomationManifest } from '../lib/automation-manifest.js';

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const AUTOMATION_TASK_PATH = path.join(
  REPO_ROOT,
  'skills',
  'automation',
  'scripts',
  'automation-task.js',
);

describe('lib/automation-manifest', () => {
  const tempRoots = [];

  afterEach(async () => {
    await Promise.all(tempRoots.splice(0).map((tempRoot) => rm(tempRoot, { recursive: true })));
  });

  async function createRepo(manifest) {
    const repoRoot = await mkdtemp(path.join(os.tmpdir(), 'piro-automation-manifest-'));
    tempRoots.push(repoRoot);
    await writeFile(path.join(repoRoot, 'AUTOMATIONS.yaml'), JSON.stringify(manifest));
    return repoRoot;
  }

  it('should load the shipped smoke automation', async () => {
    const result = await execFileAsync('bun', [AUTOMATION_TASK_PATH, 'validate'], {
      cwd: REPO_ROOT,
    });

    assert.deepEqual(JSON.parse(result.stdout), {
      automationCount: 1,
      ok: true,
      schemaVersion: 1,
    });
  });

  it('should resolve prompt files only from automations', async () => {
    const repoRoot = await createRepo({
      automations: [
        {
          enabled: false,
          id: 'weekly-note',
          name: 'Weekly note',
          'prompt-file': 'automations/weekly-note.md',
          schedule: { at: '08:00', frequency: 'weekly', weekdays: ['monday'] },
        },
      ],
      'schema-version': 1,
    });
    await mkdir(path.join(repoRoot, 'automations'));
    await writeFile(path.join(repoRoot, 'automations', 'weekly-note.md'), 'Write the note.\n');

    const manifest = await loadAutomationManifest({ parseYaml: JSON.parse, repoRoot });

    assert.equal(manifest.automations[0].prompt, 'Write the note.');
  });

  it('should reject unknown fields and duplicate ids', async () => {
    const rawTask = {
      enabled: true,
      id: 'duplicate',
      name: 'Duplicate',
      prompt: 'Test',
      schedule: { frequency: 'minutely' },
    };
    const unknownRoot = await createRepo({
      automations: [],
      'schema-version': 1,
      schema_version: 1,
    });
    await assert.rejects(
      loadAutomationManifest({ parseYaml: JSON.parse, repoRoot: unknownRoot }),
      /must use kebab-case/,
    );

    const duplicateRoot = await createRepo({
      automations: [rawTask, rawTask],
      'schema-version': 1,
    });
    await assert.rejects(
      loadAutomationManifest({ parseYaml: JSON.parse, repoRoot: duplicateRoot }),
      /duplicate id/,
    );
  });

  it('should reject prompt files that escape through a symlink', async () => {
    const repoRoot = await createRepo({
      automations: [
        {
          enabled: true,
          id: 'escaped',
          name: 'Escaped',
          'prompt-file': 'automations/escaped.md',
          schedule: { frequency: 'minutely' },
        },
      ],
      'schema-version': 1,
    });
    await mkdir(path.join(repoRoot, 'automations'));
    await writeFile(path.join(repoRoot, 'outside.md'), 'Outside.\n');
    await symlink('../outside.md', path.join(repoRoot, 'automations', 'escaped.md'));

    await assert.rejects(
      loadAutomationManifest({ parseYaml: JSON.parse, repoRoot }),
      /resolves outside automations/,
    );
  });

  it('should require exactly one prompt source and absolute local project paths', async () => {
    const repoRoot = await createRepo({
      automations: [
        {
          enabled: true,
          id: 'invalid',
          'local-project': { path: 'relative/project' },
          name: 'Invalid',
          prompt: 'Inline',
          'prompt-file': 'automations/invalid.md',
          schedule: { frequency: 'minutely' },
        },
      ],
      'schema-version': 1,
    });

    await assert.rejects(
      loadAutomationManifest({ parseYaml: JSON.parse, repoRoot }),
      /exactly one of prompt or prompt-file/,
    );

    const relativeProjectRoot = await createRepo({
      automations: [
        {
          enabled: true,
          id: 'invalid-project',
          'local-project': { path: 'relative/project' },
          name: 'Invalid project',
          prompt: 'Inline',
          schedule: { frequency: 'minutely' },
        },
      ],
      'schema-version': 1,
    });
    await assert.rejects(
      loadAutomationManifest({ parseYaml: JSON.parse, repoRoot: relativeProjectRoot }),
      /local-project\.path must be absolute/,
    );
  });
});
