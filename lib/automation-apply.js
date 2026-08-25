import { automationMatchesExpected } from './automation-plan.js';

function requireAutomationId(result, action) {
  const automationId = result?.id ?? result?.automationId ?? action.automationId;
  if (typeof automationId !== 'string' || !automationId) {
    throw new Error(`${action.type} did not return an automation id for ${action.manifestId}.`);
  }
  return automationId;
}

/**
 * Apply an approved automation plan through an injected Codex adapter and verify every mutation.
 *
 * Side effects are entirely owned by the adapter. The function applies actions sequentially and
 * stops at the first mutation or read-back failure.
 *
 * @param {{actions: object[], digest: string}} plan Previously approved deterministic plan.
 * @param {{create: Function, delete: Function, pause: Function, resume: Function, update: Function, view: Function}} adapter Codex automation adapter.
 * @returns {Promise<{applied: object[], digest: string}>} Verified actions.
 */
export async function applyAutomationPlan(plan, adapter) {
  if (!plan || !Array.isArray(plan.actions) || typeof plan.digest !== 'string') {
    throw new Error('an approved automation plan with actions and digest is required.');
  }

  const applied = [];
  for (const action of plan.actions) {
    if (typeof adapter[action.type] !== 'function') {
      throw new Error(`automation adapter does not support ${action.type}.`);
    }

    const result = await adapter[action.type](action);
    const automationId = requireAutomationId(result, action);
    const observed = await adapter.view(automationId);
    if (action.type === 'delete') {
      if (observed !== null && observed !== undefined) {
        throw new Error(`delete verification failed for ${action.manifestId}.`);
      }
    } else if (!automationMatchesExpected(observed, action.expected)) {
      throw new Error(`${action.type} verification failed for ${action.manifestId}.`);
    }

    applied.push({ automationId, manifestId: action.manifestId, type: action.type });
  }

  return { applied, digest: plan.digest };
}
