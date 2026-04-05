import path from 'node:path';

import { ensureDir, exists, readText, writeText } from './fs-utils.mjs';

export async function readJsonl(filePath) {
  if (!(await exists(filePath))) {
    return [];
  }

  const contents = await readText(filePath);

  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

export async function writeJsonl(filePath, records) {
  await ensureDir(path.dirname(filePath));
  const contents = records.map((record) => JSON.stringify(record)).join('\n');
  await writeText(filePath, contents.length > 0 ? `${contents}\n` : '');
}
