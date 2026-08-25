import parseYaml from './parse-yaml.js';

function mapping(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export default function parseOpenAiSkillMetadata(content) {
  const metadata = mapping(parseYaml(content));
  const dependencies = mapping(metadata.dependencies);

  return {
    dependencyTools: Array.isArray(dependencies.tools) ? dependencies.tools : [],
    hasDependencyToolsSection: Object.hasOwn(dependencies, 'tools'),
    interfaceValues: mapping(metadata.interface),
    policyValues: mapping(metadata.policy),
  };
}
