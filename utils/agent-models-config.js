import validateAgentModels from './validate-agent-models.js';

/** Project only the default pair to Codex keys; this does not prove native model availability. */
export default function agentModelsConfig(models) {
  const profile = validateAgentModels(models).default;
  if (!profile.model.startsWith('openai/')) {
    throw new Error(
      'Codex model defaults require an openai provider reference; no substitute selected.',
    );
  }
  return {
    model: profile.model.slice('openai/'.length),
    model_reasoning_effort: profile.effort,
  };
}
