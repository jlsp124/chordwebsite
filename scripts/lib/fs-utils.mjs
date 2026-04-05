import path from 'node:path';
import { access, copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
  return dirPath;
}

export async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function readText(filePath) {
  return readFile(filePath, 'utf8');
}

export async function writeText(filePath, contents) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, contents, 'utf8');
}

export async function copyFileSafe(sourcePath, targetPath) {
  await ensureDir(path.dirname(targetPath));
  await copyFile(sourcePath, targetPath);
}

export async function removePath(targetPath) {
  await rm(targetPath, { force: true, recursive: true });
}

export async function listFilesRecursive(rootDir, predicate = () => true) {
  if (!(await exists(rootDir))) {
    return [];
  }

  const results = [];
  const entries = await readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await listFilesRecursive(fullPath, predicate)));
      continue;
    }

    if (entry.isFile() && predicate(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

export async function isFile(filePath) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile();
  } catch {
    return false;
  }
}
