import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { packs } from '../data-src/authoring/index.mjs';
import { buildManifest } from '../data-src/authoring/shared.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const publicPackDir = path.join(repoRoot, 'public', 'packs');

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main() {
  await mkdir(publicPackDir, { recursive: true });

  for (const pack of packs) {
    await writeJson(path.join(publicPackDir, `${pack.packId}.pack.json`), pack);
  }

  await writeJson(path.join(publicPackDir, 'manifest.json'), buildManifest(packs));

  console.log(
    `Built ${packs.length} runtime pack(s): ${packs.map((pack) => pack.packId).join(', ')}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
