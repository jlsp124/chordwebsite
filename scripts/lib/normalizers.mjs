import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { listFilesRecursive, readJson, readText } from './fs-utils.mjs';
import {
  buildWorkId,
  inferFunctionLabel,
  inferModeFromKey,
  inferRomanNumeral,
  parseChordSymbol
} from './loop-analysis.mjs';

function meterToBeatsPerBar(meter) {
  const match = typeof meter === 'string' ? meter.match(/^(\d+)\/\d+$/) : null;
  return match ? Number(match[1]) : 4;
}

function finalizeBarEvents(events, beatsPerBar) {
  for (let index = 0; index < events.length; index += 1) {
    const current = events[index];
    const next = events[index + 1];
    current.beatEnd = next ? next.beatStart : beatsPerBar + 1;
  }
}

function buildNormalizedEvent(base, chordInfo, overrides = {}) {
  return {
    ...base,
    chordNormalized: overrides.chordNormalized ?? base.chordOriginal,
    rootPc: chordInfo.rootPc,
    quality: chordInfo.quality,
    extensions: chordInfo.extensions,
    bass: chordInfo.bass,
    ...overrides
  };
}

function parseHumdrumHarmToken(token) {
  const trimmed = token.trim();

  if (!trimmed || trimmed === '.' || trimmed.startsWith('!') || trimmed.startsWith('*') || trimmed.startsWith('=')) {
    return null;
  }

  const beatMatch = trimmed.match(/^(\d+(?:\.\d+)?)(.+)$/);

  if (!beatMatch) {
    return {
      beatStart: 1,
      romanNumeral: trimmed
    };
  }

  return {
    beatStart: Number(beatMatch[1]),
    romanNumeral: beatMatch[2].trim()
  };
}

export async function normalizeFixtures(fixturesDir) {
  const eventsPath = path.join(fixturesDir, 'normalized', 'sample.events.jsonl');
  const worksPath = path.join(fixturesDir, 'normalized', 'sample.works.jsonl');
  const parseJsonl = (contents) =>
    contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));

  return {
    sourceId: 'fixture',
    events: parseJsonl(await readText(eventsPath)),
    works: parseJsonl(await readText(worksPath))
  };
}

