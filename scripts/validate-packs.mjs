import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validatePackSet } from '../src/data/validators/pack-validator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const sampleDir = path.join(repoRoot, 'src', 'data', 'packs', 'samples');
const runtimeDir = path.join(repoRoot, 'public', 'packs');

async function readJson(filePath) {
  const contents = await readFile(filePath, 'utf8');
  return JSON.parse(contents);
}

async function loadPackSet(baseDir) {
  const manifestPath = path.join(baseDir, 'manifest.json');
  const manifest = await readJson(manifestPath);
  const packsByPath = {};

  for (const entry of manifest.packs) {
    const fileName = path.basename(entry.path);
    const packPath = path.join(baseDir, fileName);
    packsByPath[entry.path] = await readJson(packPath);
  }

  return { manifest, packsByPath };
}

function printIssues(issues) {
  for (const entry of issues) {
    console.error(`[${entry.scope}] ${entry.path}: ${entry.message}`);
  }
}

async function main() {
  const useSamples = process.argv.includes('--samples');
  const baseDir = useSamples ? sampleDir : runtimeDir;
  const { manifest, packsByPath } = await loadPackSet(baseDir);
  const issues = validatePackSet(manifest, packsByPath);

  if (issues.length > 0) {
    printIssues(issues);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Validated ${manifest.packs.length} ${useSamples ? 'sample' : 'runtime'} pack(s): ${manifest.packs
      .map((entry) => entry.packId)
      .join(', ')}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
