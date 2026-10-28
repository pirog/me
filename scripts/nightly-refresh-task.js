import nightlyRefresh from '../lib/nightly-refresh.js';

try {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 16384) throw new Error('Maintenance input exceeds 16 KiB.');
  }
  const request = JSON.parse(input);
  process.stdout.write(`${JSON.stringify(await nightlyRefresh(request))}\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
