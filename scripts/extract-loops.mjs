import { listFilesRecursive } from './lib/fs-utils.mjs';
import { readJsonl, writeJsonl } from './lib/jsonl.mjs';
import {
  analysis16Path,
  analysis8Path,
  candidatePath,
  normalizedDir
} from './lib/pipeline-paths.mjs';
import {
  buildCandidateTags,
  computeLoopability,
  deriveColorProfile,
  deriveTransformSlots,
  inferClosure,
  romanEditDistance,
  rootMotionSkeleton
} from './lib/loop-analysis.mjs';
import { slugify } from './lib/pipeline-utils.mjs';

const SUPPORTED_PATTERNS = new Set(['8,8', '4,4,4,4']);

function groupByWork(events) {
  const groups = new Map();

  for (const event of events) {
    const key = `${event.sourceId}|${event.partition}|${event.workId}|${event.annotationId}`;
    const group = groups.get(key);

    if (group) {
      group.push(event);
      continue;
    }

    groups.set(key, [event]);
  }

  return groups;
}

function sortEvents(events) {
  return [...events].sort((left, right) => {
    if (left.barIndex !== right.barIndex) {
      return left.barIndex - right.barIndex;
    }

    return left.beatStart - right.beatStart;
  });
}

function windowBars(events, startBar) {
  const endBar = startBar + 3;
  return events.filter((event) => event.barIndex >= startBar && event.barIndex <= endBar);
}

function hasFullBarCoverage(windowEvents, startBar) {
  const requiredBars = new Set([startBar, startBar + 1, startBar + 2, startBar + 3]);
  const presentBars = new Set(windowEvents.map((event) => event.barIndex));

  for (const bar of requiredBars) {
    if (!presentBars.has(bar)) {
      return false;
    }
  }

  return true;
}

function collapseWindow(windowEvents, startBar) {
  const segments = [];

  for (const event of sortEvents(windowEvents)) {
    const duration = event.beatEnd - event.beatStart;

    if (!Number.isFinite(duration) || duration <= 0) {
      return null;
    }

    const absoluteStart = (event.barIndex - startBar) * 4 + event.beatStart;
    const absoluteEnd = absoluteStart + duration;
    const previous = segments.at(-1);

    if (
      previous &&
      previous.romanNumeral === event.romanNumeral &&
      previous.functionLabel === event.functionLabel &&
      previous.absoluteEnd === absoluteStart
    ) {
      previous.durationBeats += duration;
      previous.absoluteEnd = absoluteEnd;
      previous.endBar = event.barIndex;
      previous.endBeat = event.beatEnd;
      previous.extensions = Array.from(new Set([...previous.extensions, ...event.extensions]));
      continue;
    }

    segments.push({
      romanNumeral: event.romanNumeral,
      functionLabel: event.functionLabel,
      quality: event.quality,
      extensions: [...event.extensions],
      durationBeats: duration,
      startBar: event.barIndex,
      endBar: event.barIndex,
      endBeat: event.beatEnd,
      absoluteEnd
    });
  }

  return segments;
}

function buildSignature(segments, mode) {
  return {
    mode,
    chordCount: segments.length,
    romanSequence: segments.map((segment) => segment.romanNumeral),
    functionPath: segments.map((segment) => segment.functionLabel),
    durationPatternBeats: segments.map((segment) => segment.durationBeats),
    skeleton: rootMotionSkeleton(segments.map((segment) => segment.romanNumeral))
  };
}

function compareWindowSignature(left, right) {
  if (!left || !right || left.chordCount !== right.chordCount) {
    return { exact: false, near: false };
  }

  const exact =
    left.mode === right.mode &&
    left.romanSequence.join('|') === right.romanSequence.join('|') &&
    left.functionPath.join('|') === right.functionPath.join('|') &&
    left.durationPatternBeats.join('|') === right.durationPatternBeats.join('|');

  const near =
    left.functionPath.join('|') === right.functionPath.join('|') &&
    (romanEditDistance(left.romanSequence, right.romanSequence) <= 1 || left.skeleton === right.skeleton);

  return { exact, near };
}

