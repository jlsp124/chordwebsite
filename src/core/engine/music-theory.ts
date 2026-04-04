import type { ScaleMode } from '../types/index.ts';

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11
};

const SEMITONE_TO_NOTE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const SCALE_INTERVALS: Record<ScaleMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10]
};

const ROMAN_TO_DEGREE: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7
};

function getScaleInterval(scaleMode: ScaleMode, degree: number): number {
  const interval = SCALE_INTERVALS[scaleMode][degree - 1];

  if (interval === undefined) {
    throw new Error(`Unsupported scale degree "${degree}" for ${scaleMode}.`);
  }

  return interval;
}

function getNoteFromSemitone(semitone: number): string {
  const note = SEMITONE_TO_NOTE[semitone];

  if (!note) {
    throw new Error(`Unsupported semitone "${semitone}".`);
  }

  return note;
}

export interface ParsedRomanNumeral {
  degree: number;
  quality: 'major' | 'minor';
  accidentalOffset: number;
}

function normalizeDegreeSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

export function parseRomanNumeral(romanNumeral: string): ParsedRomanNumeral {
  const trimmedNumeral = romanNumeral.trim();
  const accidentalMatch = trimmedNumeral.match(/^([b#]*)(.+)$/);
  const accidentalPart = accidentalMatch?.[1] ?? '';
  const coreSymbol = accidentalMatch?.[2] ?? trimmedNumeral;
  const normalizedSymbol = normalizeDegreeSymbol(coreSymbol);
  const degree = ROMAN_TO_DEGREE[normalizedSymbol];

  if (!degree) {
    throw new Error(`Unsupported Roman numeral "${romanNumeral}".`);
  }

  const accidentalOffset = [...accidentalPart].reduce((offset, symbol) => {
    if (symbol === '#') {
      return offset + 1;
    }

    if (symbol === 'b') {
      return offset - 1;
    }

    return offset;
  }, 0);

  const quality = coreSymbol === normalizedSymbol ? 'major' : 'minor';

  return {
    degree,
    quality,
    accidentalOffset
  };
}

export function noteNameFromKey(key: string, scaleMode: ScaleMode, romanNumeral: string): string {
  const tonicSemitone = NOTE_TO_SEMITONE[key];

  if (tonicSemitone === undefined) {
    throw new Error(`Unsupported key "${key}".`);
  }

  const parsedRomanNumeral = parseRomanNumeral(romanNumeral);
  const interval = getScaleInterval(scaleMode, parsedRomanNumeral.degree);
  const semitone = (tonicSemitone + interval + parsedRomanNumeral.accidentalOffset + 12) % 12;

  return getNoteFromSemitone(semitone);
}

export function noteNameFromDegree(key: string, scaleMode: ScaleMode, degreeText: string): string {
  const tonicSemitone = NOTE_TO_SEMITONE[key];

  if (tonicSemitone === undefined) {
    throw new Error(`Unsupported key "${key}".`);
  }

  const degree = Number.parseInt(degreeText, 10);

  if (!Number.isInteger(degree) || degree < 1 || degree > 7) {
    throw new Error(`Unsupported slash-bass degree "${degreeText}".`);
  }

  const semitone = (tonicSemitone + getScaleInterval(scaleMode, degree)) % 12;
  return getNoteFromSemitone(semitone);
}

function decorationToSuffix(baseQuality: 'major' | 'minor', decorationTag: string): string {
  const qualityPrefix = baseQuality === 'minor' ? 'm' : '';

  switch (decorationTag) {
    case 'maj7':
      return baseQuality === 'minor' ? `${qualityPrefix}(maj7)` : 'maj7';
    case 'min7':
      return 'm7';
    case '7':
      return `${qualityPrefix}7`;
    case '6':
      return `${qualityPrefix}6`;
    case '9':
      return `${qualityPrefix}9`;
    case '11':
      return `${qualityPrefix}11`;
    case '13':
      return `${qualityPrefix}13`;
    case 'add9':
      return `${qualityPrefix}add9`;
    case 'add11':
      return `${qualityPrefix}add11`;
    case 'sus2':
      return 'sus2';
    case 'sus4':
      return 'sus4';
    case '#11':
      return `${qualityPrefix}#11`;
    case 'b9':
      return `${qualityPrefix}b9`;
    default:
      return qualityPrefix;
  }
}

export function formatChordName(
  key: string,
  scaleMode: ScaleMode,
  romanNumeral: string,
  decorationTags: readonly string[],
  slashBassDegree?: string | null
): string {
  const parsedRomanNumeral = parseRomanNumeral(romanNumeral);
  const root = noteNameFromKey(key, scaleMode, romanNumeral);
  const decorationSuffix = decorationTags.length > 0
    ? decorationToSuffix(parsedRomanNumeral.quality, decorationTags[0] ?? '')
    : parsedRomanNumeral.quality === 'minor'
      ? 'm'
      : '';
  const slashBass = slashBassDegree
    ? `/${noteNameFromDegree(key, scaleMode, slashBassDegree)}`
    : '';

  return `${root}${decorationSuffix}${slashBass}`;
}

export function alignBeatsPattern(slotCount: number, beatsPerChangePattern: readonly number[]): number[] {
  if (slotCount <= 0) {
    return [];
  }

  const pattern = [...beatsPerChangePattern];

  if (pattern.length === 0) {
    return new Array(slotCount).fill(4);
  }

  while (pattern.length < slotCount) {
    let indexToSplit = 0;

    for (let index = 1; index < pattern.length; index += 1) {
      if ((pattern[index] ?? 0) > (pattern[indexToSplit] ?? 0)) {
        indexToSplit = index;
      }
    }

    const duration = pattern[indexToSplit] ?? 4;
    const firstHalf = Math.max(1, Math.floor(duration / 2));
    const secondHalf = Math.max(1, duration - firstHalf);
    pattern.splice(indexToSplit, 1, firstHalf, secondHalf);
  }

  if (pattern.length > slotCount) {
    const groupedPattern = new Array(slotCount).fill(0);

    for (const [index, duration] of pattern.entries()) {
      const bucketIndex = Math.min(
        slotCount - 1,
        Math.floor((index / pattern.length) * slotCount)
      );
      groupedPattern[bucketIndex] = (groupedPattern[bucketIndex] ?? 0) + duration;
    }

    return groupedPattern;
  }

  return pattern;
}
