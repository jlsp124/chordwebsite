import { validateSourceRegistry } from '../src/data/validators/index.ts';
import { listFilesRecursive, readJson, removePath } from './lib/fs-utils.mjs';
import { writeJsonl } from './lib/jsonl.mjs';
import {
  fixturesDir,
  getNormalizedEventsPath,
  getNormalizedWorksPath,
  getSourceRawDir,
  normalizedDir,
  sourceRegistryPath
} from './lib/pipeline-paths.mjs';
import {
  normalizeChoco,
  normalizeCocoPops,
  normalizeFixtures,
  normalizeJht,
  normalizeWeimar
} from './lib/normalizers.mjs';
import { parseCliArgs, selectRegistrySources, toPosixRelative } from './lib/pipeline-utils.mjs';

const NORMALIZER_BY_SOURCE = {
  cocopops: normalizeCocoPops,
  choco: normalizeChoco,
  jht: normalizeJht,
  weimar: normalizeWeimar
};

function printIssues(issues) {
  for (const issue of issues) {
    console.error(`[${issue.scope}] ${issue.path}: ${issue.message}`);
  }
}

async function clearNormalizedOutputs() {
  const files = await listFilesRecursive(normalizedDir, (filePath) => filePath.endsWith('.jsonl'));

  for (const filePath of files) {
    await removePath(filePath);
  }
}

async function main() {
  const args = parseCliArgs();
  const useFixtures = args.has('fixtures');

  if (useFixtures) {
    await clearNormalizedOutputs();
    const normalized = await normalizeFixtures(fixturesDir);
    await writeJsonl(getNormalizedEventsPath(normalized.sourceId), normalized.events);
    await writeJsonl(getNormalizedWorksPath(normalized.sourceId), normalized.works);
    console.log(
      `Normalized fixtures -> ${toPosixRelative(getNormalizedEventsPath(normalized.sourceId))} (${normalized.events.length} events)`
    );
    return;
  }

  const registry = await readJson(sourceRegistryPath);
  const issues = validateSourceRegistry(registry);

  if (issues.length > 0) {
    printIssues(issues);
    process.exitCode = 1;
    return;
  }

  const selectedSources = selectRegistrySources(registry, {
    includeWeimar: args.has('with-weimar'),
    requestedSources: args.getAll('source')
  });

  for (const source of selectedSources) {
    const normalizer = NORMALIZER_BY_SOURCE[source.sourceId];

    if (!normalizer) {
      console.warn(`Skipping ${source.sourceId}: no normalizer registered.`);
      continue;
    }

    const rawDir = getSourceRawDir(source.sourceId, source.version);
    const normalized = await normalizer(rawDir, source.sourceId);
    await writeJsonl(getNormalizedEventsPath(source.sourceId), normalized.events);
    await writeJsonl(getNormalizedWorksPath(source.sourceId), normalized.works);
    console.log(
      `Normalized ${source.sourceId}: ${normalized.events.length} events, ${normalized.works.length} works`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
