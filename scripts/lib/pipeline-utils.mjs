import path from 'node:path';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

import { ensureDir } from './fs-utils.mjs';
import { repoRoot } from './pipeline-paths.mjs';

export function parseCliArgs(args = process.argv.slice(2)) {
  const flags = new Set();
  const values = new Map();

  for (const arg of args) {
    if (!arg.startsWith('--')) {
      continue;
    }

    const trimmed = arg.slice(2);
    const eqIndex = trimmed.indexOf('=');

    if (eqIndex === -1) {
      flags.add(trimmed);
      continue;
    }

    const key = trimmed.slice(0, eqIndex);
    const value = trimmed.slice(eqIndex + 1);
    const existing = values.get(key);

    if (existing === undefined) {
      values.set(key, [value]);
      continue;
    }

    existing.push(value);
  }

  return {
    has(name) {
      return flags.has(name);
    },
    get(name, fallback = undefined) {
      const entries = values.get(name);
      return entries?.[entries.length - 1] ?? fallback;
    },
    getAll(name) {
      return values.get(name) ?? [];
    }
  };
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function toPosixRelative(targetPath) {
  return path.relative(repoRoot, targetPath).split(path.sep).join('/');
}

export async function sha256File(filePath) {
  const buffer = await readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

export async function downloadToFile(url, destinationPath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await ensureDir(path.dirname(destinationPath));
  await writeFile(destinationPath, buffer);
  return buffer.length;
}

export async function extractZipArchive(archivePath, destinationPath) {
  await ensureDir(destinationPath);

  if (process.platform === 'win32') {
    const command = `Expand-Archive -Path '${archivePath.replace(/'/g, "''")}' -DestinationPath '${destinationPath.replace(/'/g, "''")}' -Force`;
    const result = spawnSync('powershell', ['-NoProfile', '-Command', command], {
      encoding: 'utf8'
    });

    if (result.status !== 0) {
      throw new Error(`Expand-Archive failed: ${result.stderr || result.stdout}`.trim());
    }

    return;
  }

  let result = spawnSync('unzip', ['-oq', archivePath, '-d', destinationPath], { encoding: 'utf8' });

  if (result.status === 0) {
    return;
  }

  result = spawnSync('tar', ['-xf', archivePath, '-C', destinationPath], { encoding: 'utf8' });

  if (result.status !== 0) {
    throw new Error(`Archive extraction failed: ${result.stderr || result.stdout}`.trim());
  }
}

export function selectRegistrySources(registry, options = {}) {
  const requestedSources = new Set(options.requestedSources ?? []);
  const includeWeimar = options.includeWeimar ?? false;

  return registry.sources.filter((entry) => {
    if (requestedSources.size > 0) {
      return requestedSources.has(entry.sourceId);
    }

    if (entry.sourceId === 'weimar') {
      return includeWeimar;
    }

    return entry.enabledByDefault;
  });
}
