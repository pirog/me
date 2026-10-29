/** Accept only the declared Tanaab source checkout for a plugin. */
export default function isExpectedPluginOrigin(origin, repo) {
  const owner = repo === 'me' ? 'pirog' : 'tanaabased';
  return [
    `git@github.com:${owner}/${repo}.git`,
    `ssh://git@github.com/${owner}/${repo}.git`,
    `ssh://git@github.com:${owner}/${repo}.git`,
    `https://github.com/${owner}/${repo}`,
    `https://github.com/${owner}/${repo}.git`,
  ].includes(origin);
}