export async function normalizeCocoPops(rawDir, sourceId) {
  const harmFiles = await listFilesRecursive(rawDir, (filePath) => filePath.endsWith('.harm'));
  const events = [];
  const works = [];

  for (const filePath of harmFiles) {
    const relativePath = path.relative(rawDir, filePath);
    const parts = relativePath.split(path.sep);
    const partition =
      parts.find((segment) => ['Billboard', 'RollingStone'].includes(segment)) ?? parts[0] ?? 'unknown';
    const workId = path.basename(filePath, '.harm');
    const contents = await readText(filePath);
    const lines = contents.split(/\r?\n/);
    const sectionHints = [];
    const workEvents = [];
    let meter = '4/4';
    let beatsPerBar = 4;
    let currentKey = null;
    let currentMode = 'unknown';
    let currentBar = 0;
    let barEvents = [];

    function flushBar() {
      if (barEvents.length === 0 || currentBar <= 0) {
        barEvents = [];
        return;
      }

      finalizeBarEvents(barEvents, beatsPerBar);
      workEvents.push(...barEvents);
      barEvents = [];
    }

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const columns = line.split('\t');
      const harmToken = columns[0] ?? '';
      const harteToken = columns[1] ?? '';

      if (harmToken.startsWith('*M')) {
        meter = harmToken.slice(2);
        beatsPerBar = meterToBeatsPerBar(meter);
        continue;
      }

      if (harmToken.startsWith('*>')) {
        sectionHints.push(harmToken.slice(2));
        continue;
      }

      if (harmToken.startsWith('*') && /:$/.test(harmToken)) {
        currentKey = harmToken.slice(1, -1);
        currentMode = inferModeFromKey(currentKey);
        continue;
      }

      if (harmToken.startsWith('=')) {
        flushBar();
        const explicitBar = harmToken.match(/^=(\d+)/)?.[1];
        currentBar = explicitBar ? Number(explicitBar) : currentBar + 1;
        continue;
      }

      const parsedHarm = parseHumdrumHarmToken(harmToken);

      if (!parsedHarm || currentBar <= 0) {
        continue;
      }

      const romanNumeral = parsedHarm.romanNumeral.replace(/[_\[\]()]/g, '');
      const chordOriginal = harteToken && harteToken !== '.' ? harteToken : romanNumeral;
      const chordInfo = parseChordSymbol(chordOriginal);

      barEvents.push(
        buildNormalizedEvent(
          {
            sourceId,
            partition,
            workId,
            annotationId: 'harm',
            licenseClass: 'open',
            meter,
            barIndex: currentBar,
            beatStart: parsedHarm.beatStart,
            beatEnd: beatsPerBar + 1,
            chordOriginal,
            globalKey: currentKey,
            localKey: currentKey,
            mode: currentMode,
            romanNumeral,
            functionLabel: inferFunctionLabel(romanNumeral),
            timeBasis: 'measure_beat',
            confidence: 0.92,
            parseFlags: [],
            provenance: {
              file: relativePath.split(path.sep).join('/'),
              format: 'humdrum_harm'
            }
          },
          chordInfo
        )
      );
    }

    flushBar();

    if (workEvents.length === 0) {
      continue;
    }

    events.push(...workEvents);
    works.push({
      sourceId,
      partition,
      workId,
      annotationId: 'harm',
      meter,
      sectionHints: Array.from(new Set(sectionHints)),
      tempoClass: 'unknown',
      sourceFlags: ['humdrum_harm'],
      provenance: {
        file: relativePath.split(path.sep).join('/'),
        key: currentKey
      }
    });
  }

  return { sourceId, events, works };
}

export async function normalizeJht(rawDir, sourceId) {
  const candidateFiles = await listFilesRecursive(rawDir, (filePath) => filePath.endsWith('treebank.json'));
  const filePath = candidateFiles[0];

  if (!filePath) {
    return { sourceId, events: [], works: [] };
  }

  const treebank = await readJson(filePath);
  const events = [];
  const works = [];

  for (const [index, entry] of treebank.entries()) {
    if (!Array.isArray(entry.chords) || !Array.isArray(entry.measures) || !Array.isArray(entry.beats)) {
      continue;
    }

    const meter = `${entry.meter?.numerator ?? 4}/${entry.meter?.denominator ?? 4}`;
    const beatsPerBar = meterToBeatsPerBar(meter);
    const key = entry.key ?? null;
    const mode = inferModeFromKey(key);
    const workId = buildWorkId('jht', entry.title, index);
    const sectionHints = [];

    if (entry.turnaround) {
      sectionHints.push('turnaround');
    }

    if (Array.isArray(entry.trees) && entry.trees.length > 0) {
      sectionHints.push('tree_annotated');
    }

    for (let chordIndex = 0; chordIndex < entry.chords.length; chordIndex += 1) {
      const chordOriginal = entry.chords[chordIndex];

      if (typeof chordOriginal !== 'string' || chordOriginal.trim().length === 0) {
        continue;
      }

      const barIndex = Number(entry.measures[chordIndex] ?? 0);
      const beatStart = Number(entry.beats[chordIndex] ?? 1);
      const nextBar = Number(entry.measures[chordIndex + 1] ?? barIndex);
      const nextBeat = Number(entry.beats[chordIndex + 1] ?? beatsPerBar + 1);
      const beatEnd = nextBar === barIndex ? nextBeat : beatsPerBar + 1;
      const chordInfo = parseChordSymbol(chordOriginal);
      const romanNumeral = inferRomanNumeral(chordInfo.rootPc, key, mode, chordInfo.quality);

      events.push(
        buildNormalizedEvent(
          {
            sourceId,
            partition: 'treebank',
            workId,
            annotationId: 'treebank',
            licenseClass: 'noncommercial',
            meter,
            barIndex,
            beatStart,
            beatEnd,
            chordOriginal,
            globalKey: key,
            localKey: key,
            mode: mode === 'unknown' ? 'major' : mode,
            romanNumeral,
            functionLabel: inferFunctionLabel(romanNumeral),
            timeBasis: 'measure_beat',
            confidence: 0.97,
            parseFlags: [],
            provenance: {
              title: entry.title,
              year: entry.year ?? null
            }
          },
          chordInfo
        )
      );
    }

    works.push({
      sourceId,
      partition: 'treebank',
      workId,
      annotationId: 'treebank',
      meter,
      sectionHints,
      tempoClass: 'unknown',
      sourceFlags: ['treebank_json'],
      provenance: {
        title: entry.title,
        composers: entry.composers ?? null
      }
    });
  }

  return { sourceId, events, works };
}

