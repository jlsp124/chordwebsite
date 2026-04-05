import path from 'node:path';

import { validateSourceRegistry } from '../src/data/validators/index.ts';
import { ensureDir, exists, readJson, removePath, writeJson } from './lib/fs-utils.mjs';
import {
  downloadsLockPath,
  getSourceRawDir,
  sourceRegistryPath
} from './lib/pipeline-paths.mjs';
import {
  downloadToFile,
  extractZipArchive,
  parseCliArgs,
  selectRegistrySources,
  sha256File,
  toPosixRelative
} from './lib/pipeline-utils.mjs';

function printIssues(issues) {
  for (const issue of issues) {
    console.error(`[${issue.scope}] ${issue.path}: ${issue.message}`);
  }
}

function defaultTargetForEntry(entry) {
  const url = new URL(entry.downloadUrl);
  const fileName = path.basename(url.pathname) || `${entry.sourceId}.download`;
  return [{ fileName, kind: 'direct', url: entry.downloadUrl }];
}

async function main() {
  const args = parseCliArgs();
  const includeWeimar = args.has('with-weimar');
  const requestedSources = args.getAll('source');
  const force = args.has('force');
  const forceExtract = args.has('force-extract');
  const registry = await readJson(sourceRegistryPath);
  const issues = validateSourceRegistry(registry);

  if (issues.length > 0) {
    printIssues(issues);
    process.exitCode = 1;
    return;
  }

  const selectedSources = selectRegistrySources(registry, {
    includeWeimar,
    requestedSources
  });

  if (selectedSources.length === 0) {
    console.error('No sources selected.');
    process.exitCode = 1;
    return;
  }

  const lockfile =
    (await exists(downloadsLockPath))
      ? await readJson(downloadsLockPath)
      : { lockVersion: '1.0.0', entries: [] };
  const lockByKey = new Map(
    lockfile.entries.map((entry) => [`${entry.sourceId}|${entry.version}|${entry.fileName}`, entry])
  );

  for (const source of selectedSources) {
    const rawDir = getSourceRawDir(source.sourceId, source.version);
    await ensureDir(rawDir);
    const targets = source.downloadTargets?.length ? source.downloadTargets : defaultTargetForEntry(source);
    let downloadedCount = 0;

    for (const target of targets) {
      const destinationPath = path.join(rawDir, target.fileName);

      if (!(await exists(destinationPath)) || force) {
        await downloadToFile(target.url, destinationPath);
        downloadedCount += 1;
      }

      const checksum = await sha256File(destinationPath);
      lockByKey.set(`${source.sourceId}|${source.version}|${target.fileName}`, {
        sourceId: source.sourceId,
        version: source.version,
        fileName: target.fileName,
        url: target.url,
        checksum,
        fetchedAt: new Date().toISOString(),
        localPath: toPosixRelative(destinationPath)
      });

      if (target.kind === 'github_archive') {
        const extractedDir = path.join(rawDir, 'extracted');

        if (forceExtract || !(await exists(extractedDir))) {
          await removePath(extractedDir);
          await extractZipArchive(destinationPath, extractedDir);
        }
      }
    }

    console.log(
      `Prepared ${source.sourceId}@${source.version} in ${toPosixRelative(rawDir)} (${downloadedCount}/${targets.length} downloaded)`
    );
  }

  lockfile.entries = [...lockByKey.values()].sort((left, right) =>
    `${left.sourceId}|${left.version}|${left.fileName}`.localeCompare(
      `${right.sourceId}|${right.version}|${right.fileName}`
    )
  );

  await writeJson(downloadsLockPath, lockfile);
  console.log(`Updated ${toPosixRelative(downloadsLockPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
