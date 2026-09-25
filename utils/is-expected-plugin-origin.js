/** Accept only the declared Tanaab source checkout for a plugin. */
export default function isExpectedPluginOrigin(origin, repo) {
  return [
    `git@github.com:tanaabased/${repo}.git`,
    `ssh://git@github.com/tanaabased/${repo}.git`,
    `ssh://git@github.com:tanaabased/${repo}.git`,
    `https://github.com/tanaabased/${repo}`,
    `https://github.com/tanaabased/${repo}.git`,
  ].includes(origin);
}