function readAlignedJamsEvents(jams) {
  if (!Array.isArray(jams.annotations)) {
    return [];
  }

  const annotation = jams.annotations.find((entry) => entry.namespace === 'chord');

  if (!annotation || !Array.isArray(annotation.data)) {
    return [];
  }

  return annotation.data
    .map((datum) => {
      const sandbox = datum?.sandbox ?? {};
      const value = datum?.value ?? {};
      const measure = sandbox.measure ?? sandbox.bar ?? value.measure ?? value.bar ?? null;
      const beatStart = sandbox.beat ?? value.beat ?? 1;
      const beats = sandbox.beats ?? value.beats ?? null;
      const chordOriginal =
        typeof value === 'string'
          ? value
          : value.chord ?? value.label ?? value.harte ?? value.value ?? null;

      if (measure === null || chordOriginal === null) {
        return null;
      }

      return {
        measure: Number(measure),
        beatStart: Number(beatStart),
        beats: beats === null ? null : Number(beats),
        chordOriginal: String(chordOriginal)
      };
    })
    .filter(Boolean);
}

export async function normalizeChoco(rawDir, sourceId) {
  const jamsFiles = await listFilesRecursive(rawDir, (filePath) => filePath.endsWith('.jams'));
  const events = [];
  const works = [];

  for (const filePath of jamsFiles) {
    const relativePath = path.relative(rawDir, filePath);
    const parts = relativePath.split(path.sep);
    const partitionIndex = parts.findIndex((segment) => segment === 'partitions');
    const partition = partitionIndex >= 0 ? parts[partitionIndex + 1] ?? 'unknown' : parts[0] ?? 'unknown';
    const workId = path.basename(filePath, '.jams');
    const jams = await readJson(filePath);
    const alignedEvents = readAlignedJamsEvents(jams);

    if (alignedEvents.length === 0) {
      continue;
    }

    const key =
      jams.file_metadata?.sandbox?.key ??
      jams.file_metadata?.identifiers?.key ??
      jams.sandbox?.key ??
      null;
    const mode = inferModeFromKey(key);
    const meter =
      jams.file_metadata?.sandbox?.meter ??
      jams.annotations?.find((entry) => entry.namespace === 'chord')?.sandbox?.meter ??
      '4/4';
    const beatsPerBar = meterToBeatsPerBar(meter);

    for (let index = 0; index < alignedEvents.length; index += 1) {
      const event = alignedEvents[index];
      const next = alignedEvents[index + 1];
      const chordInfo = parseChordSymbol(event.chordOriginal);
      const romanNumeral = inferRomanNumeral(chordInfo.rootPc, key, mode, chordInfo.quality);
      const beatEnd =
        next && next.measure === event.measure
          ? next.beatStart
          : event.beats !== null
            ? event.beatStart + event.beats
            : beatsPerBar + 1;

      events.push(
        buildNormalizedEvent(
          {
            sourceId,
            partition,
            workId,
            annotationId: 'jams_chord',
            licenseClass: 'mixed',
            meter,
            barIndex: event.measure,
            beatStart: event.beatStart,
            beatEnd,
            chordOriginal: event.chordOriginal,
            globalKey: key,
            localKey: key,
            mode: mode === 'unknown' ? 'major' : mode,
            romanNumeral,
            functionLabel: inferFunctionLabel(romanNumeral),
            timeBasis: 'measure_beat',
            confidence: 0.8,
            parseFlags: [],
            provenance: {
              file: relativePath.split(path.sep).join('/'),
              format: 'jams'
            }
          },
          chordInfo
        )
      );
    }

    works.push({
      sourceId,
      partition,
      workId,
      annotationId: 'jams_chord',
      meter,
      sectionHints: [],
      tempoClass: 'unknown',
      sourceFlags: ['jams_converted'],
      provenance: {
        file: relativePath.split(path.sep).join('/'),
        key
      }
    });
  }

  return { sourceId, events, works };
}

