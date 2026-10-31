/** Validates private account preferences, never credentials or action permissions. */
export function validateAccountDefaults(value) {
  const object = (input, keys) =>
    input !== null &&
    typeof input === 'object' &&
    !Array.isArray(input) &&
    Object.keys(input).every((key) => keys.includes(key));
  const invalid = () => {
    throw new Error('account-defaults-invalid');
  };
  if (!object(value, ['version', 'profiles']) || value.version !== 2) invalid();
  if (!object(value.profiles, ['pirog', 'tanaabot'])) invalid();
  for (const profile of Object.values(value.profiles)) {
    if (!object(profile, ['github', 'google'])) invalid();
    for (const [provider, selection] of Object.entries(profile)) {
      if (!object(selection, ['default', 'accounts'])) invalid();
      if (
        !Array.isArray(selection.accounts) ||
        !selection.accounts.length ||
        selection.accounts.length > 8
      )
        invalid();
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
    }
  }
  return value;
}
