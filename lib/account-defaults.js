import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, realpath, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateAccountDefaults } from '../utils/validate-account-defaults.js';

const limit = 8192;
const pluginRoot = fileURLToPath(new URL('../', import.meta.url));

function defaultsPath(pluginData) {
  if (!pluginData || !path.isAbsolute(pluginData))
    throw new Error('account-defaults-path-unavailable');
  const relative = path.relative(pluginRoot, pluginData);
  if (
    !relative ||
    (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
  ) {
    throw new Error('account-defaults-path-in-plugin');
  }
  return path.join(pluginData, 'account-defaults.json');
}

export async function inspectAccountDefaults(pluginData) {
  let handle;
  try {
    const filename = defaultsPath(pluginData);
    handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > limit || (stat.mode & 0o077) !== 0)
      throw new Error('account-defaults-invalid-file');
    const buffer = Buffer.alloc(limit + 1);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead > limit) throw new Error('account-defaults-too-large');
    const data = validateAccountDefaults(
      JSON.parse(buffer.subarray(0, bytesRead).toString('utf8')),
    );
    return { status: 'configured', data };
  } catch (error) {
    return { status: error.code === 'ENOENT' ? 'missing' : 'invalid' };
  } finally {
    await handle?.close();
  }
}

/** Replaces validated preferences atomically; callers own discovery and operator selection. */
export async function saveAccountDefaults(pluginData, data) {
  const serialized = `${JSON.stringify(validateAccountDefaults(data), null, 2)}\n`;
  if (Buffer.byteLength(serialized) > limit) throw new Error('account-defaults-too-large');
  defaultsPath(pluginData);
  await mkdir(pluginData, { recursive: true, mode: 0o700 });
  const filename = defaultsPath(await realpath(pluginData));
  const existing = await lstat(filename).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (existing && !existing.isFile()) throw new Error('account-defaults-invalid-file');
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    const handle = await open(temporary, 'wx', 0o600);
    try {
      await handle.writeFile(serialized);
      await handle.sync();
    } finally {
      await handle.close();
    }
    await rename(temporary, filename);
    return inspectAccountDefaults(pluginData);
  } finally {
    await rm(temporary, { force: true });
  }
}
