import {
  accountDefaultsFailure,
  inspectAccountDefaults,
  saveAccountDefaults,
} from '../lib/account-defaults.js';

try {
  const [action, flag, pluginData, ...extra] = process.argv.slice(2);
  if (
    !['inspect', 'save'].includes(action) ||
    flag !== '--plugin-data' ||
    !pluginData ||
    extra.length
  ) {
    throw new Error('account-defaults-invalid-arguments');
  }
  let result;
  if (action === 'inspect') {
    result = await inspectAccountDefaults(pluginData);
  } else {
    const chunks = [];
    let size = 0;
    for await (const chunk of process.stdin) {
      size += chunk.length;
      if (size > 8192) throw new Error('account-defaults-too-large');
      chunks.push(chunk);
    }
    result = await saveAccountDefaults(
      pluginData,
      JSON.parse(Buffer.concat(chunks).toString('utf8')),
    );
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (action === 'save' && !['configured', 'unconfigured'].includes(result.status))
    process.exitCode = 1;
} catch (error) {
  process.stderr.write(
    `${JSON.stringify({ status: 'error', code: accountDefaultsFailure(error) })}\n`,
  );
  process.exitCode = 1;
}
