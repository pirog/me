import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { readAutomationState } from '../lib/read-automation-state.js';

const execFileAsync = promisify(execFile);
const cli = new URL('../scripts/automation-task.js', import.meta.url).pathname;
// Shape observed after a native update of the paused smoke task.
const saved = `version = 1
id = "smoke"
kind = "cron"
name = "Smoke"
prompt = "Managed by pirog/me AUTOMATIONS.yaml (id: smoke-test).\\n\\nReport success."
status = "PAUSED"
rrule = "RRULE:FREQ=MINUTELY;INTERVAL=15"
model = "gpt-test"
reasoning_effort = "high"
execution_environment = "local"
target = { type = "projectless" }
cwds = ["~"]
created_at = 1000
updated_at = 2000
`;

describe('skills/automation/lib/read-automation-state', () => {
  let codexHome;
  let savedPath;
  beforeEach(async () => {
    codexHome = await mkdtemp(path.join(os.tmpdir(), 'piro-automation-'));
    savedPath = path.join(codexHome, 'automations', 'smoke', 'automation.toml');
    await mkdir(path.dirname(savedPath), { recursive: true });
    await writeFile(savedPath, saved);
    await writeFile(
      path.join(codexHome, 'config.toml'),
      'model = "gpt-default"\nmodel_reasoning_effort = "high"\n',
    );
  });
  afterEach(async () => {
    await rm(codexHome, { recursive: true, force: true });
  });

  it('should map the saved format and count personal tasks without adopting their settings', async () => {
    const personal = path.join(codexHome, 'automations', 'personal');
    await mkdir(personal);
    await writeFile(path.join(personal, 'automation.toml'), 'prompt = "Personal"\nversion = 99');
    const state = await readAutomationState({ codexHome });
    assert.deepEqual(state.defaults, { model: 'gpt-default', reasoningEffort: 'high' });
    assert.deepEqual(
      state.actualTasks.find((task) => task.id === 'smoke'),
      {
        id: 'smoke',
        kind: 'cron',
        name: 'Smoke',
        prompt: 'Managed by pirog/me AUTOMATIONS.yaml (id: smoke-test).\n\nReport success.',
        status: 'PAUSED',
        rrule: 'RRULE:FREQ=MINUTELY;INTERVAL=15',
        model: 'gpt-test',
        reasoningEffort: 'high',
        executionEnvironment: 'local',
        notificationPolicy: null,
        destination: 'local',
        projectId: null,
        targetThreadId: null,
      },
    );
    assert.deepEqual(
      state.actualTasks.find((task) => task.id === 'personal'),
      { id: 'personal', prompt: 'Personal' },
    );
  });

  it('should fail on unreadable or unsupported state instead of reporting no tasks', async () => {
    for (const invalid of [
      'broken = [',
      saved + 'unknown = true',
      saved.replace('projectless', 'project'),
      saved.replace('status = "PAUSED"', 'status = "UNKNOWN"'),
    ]) {
      await writeFile(savedPath, invalid);
      await assert.rejects(readAutomationState({ codexHome }));
    }
    await rm(savedPath);
    await symlink(path.join(codexHome, 'config.toml'), savedPath);
    await assert.rejects(readAutomationState({ codexHome }), /regular saved file/);
    await assert.rejects(
      readAutomationState({ codexHome: path.join(codexHome, 'missing') }),
      /ENOENT/,
    );
  });

  it('should read heartbeat bindings without synthesizing cron settings', async () => {
    const heartbeat =
      saved
        .replace('kind = "cron"', 'kind = "heartbeat"')
        .split('\n')
        .filter(
          (line) => !/^(model|reasoning_effort|execution_environment|target |cwds)/.test(line),
        )
        .join('\n') + 'target_thread_id = "persistent-task"\n';
    await writeFile(savedPath, heartbeat);
    const { actualTasks } = await readAutomationState({ codexHome });
    assert.equal(actualTasks[0].kind, 'heartbeat');
    assert.equal(actualTasks[0].destination, 'thread');
    assert.equal(actualTasks[0].targetThreadId, 'persistent-task');
    assert.equal(actualTasks[0].model, null);
    assert.equal(actualTasks[0].executionEnvironment, null);
    for (const invalid of [
      heartbeat.replace('persistent-task', ''),
      heartbeat + 'model = "gpt-test"\n',
      heartbeat + 'unknown = true\n',
      saved + 'target_thread_id = "wrong"\n',
    ]) {
      await writeFile(savedPath, invalid);
      await assert.rejects(readAutomationState({ codexHome }));
    }
  });

  it('should detect and then clear drift through the existing planner on fresh reads', async () => {
    await writeFile(
      path.join(codexHome, 'AUTOMATIONS.yaml'),
      `schema-version: 1
automations:
  - id: smoke-test
    name: Smoke
    enabled: false
    schedule: { frequency: minutely, interval: 15 }
    prompt: Report success.
`,
    );
    const check = () =>
      execFileAsync('bun', [cli, 'check', '--repo-root', codexHome], {
        env: { ...process.env, CODEX_HOME: codexHome },
      });
    await assert.rejects(check(), (error) => {
      assert.equal(error.code, 1);
      assert.deepEqual(JSON.parse(error.stdout).actions[0].changedFields, ['model']);
      return true;
    });
    await writeFile(savedPath, saved.replace('gpt-test', 'gpt-default'));
    const plan = JSON.parse((await check()).stdout);
    assert.deepEqual(plan.actions, []);
    assert.equal(plan.summary.unchanged, 1);
    await rm(savedPath);
    await assert.rejects(check(), (error) => {
      assert.equal(JSON.parse(error.stdout).actions[0].type, 'create');
      return true;
    });
  });
});
