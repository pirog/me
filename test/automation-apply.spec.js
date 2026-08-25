import assert from 'node:assert/strict';

import { applyAutomationPlan } from '../lib/automation-apply.js';
import { buildAutomationPlan } from '../lib/automation-plan.js';

const DEFAULTS = { model: 'gpt-test', reasoningEffort: 'low' };
const DESIRED_TASK = {
  enabled: true,
  id: 'smoke-test',
  localProject: null,
  model: null,
  name: 'Smoke test',
  notification: null,
  prompt: 'Report success.',
  reasoning: null,
  rrule: 'RRULE:FREQ=MINUTELY;INTERVAL=15',
};

function createFakeAdapter() {
  const tasks = new Map();
  let sequence = 0;

  function write(action, status = action.expected.status) {
    const id = action.automationId ?? `automation-${(sequence += 1)}`;
    tasks.set(id, { id, ...action.expected, status });
    return { id };
  }

  return {
    create: (action) => write(action),
    delete: async (action) => {
      tasks.delete(action.automationId);
      return { id: action.automationId };
    },
    pause: (action) => write(action, 'PAUSED'),
    resume: (action) => write(action, 'ACTIVE'),
    tasks,
    update: (action) => write(action),
    view: async (id) => tasks.get(id) ?? null,
  };
}

describe('lib/automation-apply', () => {
  it('should apply and verify a create lifecycle', async () => {
    const plan = buildAutomationPlan({
      actualTasks: [],
      defaults: DEFAULTS,
      desiredTasks: [DESIRED_TASK],
    });
    const adapter = createFakeAdapter();

    const result = await applyAutomationPlan(plan, adapter);

    assert.deepEqual(result.applied, [
      { automationId: 'automation-1', manifestId: 'smoke-test', type: 'create' },
    ]);
    assert.equal(adapter.tasks.size, 1);
  });

  it('should apply and verify update, pause, resume, and delete lifecycles', async () => {
    const operations = [
      { expectedStatus: 'ACTIVE', type: 'update' },
      { expectedStatus: 'PAUSED', type: 'pause' },
      { expectedStatus: 'ACTIVE', type: 'resume' },
    ];

    for (const operation of operations) {
      const adapter = createFakeAdapter();
      const expected = buildAutomationPlan({
        actualTasks: [],
        defaults: DEFAULTS,
        desiredTasks: [{ ...DESIRED_TASK, enabled: operation.expectedStatus === 'ACTIVE' }],
      }).actions[0].expected;
      const plan = {
        actions: [
          {
            automationId: 'automation-existing',
            expected,
            manifestId: 'smoke-test',
            type: operation.type,
          },
        ],
        digest: `digest-${operation.type}`,
      };

      const result = await applyAutomationPlan(plan, adapter);
      assert.equal(result.applied[0].type, operation.type);
    }

    const deleteAdapter = createFakeAdapter();
    deleteAdapter.tasks.set('automation-existing', { id: 'automation-existing' });
    const deleteResult = await applyAutomationPlan(
      {
        actions: [
          { automationId: 'automation-existing', manifestId: 'smoke-test', type: 'delete' },
        ],
        digest: 'digest-delete',
      },
      deleteAdapter,
    );
    assert.equal(deleteResult.applied[0].type, 'delete');
    assert.equal(deleteAdapter.tasks.size, 0);
  });

  it('should stop when authoritative read-back does not match', async () => {
    const plan = buildAutomationPlan({
      actualTasks: [],
      defaults: DEFAULTS,
      desiredTasks: [DESIRED_TASK],
    });
    const adapter = createFakeAdapter();
    adapter.view = async (id) => ({ ...adapter.tasks.get(id), name: 'Drifted' });

    await assert.rejects(applyAutomationPlan(plan, adapter), /create verification failed/);
  });
});