function analyzeRepeat(workEvents, startBar, baseSignature, repeatWindows) {
  const windows = [];

  for (let index = 1; index <= repeatWindows; index += 1) {
    const candidateEvents = windowBars(workEvents, startBar + index * 4);

    if (!hasFullBarCoverage(candidateEvents, startBar + index * 4)) {
      return { exact: false, near: false, matchedWindows: windows };
    }

    const collapsed = collapseWindow(candidateEvents, startBar + index * 4);

    if (!collapsed) {
      return { exact: false, near: false, matchedWindows: windows };
    }

    const signature = buildSignature(collapsed, baseSignature.mode);
    const comparison = compareWindowSignature(baseSignature, signature);
    windows.push({
      startBar: startBar + index * 4,
      exact: comparison.exact,
      near: comparison.exact || comparison.near
    });

    if (!comparison.exact && !comparison.near) {
      return { exact: false, near: false, matchedWindows: windows };
    }
  }

  return {
    exact: windows.length === repeatWindows && windows.every((entry) => entry.exact),
    near: windows.length === repeatWindows && windows.every((entry) => entry.near),
    matchedWindows: windows
  };
}

async function main() {
  const eventFiles = await listFilesRecursive(
    normalizedDir,
    (filePath) => filePath.endsWith('.events.jsonl') && !filePath.endsWith('.gitkeep')
  );

  const allEvents = [];

  for (const filePath of eventFiles) {
    allEvents.push(...(await readJsonl(filePath)));
  }

  const candidates = [];
  const repeat8 = [];
  const repeat16 = [];
  const works = groupByWork(allEvents);

  for (const workEvents of works.values()) {
    const sorted = sortEvents(workEvents);
    const uniqueBars = [...new Set(sorted.map((event) => event.barIndex))].sort((left, right) => left - right);

    if (!sorted.every((event) => event.meter === '4/4')) {
      continue;
    }

    for (const startBar of uniqueBars) {
      const candidateEvents = windowBars(sorted, startBar);

      if (!hasFullBarCoverage(candidateEvents, startBar)) {
        continue;
      }

      if (candidateEvents.some((event) => event.mode !== 'major' && event.mode !== 'minor')) {
        continue;
      }

      const collapsed = collapseWindow(candidateEvents, startBar);

      if (!collapsed || collapsed.length === 0) {
        continue;
      }

      const durationPatternBeats = collapsed.map((segment) => segment.durationBeats);

      if (!SUPPORTED_PATTERNS.has(durationPatternBeats.join(','))) {
        continue;
      }

      const chordCount = collapsed.length;
      const mode = candidateEvents[0].mode;
      const signature = buildSignature(collapsed, mode);
      const closure = inferClosure(signature.functionPath);
      const averageConfidence =
        candidateEvents.reduce((sum, event) => sum + event.confidence, 0) / candidateEvents.length;
      const baseCandidate = {
        id: `loop-${candidateEvents[0].sourceId}-${candidateEvents[0].workId}-${startBar}-${slugify(
          signature.romanSequence.join('-')
        )}`,
        mode,
        chordCount,
        romanSequence: signature.romanSequence,
        functionPath: signature.functionPath,
        durationPatternBeats,
        closure,
        colorProfile: deriveColorProfile(candidateEvents),
        loopability: computeLoopability(chordCount, closure, signature.functionPath),
        averageConfidence,
        transformSlots: deriveTransformSlots(collapsed),
        repeat8Ok: false,
        repeat16Ok: false,
        supportCount: 1,
        sourceRefs: [
          {
            sourceId: candidateEvents[0].sourceId,
            partition: candidateEvents[0].partition,
            workId: candidateEvents[0].workId,
            annotationId: candidateEvents[0].annotationId,
            startBar,
            endBar: startBar + 3,
            licenseClass: candidateEvents[0].licenseClass
          }
        ],
        tags: []
      };

      baseCandidate.tags = buildCandidateTags(baseCandidate, baseCandidate.sourceRefs);

      const repeat8Result = analyzeRepeat(sorted, startBar, signature, 1);
      const repeat16Result = analyzeRepeat(sorted, startBar, signature, 3);

      baseCandidate.repeat8Ok = repeat8Result.exact || repeat8Result.near;
      baseCandidate.repeat16Ok = repeat16Result.exact || repeat16Result.near;
      candidates.push(baseCandidate);
      repeat8.push({
        candidateId: baseCandidate.id,
        startBar,
        exactRepeat: repeat8Result.exact,
        nearRepeat: repeat8Result.near,
        matchedWindows: repeat8Result.matchedWindows
      });
      repeat16.push({
        candidateId: baseCandidate.id,
        startBar,
        exactRepeat: repeat16Result.exact,
        nearRepeat: repeat16Result.near,
        matchedWindows: repeat16Result.matchedWindows
      });
    }
  }

  await writeJsonl(candidatePath, candidates);
  await writeJsonl(analysis8Path, repeat8);
  await writeJsonl(analysis16Path, repeat16);
  console.log(`Extracted ${candidates.length} loop candidate(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
