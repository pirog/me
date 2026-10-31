import { inspectAccountDefaults, saveAccountDefaults } from '../lib/account-defaults.js';

try {
  const [action, flag, pluginData, ...extra] = process.argv.slice(2);
  if (
    !['inspect', 'save'].includes(action) ||
    flag !== '--plugin-data' ||
    !pluginData ||
    extra.length
  ) {
    throw new Error('invalid arguments');
  }
  let result;
  if (action === 'inspect') {
    result = await inspectAccountDefaults(pluginData);
  } else {
    const chunks = [];
    let size = 0;
    for await (const chunk of process.stdin) {
      size += chunk.length;
      if (size > 8192) throw new Error('input too large');
      chunks.push(chunk);
    }
    result = await saveAccountDefaults(
      pluginData,
      JSON.parse(Buffer.concat(chunks).toString('utf8')),
    );
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch {
  process.stderr.write(
    'account binding failed; check the private path and preference format. no account details were logged.\n',
  );
  process.exitCode = 1;
}