export async function normalizeWeimar(rawDir, sourceId) {
  const dbFiles = await listFilesRecursive(rawDir, (filePath) => filePath.endsWith('.db'));
  const dbPath = dbFiles[0];

  if (!dbPath) {
    return { sourceId, events: [], works: [] };
  }

  const pythonScript = `
import json, sqlite3, sys
db_path = sys.argv[1]
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()
tables = [row[0] for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
rows = []
if 'sections' in tables:
    rows = [dict(row) for row in cur.execute("SELECT * FROM sections WHERE type='CHORD' LIMIT 5000").fetchall()]
print(json.dumps({"tables": tables, "rows": rows}))
`;

  const result = spawnSync('python', ['-c', pythonScript, dbPath], {
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    throw new Error(`Weimar normalization failed: ${result.stderr || result.stdout}`.trim());
  }

  const payload = JSON.parse(result.stdout);
  const events = [];
  const worksById = new Map();

  for (const row of payload.rows) {
    const workId = String(row.melid ?? row.melodyid ?? row.trackid ?? row.id ?? 'unknown');
    const barIndex = Number(row.bar ?? row.measure ?? Number.NaN);
    const beatStart = Number(row.beat ?? 1);
    const chordOriginal = row.value ?? row.chord ?? row.symbol ?? null;

    if (!Number.isFinite(barIndex) || typeof chordOriginal !== 'string') {
      continue;
    }

    const key = row.key ?? null;
    const mode = inferModeFromKey(key);
    const chordInfo = parseChordSymbol(chordOriginal);
    const romanNumeral = inferRomanNumeral(chordInfo.rootPc, key, mode, chordInfo.quality);

    events.push(
      buildNormalizedEvent(
        {
          sourceId,
          partition: 'wjazzd',
          workId,
          annotationId: 'sections_chord',
          licenseClass: 'share_alike_data',
          meter: '4/4',
          barIndex,
          beatStart,
          beatEnd: Number(row.endbeat ?? row.beat_end ?? 5),
          chordOriginal,
          globalKey: key,
          localKey: key,
          mode: mode === 'unknown' ? 'major' : mode,
          romanNumeral,
          functionLabel: inferFunctionLabel(romanNumeral),
          timeBasis: 'measure_beat',
          confidence: 0.7,
          parseFlags: [],
          provenance: {
            table: 'sections'
          }
        },
        chordInfo
      )
    );

    if (!worksById.has(workId)) {
      worksById.set(workId, {
        sourceId,
        partition: 'wjazzd',
        workId,
        annotationId: 'sections_chord',
        meter: '4/4',
        sectionHints: [],
        tempoClass: 'unknown',
        sourceFlags: ['sqlite_sections'],
        provenance: {
          table: 'sections'
        }
      });
    }
  }

  return { sourceId, events, works: [...worksById.values()] };
}
