import { readJson, writeJson } from './lib/fs-utils.mjs';
import { readJsonl, writeJsonl } from './lib/jsonl.mjs';
import {
  buildExactDedupeKey,
  rootMotionSkeleton,
  romanEditDistance
} from './lib/loop-analysis.mjs';
import {
  candidatePath,
  dedupedLoopsPath,
  licenseMixReportPath,
  rejectedLoopsReportPath,
  styleMappingPath,
  topLoopsReportPath
} from './lib/pipeline-paths.mjs';
import { clamp } from './lib/pipeline-utils.mjs';

function mergeTags(collections) {
  return [...new Set(collections.flat())];
}

function mergeSourceRefs(collections) {
  const seen = new Set();
  const merged = [];

  for (const ref of collections.flat()) {
    const key = `${ref.sourceId}|${ref.partition}|${ref.workId}|${ref.annotationId}|${ref.startBar}|${ref.endBar}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(ref);
  }

  return merged;
}

function mergeTransformSlots(collections) {
  const byIndex = new Map();

  for (const slot of collections.flat()) {
    const current = byIndex.get(slot.slotIndex);

    if (!current) {
      byIndex.set(slot.slotIndex, {
        slotIndex: slot.slotIndex,
        allowedDecorations: [...slot.allowedDecorations],
        allowedSlashBassDegrees: [...slot.allowedSlashBassDegrees]
      });
      continue;
    }

    current.allowedDecorations = [...new Set([...current.allowedDecorations, ...slot.allowedDecorations])];
    current.allowedSlashBassDegrees = [
      ...new Set([...current.allowedSlashBassDegrees, ...slot.allowedSlashBassDegrees])
    ];
  }

  return [...byIndex.values()].sort((left, right) => left.slotIndex - right.slotIndex);
}

function pickCanonicalLoop(left, right) {
  const leftScore = left.supportCount * 10 + left.averageConfidence * 5 + left.loopability;
  const rightScore = right.supportCount * 10 + right.averageConfidence * 5 + right.loopability;
  return rightScore > leftScore ? right : left;
}

function combineExactGroup(group) {
  const canonical = group.reduce((best, current) => (best ? pickCanonicalLoop(best, current) : current), null);
  const sourceRefs = mergeSourceRefs(group.map((entry) => entry.sourceRefs));
  const combined = {
    ...canonical,
    supportCount: group.reduce((sum, entry) => sum + entry.supportCount, 0),
    averageConfidence:
      group.reduce((sum, entry) => sum + entry.averageConfidence * entry.supportCount, 0) /
      group.reduce((sum, entry) => sum + entry.supportCount, 0),
    colorProfile: mergeTags(group.map((entry) => entry.colorProfile)),
    loopability: group.reduce((sum, entry) => sum + entry.loopability, 0) / group.length,
    transformSlots: mergeTransformSlots(group.map((entry) => entry.transformSlots)),
    repeat8Ok: group.some((entry) => entry.repeat8Ok),
    repeat16Ok: group.some((entry) => entry.repeat16Ok),
    sourceRefs,
    tags: mergeTags(group.map((entry) => entry.tags))
  };

  return {
    exactDedupeKey: buildExactDedupeKey(combined),
    canonicalLoop: combined,
    clusterMembers: group.map((entry) => entry.id),
    supportCount: combined.supportCount
  };
}

function canNearMerge(left, right) {
  if (left.chordCount !== right.chordCount) {
    return false;
  }

  if (left.functionPath.join('|') !== right.functionPath.join('|')) {
    return false;
  }

  return (
    romanEditDistance(left.romanSequence, right.romanSequence) <= 1 ||
    rootMotionSkeleton(left.romanSequence) === rootMotionSkeleton(right.romanSequence)
  );
}

function scoreStyleFit(loop, mapping) {
  const tagSet = new Set(loop.tags);
  const sourceIds = new Set(loop.sourceRefs.map((ref) => ref.sourceId));

  if (mapping.preferredModes.length > 0 && !mapping.preferredModes.includes(loop.mode)) {
    return 0;
  }

  for (const tag of mapping.requiredTags) {
    if (!tagSet.has(tag)) {
      return 0;
    }
  }

  for (const tag of mapping.forbiddenTags) {
    if (tagSet.has(tag)) {
      return 0;
    }
  }

  let score = 0.35 + loop.loopability * 0.15;

  if (sourceIds.has('fixture')) {
    score += 0.1;
  } else if (mapping.preferredSources.some((sourceId) => sourceIds.has(sourceId))) {
    score += 0.15;
  }

  const boostMatches = mapping.boostTags.filter((tag) => tagSet.has(tag)).length;
  score += Math.min(0.25, boostMatches * 0.05);

  if (loop.repeat8Ok) {
    score += 0.05;
  }

  if (loop.repeat16Ok) {
    score += 0.03;
  }

  return clamp(score, 0, 1);
}

function scoreCluster(loop, sourceCount, sourceDiversity, styleSupport) {
  const transformHeadroom =
    loop.transformSlots.reduce(
      (sum, slot) => sum + slot.allowedDecorations.length + slot.allowedSlashBassDegrees.length,
      0
    ) /
    Math.max(1, loop.chordCount * 5);
  const harmonicColorValue = clamp(0.2 + loop.colorProfile.length * 0.12, 0, 1);
  const crossSourceSupport = clamp((sourceDiversity - 1) / 4 + Math.min(loop.supportCount, 4) / 8, 0, 1);
  const styleFitPrior = Math.max(...Object.values(styleSupport), 0);
  let penalty = 0;

  if (loop.supportCount === 1 && sourceCount === 1) {
    penalty += 0.12;
  }

  if (loop.repeat16Ok && loop.supportCount === 1) {
    penalty += 0.05;
  }

  if (!loop.functionPath.includes('tonic')) {
    penalty += 0.04;
  }

  if (loop.averageConfidence < 0.75) {
    penalty += 0.04;
  }

  const total = clamp(
    0.3 * loop.loopability +
      0.2 * crossSourceSupport +
      0.15 * loop.averageConfidence +
      0.15 * clamp(transformHeadroom, 0, 1) +
      0.1 * styleFitPrior +
      0.1 * harmonicColorValue -
      penalty,
    0,
    1
  );

  return {
    loopFitness: loop.loopability,
    crossSourceSupport,
    annotationTrust: loop.averageConfidence,
    transformHeadroom: clamp(transformHeadroom, 0, 1),
    styleFitPrior,
    harmonicColorValue,
    penalty,
    total
  };
}

async function main() {
  const candidates = await readJsonl(candidatePath);
  const styleMapping = await readJson(styleMappingPath);
  const exactGroups = new Map();

  for (const candidate of candidates) {
    const exactKey = buildExactDedupeKey(candidate);
    const current = exactGroups.get(exactKey);

    if (current) {
      current.push(candidate);
      continue;
    }

    exactGroups.set(exactKey, [candidate]);
  }

  const exactClusters = [...exactGroups.values()].map((group) => combineExactGroup(group));
  const nearClusters = [];

  for (const exactCluster of exactClusters) {
    const existing = nearClusters.find((cluster) =>
      canNearMerge(cluster.canonicalLoop, exactCluster.canonicalLoop)
    );

    if (!existing) {
      nearClusters.push({
        clusterId: `cluster-${nearClusters.length + 1}`,
        canonicalCandidateId: exactCluster.canonicalLoop.id,
        supportCount: exactCluster.supportCount,
        sourceCount: 0,
        sourceDiversity: 0,
        clusterMembers: [...exactCluster.clusterMembers],
        exactDedupeKey: exactCluster.exactDedupeKey,
        nearDedupeKey: `${exactCluster.canonicalLoop.chordCount}|${exactCluster.canonicalLoop.functionPath.join(
          '-'
        )}|${rootMotionSkeleton(exactCluster.canonicalLoop.romanSequence)}`,
        canonicalLoop: exactCluster.canonicalLoop,
        score: null,
        styleSupport: {}
      });
      continue;
    }

    existing.clusterMembers.push(...exactCluster.clusterMembers);
    existing.supportCount += exactCluster.supportCount;
    existing.canonicalLoop = pickCanonicalLoop(existing.canonicalLoop, exactCluster.canonicalLoop);
    existing.canonicalLoop = {
      ...existing.canonicalLoop,
      supportCount: existing.supportCount,
      sourceRefs: mergeSourceRefs([existing.canonicalLoop.sourceRefs, exactCluster.canonicalLoop.sourceRefs]),
      tags: mergeTags([existing.canonicalLoop.tags, exactCluster.canonicalLoop.tags]),
      colorProfile: mergeTags([
        existing.canonicalLoop.colorProfile,
        exactCluster.canonicalLoop.colorProfile
      ]),
      transformSlots: mergeTransformSlots([
        existing.canonicalLoop.transformSlots,
        exactCluster.canonicalLoop.transformSlots
      ]),
      repeat8Ok: existing.canonicalLoop.repeat8Ok || exactCluster.canonicalLoop.repeat8Ok,
      repeat16Ok: existing.canonicalLoop.repeat16Ok || exactCluster.canonicalLoop.repeat16Ok
    };
    existing.canonicalCandidateId = existing.canonicalLoop.id;
    existing.nearDedupeKey = `${existing.canonicalLoop.chordCount}|${existing.canonicalLoop.functionPath.join(
      '-'
    )}|${rootMotionSkeleton(existing.canonicalLoop.romanSequence)}`;
  }

  for (const cluster of nearClusters) {
    const sourceIds = new Set(cluster.canonicalLoop.sourceRefs.map((ref) => ref.sourceId));
    const sourcePartitions = new Set(
      cluster.canonicalLoop.sourceRefs.map((ref) => `${ref.sourceId}|${ref.partition}`)
    );

    cluster.sourceCount = sourceIds.size;
    cluster.sourceDiversity = sourcePartitions.size;
    cluster.styleSupport = Object.fromEntries(
      styleMapping.substyles.map((mapping) => [mapping.substyleId, scoreStyleFit(cluster.canonicalLoop, mapping)])
    );
    cluster.score = scoreCluster(
      cluster.canonicalLoop,
      cluster.sourceCount,
      cluster.sourceDiversity,
      cluster.styleSupport
    );
  }

  const topLoopsByStyle = styleMapping.substyles.map((mapping) => ({
    substyleId: mapping.substyleId,
    topClusters: nearClusters
      .map((cluster) => ({
        clusterId: cluster.clusterId,
        canonicalCandidateId: cluster.canonicalCandidateId,
        romanSequence: cluster.canonicalLoop.romanSequence,
        functionPath: cluster.canonicalLoop.functionPath,
        totalScore: cluster.score.total,
        styleFitScore: cluster.styleSupport[mapping.substyleId] ?? 0,
        sourceCount: cluster.sourceCount,
        sourceDiversity: cluster.sourceDiversity,
        tags: cluster.canonicalLoop.tags
      }))
      .filter((entry) => entry.styleFitScore > 0)
      .sort(
        (left, right) =>
          right.styleFitScore * 0.6 +
          right.totalScore * 0.4 -
          (left.styleFitScore * 0.6 + left.totalScore * 0.4)
      )
      .slice(0, 12)
  }));

  const rejectedLoops = nearClusters
    .filter(
      (cluster) =>
        cluster.score.total < 0.45 || Math.max(...Object.values(cluster.styleSupport), 0) < 0.4
    )
    .map((cluster) => ({
      clusterId: cluster.clusterId,
      canonicalCandidateId: cluster.canonicalCandidateId,
      totalScore: cluster.score.total,
      styleSupport: cluster.styleSupport,
      reasons: [
        cluster.score.total < 0.45 ? 'low_total_score' : null,
        Math.max(...Object.values(cluster.styleSupport), 0) < 0.4 ? 'weak_style_fit' : null
      ].filter(Boolean)
    }));

  const licenseMix = nearClusters.reduce(
    (summary, cluster) => {
      for (const ref of cluster.canonicalLoop.sourceRefs) {
        summary.byLicenseClass[ref.licenseClass] = (summary.byLicenseClass[ref.licenseClass] ?? 0) + 1;
      }

      summary.clusterCount += 1;
      return summary;
    },
    {
      clusterCount: 0,
      byLicenseClass: {}
    }
  );

  await writeJsonl(dedupedLoopsPath, nearClusters);
  await writeJson(topLoopsReportPath, topLoopsByStyle);
  await writeJson(rejectedLoopsReportPath, rejectedLoops);
  await writeJson(licenseMixReportPath, licenseMix);
  console.log(`Clustered ${nearClusters.length} loop family candidate(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
