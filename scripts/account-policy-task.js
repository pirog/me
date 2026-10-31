import { accountPolicy } from '../lib/account-policy.js';

try {
  process.stdout.write(await accountPolicy(process.env.PLUGIN_DATA));
} catch {
  process.stdout.write(
    'Piroplugin account policy could not load. restore the plugin through its installation owner. account defaults and authorization are unverified; stop affected service operations rather than guessing or switching accounts.\n',
  );
}
