import { clamp, slugify } from './pipeline-utils.mjs';

const PITCH_CLASS_BY_NOTE = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11
};

const MAJOR_ROMAN_BY_DIFF = {
  0: 'I',
  1: 'bII',
  2: 'II',
  3: 'bIII',
  4: 'III',
  5: 'IV',
  6: '#IV',
  7: 'V',
  8: 'bVI',
  9: 'VI',
  10: 'bVII',
  11: 'VII'
};

const MINOR_ROMAN_BY_DIFF = {
  0: 'I',
  1: 'bII',
  2: 'II',
  3: 'III',
  4: '#III',
  5: 'IV',
  6: '#IV',
  7: 'V',
  8: 'VI',
  9: '#VI',
  10: 'VII',
  11: '#VII'
};

function normalizeKeyToken(key) {
  if (typeof key !== 'string' || key.trim().length === 0) {
    return null;
  }

  const trimmed = key.trim().replace(/:$/, '');
  const match = trimmed.match(/^([A-Ga-g](?:#|b)?)(?:\s*(?:major|minor|maj|min|m))?$/);

  if (!match) {
    return trimmed;
  }

  const [, note] = match;
  return note[0].toUpperCase() + note.slice(1);
}

export function inferModeFromKey(key) {
  if (typeof key !== 'string' || key.trim().length === 0) {
    return 'unknown';
  }

  const trimmed = key.trim();

  if (/[a-g]/.test(trimmed[0]) || /minor|min|m$/i.test(trimmed)) {
    return 'minor';
  }

  return 'major';
}

export function keyToPitchClass(key) {
  const normalized = normalizeKeyToken(key);

  if (!normalized) {
    return null;
  }

  return PITCH_CLASS_BY_NOTE[normalized] ?? null;
}

export function parseChordSymbol(symbol) {
  if (typeof symbol !== 'string' || symbol.trim().length === 0) {
    return {
      rootPc: null,
      quality: 'unknown',
      extensions: [],
      bass: null
    };
  }

  const trimmed = symbol.trim();
  const match = trimmed.match(/^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?$/);

  if (!match) {
    return {
      rootPc: null,
      quality: 'unknown',
      extensions: [],
      bass: null
    };
  }

  const [, root, body, bass] = match;
  const normalizedBody = body ?? '';
  let quality = 'major';

  if (/(maj)/i.test(normalizedBody)) {
    quality = 'major';
  } else if (/(min|m(?!aj))/i.test(normalizedBody)) {
    quality = 'minor';
  } else if (/(dim|o)/i.test(normalizedBody)) {
    quality = 'diminished';
  } else if (/(aug|\+)/i.test(normalizedBody)) {
    quality = 'augmented';
  } else if (/sus/i.test(normalizedBody)) {
    quality = 'suspended';
  } else if (/7/.test(normalizedBody)) {
    quality = 'dominant';
  }

  const extensions = Array.from(
    new Set(
      Array.from(normalizedBody.matchAll(/maj7|13|11|9|7|6|b9|#11|sus2|sus4|add9/gi)).map((match) =>
        match[0]
      )
    )
  );

  if (extensions.length === 0 && (quality === 'major' || quality === 'minor')) {
    extensions.push('triad');
  }

  return {
    rootPc: PITCH_CLASS_BY_NOTE[root] ?? null,
    quality,
    extensions,
    bass: bass ?? null
  };
}

function applyRomanQuality(roman, quality) {
  const accidentalMatch = roman.match(/^(b+|#+)?/);
  const accidental = accidentalMatch?.[0] ?? '';
  const core = roman.slice(accidental.length);

  if (quality === 'minor' || quality === 'diminished') {
    const loweredCore = core.toLowerCase();
    return quality === 'diminished' ? `${accidental}${loweredCore}o` : `${accidental}${loweredCore}`;
  }

  return `${accidental}${core}`;
}

export function inferRomanNumeral(rootPc, key, mode, quality = 'major') {
  const keyPc = keyToPitchClass(key);

  if (rootPc === null || keyPc === null) {
    return '?';
  }

  const diff = (rootPc - keyPc + 12) % 12;
  const baseRoman = (mode === 'minor' ? MINOR_ROMAN_BY_DIFF : MAJOR_ROMAN_BY_DIFF)[diff] ?? 'I';
  return applyRomanQuality(baseRoman, quality);
}

export function inferFunctionLabel(romanNumeral) {
  if (typeof romanNumeral !== 'string' || romanNumeral.trim().length === 0 || romanNumeral === '?') {
    return 'contrast';
  }

  const normalized = romanNumeral.replace(/[^b#ivIV]+/g, '');
  const stripped = normalized.replace(/^(b+|#+)/, '');
  const lowered = stripped.toLowerCase();

  if (lowered === 'i') {
    return 'tonic';
  }

  if (lowered === 'iii' || lowered === 'vi') {
    return 'tonic_family';
  }

  if (lowered === 'ii' || lowered === 'iv') {
    return 'predominant';
  }

  if (lowered === 'v' || lowered === 'vii') {
    return 'dominant';
  }

  return 'contrast';
}

export function inferClosure(functionPath) {
  const last = functionPath.at(-1);
  const previous = functionPath.at(-2);

  if (last === 'tonic' && previous === 'dominant') {
    return 'strong_resolve';
  }

  if (last === 'tonic' || last === 'tonic_family') {
    return 'soft_resolve';
  }

  if (last === 'dominant') {
    return 'open';
  }

  if (last === 'predominant' && functionPath.includes('dominant')) {
    return 'turnback';
  }

  return 'contrastive';
}

export function deriveColorProfile(events) {
  const colors = new Set();

  for (const event of events) {
    if (Array.isArray(event.extensions)) {
      for (const extension of event.extensions) {
        colors.add(extension);
      }
    }

    if (typeof event.quality === 'string' && event.quality !== 'unknown') {
      colors.add(event.quality);
    }
  }

  return [...colors];
}

export function deriveTransformSlots(segments) {
  return segments.map((segment, index) => {
    const decorations = new Set();
    const slashBass = new Set();

    if (segment.functionLabel === 'tonic' || segment.functionLabel === 'tonic_family') {
      decorations.add('add9');
      decorations.add(segment.quality === 'minor' ? '9' : '6');
    }

    if (segment.functionLabel === 'predominant') {
      decorations.add('sus2');
      decorations.add('sus4');
      decorations.add('add9');
    }

    if (segment.functionLabel === 'dominant') {
      decorations.add('7');
      decorations.add('9');
      decorations.add('sus4');
    }

    if (segment.extensions.includes('maj7') || segment.extensions.includes('7')) {
      decorations.add('9');
    }

    if (index > 0) {
      slashBass.add('3');
      slashBass.add('5');
    }

    if (segment.quality === 'minor') {
      slashBass.add('7');
    }

    return {
      slotIndex: index,
      allowedDecorations: [...decorations],
      allowedSlashBassDegrees: [...slashBass]
    };
  });
}

export function computeLoopability(chordCount, closure, functionPath) {
  let score = chordCount === 2 ? 0.86 : 0.74;

  if (closure === 'open' || closure === 'turnback' || closure === 'contrastive') {
    score += 0.06;
  }

  if (closure === 'strong_resolve') {
    score -= 0.04;
  }

  if (functionPath[0] === 'tonic') {
    score += 0.03;
  }

  if (!functionPath.includes('dominant')) {
    score += 0.02;
  }

  return clamp(score, 0, 1);
}

function degreeSkeleton(romanNumeral) {
  const normalized = romanNumeral.replace(/[^b#ivIV]+/g, '');
  const accidentalMatch = normalized.match(/^(b+|#+)?/);
  const accidental = accidentalMatch?.[0] ?? '';
  const core = normalized.slice(accidental.length).toLowerCase();
  const degreeMap = {
    i: '1',
    ii: '2',
    iii: '3',
    iv: '4',
    v: '5',
    vi: '6',
    vii: '7'
  };

  return `${accidental}${degreeMap[core] ?? '?'}`;
}

export function rootMotionSkeleton(romanSequence) {
  return romanSequence.map(degreeSkeleton).join('>');
}

export function romanEditDistance(left, right) {
  const dp = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0));

  for (let i = 0; i <= left.length; i += 1) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= right.length; j += 1) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[left.length][right.length];
}

export function buildExactDedupeKey(candidate) {
  return [
    candidate.mode,
    candidate.romanSequence.join('-'),
    candidate.functionPath.join('-'),
    candidate.durationPatternBeats.join('-'),
    candidate.closure
  ].join('|');
}

export function buildCandidateTags(candidate, sourceRefs) {
  const tags = new Set(candidate.tags ?? []);
  const major = candidate.mode === 'major';
  const minor = candidate.mode === 'minor';
  const hasRichColor = candidate.colorProfile.some((value) => /6|7|9|11|13|maj7/i.test(value));
  const openClosure =
    candidate.closure === 'open' ||
    candidate.closure === 'turnback' ||
    candidate.closure === 'contrastive';
  const partitions = sourceRefs.map((ref) => `${ref.sourceId}:${ref.partition}`.toLowerCase()).join(' ');

  if (major) {
    tags.add('bright');
    tags.add('pop_core');
  }

  if (minor) {
    tags.add('dark');
    tags.add('loop_core');
  }

  if (candidate.chordCount === 2) {
    tags.add('repeatable');
    tags.add('space_for_topline');
    tags.add('groove_locked');
  } else {
    tags.add('hook_friendly');
    tags.add('anthemic');
  }

  if (openClosure) {
    tags.add(major ? 'lift_ready' : 'drop_ready');
  } else if (candidate.closure === 'strong_resolve') {
    tags.add('clean_release');
  }

  if (hasRichColor) {
    tags.add('colored');
    tags.add('rich_extensions');
    tags.add('smooth_motion');
    tags.add('warm');
  }

  if (major && candidate.chordCount === 4) {
    tags.add('easy_listening');
  }

  if (minor && candidate.chordCount === 4) {
    tags.add('futuristic');
    tags.add('synth_ready');
  }

  if (candidate.durationPatternBeats.every((value) => value === 4)) {
    tags.add('four_on_floor_ready');
  }

  if (major && candidate.functionPath.at(-1) === 'tonic') {
    tags.add('clean_release');
  }

  if (minor && candidate.functionPath.includes('dominant')) {
    tags.add('suspended_pull');
  }

  if (partitions.includes('pop') || partitions.includes('billboard') || partitions.includes('rollingstone')) {
    tags.add('hook_friendly');
    tags.add('pop_core');
  }

  if (partitions.includes('trap')) {
    tags.add('loop_core');
    tags.add('space_for_topline');
  }

  if (partitions.includes('jazz') || partitions.includes('treebank') || partitions.includes('real book')) {
    tags.add('rich_extensions');
    tags.add('late_night');
    tags.add('smooth_motion');
  }

  return [...tags];
}

export function buildWorkId(prefix, value, fallbackIndex) {
  const slug = slugify(value ?? '');
  return slug.length > 0 ? `${prefix}-${slug}` : `${prefix}-${fallbackIndex}`;
}
