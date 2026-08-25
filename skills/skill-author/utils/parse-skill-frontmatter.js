import parseYaml from './parse-yaml.js';

export function splitLeadingSkillFrontmatter(content) {
  const match = String(content ?? '').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Template is missing leading template frontmatter.');
  }

  return {
    body: match[2],
    frontmatter: parseYaml(match[1]),
  };
}

export default function parseSkillFrontmatter(content) {
  const match = String(content ?? '').match(/^---\n([\s\S]*?)\n---/);
  return match ? parseYaml(match[1]) : null;
}
