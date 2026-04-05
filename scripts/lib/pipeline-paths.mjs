import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repoRoot = path.resolve(__dirname, '../..');
export const dataSrcDir = path.join(repoRoot, 'data-src');
export const externalDir = path.join(dataSrcDir, 'external');
export const stagingDir = path.join(dataSrcDir, 'staging');
export const normalizedDir = path.join(stagingDir, 'normalized');
export const windowsDir = path.join(stagingDir, 'windows');
export const clustersDir = path.join(stagingDir, 'clusters');
export const reportsDir = path.join(stagingDir, 'reports');
export const generatedDir = path.join(dataSrcDir, 'generated');
export const curationDir = path.join(dataSrcDir, 'curation');
export const fixturesDir = path.join(dataSrcDir, 'fixtures');
export const publicPacksDir = path.join(repoRoot, 'public', 'packs');

export const sourceRegistryPath = path.join(externalDir, 'source-registry.json');
export const downloadsLockPath = path.join(stagingDir, 'downloads.lock.json');
export const styleMappingPath = path.join(curationDir, 'style-mapping.json');
export const sourcePolicyPath = path.join(curationDir, 'source-policy.json');
export const loopBlacklistPath = path.join(curationDir, 'loop-blacklist.json');
export const generatedFragmentsPath = path.join(generatedDir, 'loop-fragments.json');
export const candidatePath = path.join(windowsDir, '4bar.candidates.jsonl');
export const analysis8Path = path.join(windowsDir, '8bar.analysis.jsonl');
export const analysis16Path = path.join(windowsDir, '16bar.analysis.jsonl');
export const dedupedLoopsPath = path.join(clustersDir, 'deduped-loops.jsonl');
export const topLoopsReportPath = path.join(reportsDir, 'top-loops-by-style.json');
export const rejectedLoopsReportPath = path.join(reportsDir, 'rejected-loops.json');
export const licenseMixReportPath = path.join(reportsDir, 'license-mix.json');

export function getSourceVersionDir(sourceId, version) {
  return path.join(externalDir, sourceId, version);
}

export function getSourceRawDir(sourceId, version) {
  return path.join(getSourceVersionDir(sourceId, version), 'raw');
}

export function getNormalizedEventsPath(sourceId) {
  return path.join(normalizedDir, `${sourceId}.events.jsonl`);
}

export function getNormalizedWorksPath(sourceId) {
  return path.join(normalizedDir, `${sourceId}.works.jsonl`);
}
