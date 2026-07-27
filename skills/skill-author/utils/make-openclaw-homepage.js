import path from 'node:path';

/**
 * Builds a GitHub source URL for one generated skill.
 *
 * @param {string | object} repository Package repository metadata.
 * @param {string} relativeSkillPath Skill path relative to the plugin root.
 * @returns {string | null} Canonical GitHub source URL when derivation is possible.
 */
export default function makeOpenClawHomepage(repository, relativeSkillPath) {
  const rawRepository = typeof repository === 'string' ? repository : repository?.url;
  const normalizedPath = String(relativeSkillPath ?? '')
    .split(path.sep)
    .join('/')
    .replace(/^\/+|\/+$/g, '');
  let repositoryUrl = typeof rawRepository === 'string' ? rawRepository.trim() || null : null;

  if (!repositoryUrl || !normalizedPath) return null;

  repositoryUrl = repositoryUrl
    .replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
    .replace(/\.git$/, '')
    .replace(/\/$/, '');

  try {
    const parsedRepository = new URL(repositoryUrl);
    if (parsedRepository.protocol !== 'https:' || parsedRepository.hostname !== 'github.com') {
      return null;
    }
  } catch {
    return null;
  }

  const encodedPath = normalizedPath.split('/').map(encodeURIComponent).join('/');
  return `${repositoryUrl}/tree/main/${encodedPath}`;
}
