import assert from 'node:assert/strict';

import { buildAutomationPlan } from '../lib/automation-plan.js';
import { buildManagedAutomationPrompt } from '../utils/managed-automation-prompt.js';

const DEFAULTS = { model: 'gpt-test', reasoningEffort: 'medium' };

function desired(overrides = {}) {
  return {
    enabled: true,
    id: 'smoke-test',
    localProject: null,
    model: null,
    name: 'Smoke test',
    notification: null,
    prompt: 'Report success.',
    reasoning: null,
    rrule: 'RRULE:FREQ=MINUTELY;INTERVAL=15',
    ...overrides,
  };
}

function observed(overrides = {}) {
  return {
    destination: 'local',
    executionEnvironment: 'local',
    id: 'automation-1',
    kind: 'cron',
    model: 'gpt-test',
    name: 'Smoke test',
    notificationPolicy: null,
    projectId: null,
    prompt: buildManagedAutomationPrompt('smoke-test', 'Report success.'),
    reasoningEffort: 'medium',
    rrule: 'RRULE:FREQ=MINUTELY;INTERVAL=15',
    status: 'ACTIVE',
    ...overrides,
  };
}

describe('lib/automation-plan', () => {
  it('should plan missing, changed, and extra managed tasks while ignoring unmanaged tasks', () => {
    const plan = buildAutomationPlan({
      actualTasks: [
        observed({ name: 'Old smoke name' }),
        observed({
          id: 'automation-extra',
          prompt: buildManagedAutomationPrompt('extra', 'Extra.'),
        }),
        observed({ id: 'personal', prompt: 'Unmanaged personal task.' }),
      ],
      defaults: DEFAULTS,
      desiredTasks: [desired()],
    });

    assert.deepEqual(
      plan.actions.map(({ manifestId, type }) => ({ manifestId, type })),
      [
        { manifestId: 'smoke-test', type: 'update' },
        { manifestId: 'extra', type: 'delete' },
      ],
    );
    assert.equal(plan.actions[1].name, 'Smoke test');
    assert.deepEqual(plan.summary, {
      changed: 1,
      extra: 1,
      missing: 0,
      unchanged: 0,
      unmanaged: 1,
    });
    assert.match(plan.digest, /^[a-f0-9]{64}$/);
  });

  it('should use pause and resume for status-only drift', () => {
    const pausePlan = buildAutomationPlan({
      actualTasks: [observed()],
      defaults: DEFAULTS,
      desiredTasks: [desired({ enabled: false })],
    });
    const resumePlan = buildAutomationPlan({
      actualTasks: [observed({ status: 'PAUSED' })],
      defaults: DEFAULTS,
      desiredTasks: [desired()],
    });

    assert.equal(pausePlan.actions[0].type, 'pause');
    assert.equal(resumePlan.actions[0].type, 'resume');
  });

  it('should resolve an exact local project and reject zero or multiple matches', () => {
    const localTask = desired({ localProject: { path: '/Users/pirog/tanaab/me' } });
    const project = {
      path: '/Users/pirog/tanaab/me',
      projectId: 'project-1',
      projectKind: 'local',
    };
    const plan = buildAutomationPlan({
      actualTasks: [],
      defaults: DEFAULTS,
      desiredTasks: [localTask],
      projects: [project],
    });
    assert.equal(plan.actions[0].expected.projectId, 'project-1');

    assert.throws(
      () =>
        buildAutomationPlan({
          actualTasks: [],
          defaults: DEFAULTS,
          desiredTasks: [localTask],
          projects: [],
        }),
      /matched 0/,
    );
    assert.throws(
      () =>
        buildAutomationPlan({
          actualTasks: [],
          defaults: DEFAULTS,
          desiredTasks: [localTask],
          projects: [project, { ...project, projectId: 'project-2' }],
        }),
      /matched 2/,
    );
  });

  it('should fail closed on malformed or duplicate managed markers', () => {
    assert.throws(
      () =>
        buildAutomationPlan({
          actualTasks: [observed({ prompt: 'Managed by pirog/me AUTOMATIONS.yaml, maybe.' })],
          defaults: DEFAULTS,
          desiredTasks: [],
        }),
      /malformed pirog\/me marker/,
    );
    assert.throws(
      () =>
        buildAutomationPlan({
          actualTasks: [observed(), observed({ id: 'automation-2' })],
          defaults: DEFAULTS,
          desiredTasks: [],
        }),
      /multiple Codex automations claim manifest id/,
    );
    assert.throws(
      () =>
        buildAutomationPlan({
          actualTasks: [observed({ id: null })],
          defaults: DEFAULTS,
          desiredTasks: [],
        }),
      /has no automation id/,
    );
  });

  it('should produce the same digest for the same logical plan', () => {
    const input = { actualTasks: [], defaults: DEFAULTS, desiredTasks: [desired()] };
    assert.equal(buildAutomationPlan(input).digest, buildAutomationPlan(input).digest);
  });

  it('should require an explicit target for missing heartbeats and include it in approval', () => {
    const input = { actualTasks: [], defaults: {}, desiredTasks: [desired({ kind: 'heartbeat' })] };
    const blocked = buildAutomationPlan(input);
    assert.equal(blocked.blockers.length, 1);
    assert.equal(blocked.actions[0].expected.targetThreadId, null);
    const plan = buildAutomationPlan({ ...input, threadTargets: { 'smoke-test': 'task-a' } });
    assert.deepEqual(plan.blockers, []);
    assert.equal(plan.actions[0].expected.destination, 'thread');
    assert.equal(plan.actions[0].expected.targetThreadId, 'task-a');
    for (const field of ['model', 'reasoningEffort', 'projectId', 'executionEnvironment']) {
      assert.equal(Object.hasOwn(plan.actions[0].expected, field), false);
    }
    assert.notEqual(plan.digest, blocked.digest);
    assert.notEqual(
      plan.digest,
      buildAutomationPlan({ ...input, threadTargets: { 'smoke-test': 'task-b' } }).digest,
    );
  });

  it('should preserve heartbeat targets through prompt updates, pauses, and resumes', () => {
    const task = desired({ kind: 'heartbeat' });
    const created = buildAutomationPlan({
      actualTasks: [],
      defaults: {},
      desiredTasks: [task],
      threadTargets: { 'smoke-test': 'persistent-task' },
    });
    const actual = { ...created.actions[0].expected, id: 'native-id' };
    const input = { actualTasks: [actual], defaults: DEFAULTS, desiredTasks: [task] };
    assert.deepEqual(buildAutomationPlan(input).actions, []);
    for (const [override, type] of [
      [{ prompt: 'New report.' }, 'update'],
      [{ enabled: false }, 'pause'],
    ]) {
      const plan = buildAutomationPlan({ ...input, desiredTasks: [{ ...task, ...override }] });
      assert.equal(plan.actions[0].type, type);
      assert.equal(plan.actions[0].automationId, 'native-id');
      assert.equal(plan.actions[0].expected.targetThreadId, 'persistent-task');
      const applied = { ...plan.actions[0].expected, id: 'native-id' };
      assert.deepEqual(
        buildAutomationPlan({
          ...input,
          actualTasks: [applied],
          desiredTasks: [{ ...task, ...override }],
        }).actions,
        [],
      );
    }
    assert.equal(
      buildAutomationPlan({ ...input, actualTasks: [{ ...actual, status: 'PAUSED' }] }).actions[0]
        .type,
      'resume',
    );
    assert.throws(
      () => buildAutomationPlan({ ...input, threadTargets: { 'smoke-test': 'other-task' } }),
      /cannot silently change/,
    );
    assert.throws(
      () => buildAutomationPlan({ ...input, desiredTasks: [desired()] }),
      /explicit kind migration/,
    );
  });
});
