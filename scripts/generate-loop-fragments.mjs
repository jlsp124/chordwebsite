import { validateGeneratedLoopFragments } from '../src/data/validators/index.ts';
import { readJson, writeJson } from './lib/fs-utils.mjs';
import { readJsonl } from './lib/jsonl.mjs';
import {
  dedupedLoopsPath,
  generatedFragmentsPath,
  loopBlacklistPath,
  sourcePolicyPath,
  styleMappingPath
} from './lib/pipeline-paths.mjs';

function printIssues(issues) {
  for (const issue of issues) {
    console.error(`[${issue.scope}] ${issue.path}: ${issue.message}`);
  }
}

function buildProvenanceSummary(sourceRefs) {
  const sourceIds = [...new Set(sourceRefs.map((ref) => ref.sourceId))];
  const partitions = [...new Set(sourceRefs.map((ref) => `${ref.sourceId}|${ref.partition}`))];
  const licenseMix = [...new Set(sourceRefs.map((ref) => ref.licenseClass))];

  return {
    sourceCount: sourceIds.length,
    sourceIds,
    partitionCount: partitions.length,
    evidenceCount: sourceRefs.length,
    licenseMix
  };
}

function policyAllowsCluster(cluster, policyMap) {
  for (const ref of cluster.canonicalLoop.sourceRefs) {
    if (ref.sourceId === 'fixture') {
      continue;
    }

    const rule = policyMap.get(ref.sourceId);

    if (!rule || !rule.allowForDerivedRuntime) {
      return false;
    }

    if (Array.isArray(rule.excludePartitions) && rule.excludePartitions.includes(ref.partition)) {
      return false;
    }

    if (
      Array.isArray(rule.includePartitions) &&
      rule.includePartitions.length > 0 &&
      !rule.includePartitions.includes(ref.partition)
    ) {
      return false;
    }
  }

  return true;
}

async function main() {
  const clusters = await readJsonl(dedupedLoopsPath);
  const styleMapping = await readJson(styleMappingPath);
  const sourcePolicy = await readJson(sourcePolicyPath);
  const blacklist = await readJson(loopBlacklistPath);
  const policyMap = new Map(sourcePolicy.sources.map((entry) => [entry.sourceId, entry]));
  const blockedIds = new Set(blacklist.blockedCandidateIds ?? []);
  const blockedExactKeys = new Set(blacklist.blockedExactKeys ?? []);
  const generated = {
    generatedVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    substyles: styleMapping.substyles.map((mapping) => {
      const loopFragments = clusters
        .map((cluster) => {
          const styleFitScore = cluster.styleSupport[mapping.substyleId] ?? 0;

          if (styleFitScore < 0.45) {
            return null;
          }

          const blacklisted =
            blockedIds.has(cluster.canonicalCandidateId) || blockedExactKeys.has(cluster.exactDedupeKey);
          const policyAllowed = policyAllowsCluster(cluster, policyMap);
          const reviewStatus = blacklisted
            ? 'blocked_by_blacklist'
            : policyAllowed
              ? 'ready_for_review'
              : 'blocked_by_source_policy';

          return {
            id: `fragment-${mapping.substyleId}-${cluster.clusterId}`,
            substyleId: mapping.substyleId,
            clusterId: cluster.clusterId,
            canonicalCandidateId: cluster.canonicalCandidateId,
            romanSequence: cluster.canonicalLoop.romanSequence,
            functionPath: cluster.canonicalLoop.functionPath,
            durationPatternBeats: cluster.canonicalLoop.durationPatternBeats,
            closure: cluster.canonicalLoop.closure,
            colorProfile: cluster.canonicalLoop.colorProfile,
            tags: cluster.canonicalLoop.tags,
            totalScore: cluster.score.total,
            styleFitScore,
            reviewStatus,
            provenanceSummary: buildProvenanceSummary(cluster.canonicalLoop.sourceRefs)
          };
        })
        .filter(Boolean)
        .sort((left, right) => {
          const statusWeight = {
            ready_for_review: 2,
            blocked_by_source_policy: 1,
            blocked_by_blacklist: 0
          };

          return (
            statusWeight[right.reviewStatus] - statusWeight[left.reviewStatus] ||
            right.styleFitScore - left.styleFitScore ||
            right.totalScore - left.totalScore
          );
        })
        .slice(0, 24);

      return {
        substyleId: mapping.substyleId,
        loopFragments
      };
    })
  };

  const issues = validateGeneratedLoopFragments(generated);

  if (issues.length > 0) {
    printIssues(issues);
    process.exitCode = 1;
    return;
  }

  await writeJson(generatedFragmentsPath, generated);
  console.log(
    `Generated loop fragment review file with ${generated.substyles.reduce(
      (sum, entry) => sum + entry.loopFragments.length,
      0
    )} fragment(s).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
