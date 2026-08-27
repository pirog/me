import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
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

function planShippedAutomations() {
  return new Promise((resolve, reject) => {
    const child = spawn('bun', [AUTOMATION_TASK_PATH, 'plan'], { cwd: REPO_ROOT });
    let stderr = '';
    let stdout = '';
    child.stderr.setEncoding('utf8');
    child.stdout.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `automation planner exited with code ${code}`));
        return;
      }
      resolve(JSON.parse(stdout));
    });
    child.stdin.end(
      JSON.stringify({
        actualTasks: [],
        defaults: { model: 'gpt-5.6-sol', reasoningEffort: 'xhigh' },
        projects: [],
      }),
    );
  });
}

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

  it('should load the shipped automation set', async () => {
    const result = await execFileAsync('bun', [AUTOMATION_TASK_PATH, 'validate'], {
      cwd: REPO_ROOT,
    });

    assert.deepEqual(JSON.parse(result.stdout), {
      automationCount: 3,
      ok: true,
      schemaVersion: 1,
    });

    const plan = await planShippedAutomations();
    const automations = new Map(plan.actions.map((action) => [action.manifestId, action.expected]));
    assert.equal(automations.get('smoke-test').status, 'PAUSED');
    assert.equal(automations.get('smoke-test').projectId, null);
    assert.equal(automations.get('smoke-test').rrule, 'RRULE:FREQ=MINUTELY;INTERVAL=15');
    assert.equal(automations.get('morning-closeout').status, 'ACTIVE');
    assert.equal(automations.get('morning-closeout').name, '🧹 MORNING CLOSEOUT');
    assert.equal(automations.get('morning-closeout').projectId, null);
    const morningPrompt = automations.get('morning-closeout').prompt;
    assert.match(morningPrompt, /# AUTOMATION PREFLIGHT/);
    assert.match(morningPrompt, /# ❌ AUTOMATION ERROR/);
    assert.match(morningPrompt, /## Attempts/);
    assert.match(morningPrompt, /Preflight proves that the automation/);
    assert.match(morningPrompt, /at most three\s+total attempts/);
    assert.match(morningPrompt, /authorized host execution context/);
    assert.match(morningPrompt, /active-task discovery was incomplete/);
    assert.match(morningPrompt, /Do not begin candidate discovery/);
    assert.ok(
      morningPrompt.indexOf('# AUTOMATION PREFLIGHT') < morningPrompt.indexOf('# MORNING CLOSEOUT'),
    );
    assert.equal(
      automations.get('morning-closeout').rrule,
      'RRULE:FREQ=WEEKLY;BYHOUR=4;BYMINUTE=0;BYDAY=MO,TU,WE,TH,FR',
    );
    assert.equal(automations.get('daily-work-plan').status, 'ACTIVE');
    assert.equal(automations.get('daily-work-plan').name, '📋 DAILY WORK PLAN');
    assert.equal(automations.get('daily-work-plan').projectId, null);
    const dailyPrompt = automations.get('daily-work-plan').prompt;
    assert.match(dailyPrompt, /# AUTOMATION PREFLIGHT/);
    assert.match(dailyPrompt, /# ❌ AUTOMATION ERROR/);
    assert.match(dailyPrompt, /## Attempts/);
    assert.match(dailyPrompt, /Preflight proves that the automation/);
    assert.match(dailyPrompt, /complete current-host active and pending Codex task listing/);
    assert.match(dailyPrompt, /fails this\s+task-specific readiness requirement/);
    assert.match(dailyPrompt, /Do not begin Plan Work/);
    assert.ok(
      dailyPrompt.indexOf('# AUTOMATION PREFLIGHT') < dailyPrompt.indexOf('# DAILY WORK PLAN'),
    );
    assert.equal(
      automations.get('daily-work-plan').rrule,
      'RRULE:FREQ=WEEKLY;BYHOUR=5;BYMINUTE=0;BYDAY=MO,TU,WE,TH,FR',
    );
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

  it('should compose a reusable preflight before the task prompt', async () => {
    const repoRoot = await createRepo({
      automations: [
        {
          enabled: false,
          id: 'weekly-note',
          name: 'Weekly note',
          'preflight-file': 'automations/preflight.md',
          'prompt-file': 'automations/weekly-note.md',
          schedule: { at: '08:00', frequency: 'weekly', weekdays: ['monday'] },
        },
      ],
      'schema-version': 1,
    });
    await mkdir(path.join(repoRoot, 'automations'));
    await writeFile(path.join(repoRoot, 'automations', 'preflight.md'), 'Check readiness.\n');
    await writeFile(path.join(repoRoot, 'automations', 'weekly-note.md'), 'Write the note.\n');

    const manifest = await loadAutomationManifest({ parseYaml: JSON.parse, repoRoot });

    assert.equal(manifest.automations[0].prompt, 'Check readiness.\n\n---\n\nWrite the note.');
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

  for (const field of ['prompt-file', 'preflight-file']) {
    it(`should reject ${field} files that escape through a symlink`, async () => {
      const task = {
        enabled: true,
        id: `escaped-${field}`,
        name: `Escaped ${field}`,
        [field]: 'automations/escaped.md',
        schedule: { frequency: 'minutely' },
      };
      if (field === 'preflight-file') {
        task.prompt = 'Run the task.';
      }
      const repoRoot = await createRepo({ automations: [task], 'schema-version': 1 });
      await mkdir(path.join(repoRoot, 'automations'));
      await writeFile(path.join(repoRoot, 'outside.md'), 'Outside.\n');
      await symlink('../outside.md', path.join(repoRoot, 'automations', 'escaped.md'));

      await assert.rejects(
        loadAutomationManifest({ parseYaml: JSON.parse, repoRoot }),
        /resolves outside automations/,
      );
    });
  }

  it('should require prompt files for inline prompts longer than 25 lines', async () => {
    const twentyFiveLines = Array.from({ length: 25 }, (_, index) => `Line ${index + 1}`).join(
      '\n',
    );
    const twentySixLines = `${twentyFiveLines}\nLine 26`;
    const inlineRoot = await createRepo({
      automations: [
        {
          enabled: true,
          id: 'inline-limit',
          name: 'Inline limit',
          prompt: twentyFiveLines,
          schedule: { frequency: 'minutely' },
        },
      ],
      'schema-version': 1,
    });

    const inlineManifest = await loadAutomationManifest({
      parseYaml: JSON.parse,
      repoRoot: inlineRoot,
    });
    assert.equal(inlineManifest.automations[0].prompt, twentyFiveLines);

    const oversizedRoot = await createRepo({
      automations: [
        {
          enabled: true,
          id: 'inline-too-long',
          name: 'Inline too long',
          prompt: twentySixLines,
          schedule: { frequency: 'minutely' },
        },
      ],
      'schema-version': 1,
    });
    await assert.rejects(
      loadAutomationManifest({ parseYaml: JSON.parse, repoRoot: oversizedRoot }),
      /inline prompts may contain at most 25 lines/,
    );

    const promptFileRoot = await createRepo({
      automations: [
        {
          enabled: true,
          id: 'file-prompt',
          name: 'File prompt',
          'prompt-file': 'automations/file-prompt.md',
          schedule: { frequency: 'minutely' },
        },
      ],
      'schema-version': 1,
    });
    await mkdir(path.join(promptFileRoot, 'automations'));
    await writeFile(path.join(promptFileRoot, 'automations', 'file-prompt.md'), twentySixLines);

    const promptFileManifest = await loadAutomationManifest({
      parseYaml: JSON.parse,
      repoRoot: promptFileRoot,
    });
    assert.equal(promptFileManifest.automations[0].prompt, twentySixLines);
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
