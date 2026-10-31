/** Strict writes reject invalid input; partial reads retain independently valid selections. */
export function validateAccountDefaults(value, { partial = false } = {}) {
  const record = (input) => input !== null && typeof input === 'object' && !Array.isArray(input);
  const object = (input, keys) =>
    record(input) && Object.keys(input).every((key) => keys.includes(key));
  const invalid = () => {
    throw new Error('account-defaults-invalid');
  };
  if (!object(value, ['version', 'profiles']) || value.version !== 2 || !record(value.profiles))
    invalid();
  const profiles = {};
  const issues = [];
  if (Object.keys(value.profiles).some((key) => !['pirog', 'tanaabot'].includes(key)))
    issues.push({ code: 'unsupported-profile' });
  for (const profile of ['pirog', 'tanaabot']) {
    if (!Object.hasOwn(value.profiles, profile)) continue;
    const source = value.profiles[profile];
    if (!record(source)) {
      issues.push({ profile, code: 'invalid-profile' });
      continue;
    }
    profiles[profile] = {};
    if (Object.keys(source).some((key) => !['github', 'google'].includes(key)))
      issues.push({ profile, code: 'unsupported-provider' });
    for (const provider of ['github', 'google']) {
      if (!Object.hasOwn(source, provider)) continue;
      const selection = source[provider];
      try {
        if (!object(selection, ['default', 'accounts'])) invalid();
        if (!Array.isArray(selection.accounts) || !selection.accounts.length) invalid();
        const identifier = provider === 'github' ? 'login' : 'email';
        const pattern =
          provider === 'github'
            ? /^[a-z\d](?:[a-z\d-]{0,38})$/i
            : /^[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d.-]+\.[a-z]{2,}$/i;
        for (const account of selection.accounts) {
          if (!object(account, ['id', identifier])) invalid();
          if (typeof account.id !== 'string' || !/^[1-9]\d{0,39}$/.test(account.id)) invalid();
          if (
            typeof account[identifier] !== 'string' ||
            account[identifier].length > 254 ||
            !pattern.test(account[identifier])
          )
            invalid();
        }
        const ids = selection.accounts.map(({ id }) => id);
        if (new Set(ids).size !== ids.length || !ids.includes(selection.default)) invalid();
        profiles[profile][provider] = selection;
      } catch {
        issues.push({ profile, provider, code: 'invalid-selection' });
      }
    }
  }
  if (!partial && issues.length) invalid();
  return { data: { version: 2, profiles }, issues };
}
