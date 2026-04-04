import {
  midiFromDegree,
  midiFromRomanNumeral,
  parseRomanNumeral
} from '../engine/music-theory.ts';
import { createSeededRng } from '../engine/seeded-rng.ts';
import type { GenerationBundle, MidiPreset } from '../types/index.ts';

export interface MidiHitEvent {
  id: string;
  slotIndex: number;
  timeBeats: number;
  durationBeats: number;
  midiNotes: number[];
  velocity: number;
}

export interface MidiNoteEvent {
  id: string;
  slotIndex: number;
  midi: number;
  timeBeats: number;
  durationBeats: number;
  velocity: number;
}

export interface RealizedMidiClip {
  preset: MidiPreset;
  bpm: number;
  totalBeats: number;
  fileName: string;
  hits: MidiHitEvent[];
  noteEvents: MidiNoteEvent[];
}

interface PatternStep {
  offsetBeats: number;
  durationBeats: number;
  mode: 'chord' | 'arp';
  velocityScale: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function dedupeSorted(values: readonly number[]): number[] {
  return [...new Set([...values].sort((left, right) => left - right))];
}

function sanitizeFilePart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolvePreviewTempo(bundle: GenerationBundle): number {
  const { request, metadata } = bundle;

  if (bundle.result.familyId === 'dance') {
    return 122;
  }

  if (bundle.result.familyId === 'trap') {
    return 140;
  }

  if (bundle.result.familyId === 'rnb') {
    return 94;
  }

  if (bundle.result.familyId === 'pop') {
    return 116;
  }

  if (bundle.result.familyId === 'kpop') {
    if (request.sectionIntent === 'bridge' || metadata.substyleName.includes('Ballad')) {
      return 86;
    }

    if (metadata.substyleName.includes('Dark Synth')) {
      return 112;
    }

    return 118;
  }

  return 110;
}

function resolveVoiceTarget(preset: MidiPreset): number {
  const [minimumMidi, maximumMidi] = preset.registerRange;
  const range = maximumMidi - minimumMidi;
  const voiceStyle = preset.voicingStyle;

  if (voiceStyle.includes('low_mid')) {
    return minimumMidi + range * 0.28;
  }

  if (voiceStyle.includes('upper') || voiceStyle.includes('light')) {
    return minimumMidi + range * 0.66;
  }

  if (voiceStyle.includes('wide') || voiceStyle.includes('spread')) {
    return minimumMidi + range * 0.56;
  }

  return minimumMidi + range * 0.46;
}

function buildChordIntervals(
  romanNumeral: string,
  decorationTags: readonly string[]
): number[] {
  const parsed = parseRomanNumeral(romanNumeral);
  let third = parsed.quality === 'minor' ? 3 : 4;

  if (decorationTags.includes('sus2')) {
    third = 2;
  } else if (decorationTags.includes('sus4')) {
    third = 5;
  }

  const intervals = [0, third, 7];

  if (decorationTags.includes('6')) {
    intervals.push(9);
  }

  if (decorationTags.includes('min7') || decorationTags.includes('7')) {
    intervals.push(10);
  }

  if (decorationTags.includes('maj7')) {
    intervals.push(11);
  }

  if (decorationTags.includes('b9')) {
    intervals.push(13);
  }

  if (decorationTags.includes('9') || decorationTags.includes('add9')) {
    intervals.push(14);
  }

  if (decorationTags.includes('11') || decorationTags.includes('add11')) {
    intervals.push(17);
  }

  if (decorationTags.includes('#11')) {
    intervals.push(18);
  }

  if (decorationTags.includes('13')) {
    intervals.push(21);
  }

  return dedupeSorted(intervals);
}

function chooseRootOctave(rootMidiClass: number, preset: MidiPreset): number {
  const targetMidi = resolveVoiceTarget(preset);
  let bestOctave = 4;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let octave = 2; octave <= 6; octave += 1) {
    const candidate = rootMidiClass + octave * 12;
    const distance = Math.abs(candidate - targetMidi);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestOctave = octave;
    }
  }

  return bestOctave;
}

function fitNonBassVoicesIntoRange(voices: number[], preset: MidiPreset): number[] {
  const [minimumMidi, maximumMidi] = preset.registerRange;
  const fitted = [...voices];

  while (fitted[fitted.length - 1] !== undefined && (fitted[fitted.length - 1] ?? 0) > maximumMidi) {
    for (let index = 0; index < fitted.length; index += 1) {
      fitted[index] = (fitted[index] ?? 0) - 12;
    }
  }

  while (fitted[0] !== undefined && (fitted[0] ?? 0) < minimumMidi + 3) {
    for (let index = 0; index < fitted.length; index += 1) {
      fitted[index] = (fitted[index] ?? 0) + 12;
    }
  }

  return fitted;
}

function addStyleVoicingColor(voices: number[], preset: MidiPreset): number[] {
  const colored = [...voices];
  const voiceStyle = preset.voicingStyle;
  const highestVoice = colored[colored.length - 1];
  const [, maximumMidi] = preset.registerRange;

  if (highestVoice === undefined) {
    return colored;
  }

  if ((voiceStyle.includes('wide') || voiceStyle.includes('spread')) && highestVoice + 12 <= maximumMidi) {
    colored[colored.length - 1] = highestVoice + 12;
  }

  if (
    (voiceStyle.includes('upper_motion') || voiceStyle.includes('polished_upper') || voiceStyle.includes('light_upper')) &&
    highestVoice + 12 <= maximumMidi
  ) {
    colored.push(highestVoice + 12);
  }

  if ((voiceStyle.includes('stack') || voiceStyle.includes('stabs')) && colored.length < 4) {
    const root = colored[0];
    if (root !== undefined && root + 12 <= maximumMidi) {
      colored.push(root + 12);
    }
  }

  return dedupeSorted(colored);
}

function buildChordVoicing(bundle: GenerationBundle, slotIndex: number): number[] {
  const slot = bundle.result.chordSlots[slotIndex];

  if (!slot) {
    throw new Error(`Chord slot ${slotIndex} is missing from the generation result.`);
  }

  const rootClassMidi = midiFromRomanNumeral(
    bundle.request.key,
    bundle.request.scaleMode,
    slot.romanNumeral,
    0
  );
  const rootOctave = chooseRootOctave(rootClassMidi, bundle.midiPreset);
  const rootMidi = midiFromRomanNumeral(
    bundle.request.key,
    bundle.request.scaleMode,
    slot.romanNumeral,
    rootOctave
  );
  let voices = buildChordIntervals(slot.romanNumeral, slot.decorationTags).map(
    (interval) => rootMidi + interval
  );
  voices = fitNonBassVoicesIntoRange(voices, bundle.midiPreset);
  voices = addStyleVoicingColor(voices, bundle.midiPreset);

  if (slot.slashBassDegree) {
    const bassMidi = midiFromDegree(
      bundle.request.key,
      bundle.request.scaleMode,
      slot.slashBassDegree,
      Math.max(1, rootOctave - 1)
    );
    voices = dedupeSorted([bassMidi, ...voices]);
  }

  return voices.filter((midi) => {
    const [minimumMidi, maximumMidi] = bundle.midiPreset.registerRange;
    return midi >= minimumMidi - 12 && midi <= maximumMidi;
  });
}

function resolveSustainFactor(sustainBehavior: string): number {
  switch (sustainBehavior) {
    case 'short_release':
      return 0.34;
    case 'short_to_medium':
      return 0.52;
    case 'tight_bar_sustain':
      return 0.72;
    case 'medium_sustain':
      return 0.8;
    case 'clean_bar_sustain':
    case 'smooth_bar_sustain':
      return 0.88;
    case 'phrase_sustain':
    case 'clean_phrase_sustain':
      return 0.92;
    case 'long_phrase_sustain':
    case 'pedal_like':
      return 0.98;
    default:
      return 0.86;
  }
}

function resolveVelocity(
  velocityProfile: string,
  stepIndex: number,
  stepCount: number,
  velocityScale: number
): number {
  const progress = stepCount <= 1 ? 0 : stepIndex / Math.max(stepCount - 1, 1);
  let velocity = 0.74;

  switch (velocityProfile) {
    case 'soft_swell':
      velocity = 0.48 + Math.sin(progress * Math.PI) * 0.18;
      break;
    case 'gentle_wave':
      velocity = 0.52 + Math.sin(progress * Math.PI * 2) * 0.08;
      break;
    case 'gentle_rise':
    case 'lifted_wave':
      velocity = 0.55 + progress * 0.18;
      break;
    case 'warm_pulse':
      velocity = stepIndex % 2 === 0 ? 0.72 : 0.62;
      break;
    case 'gentle_accent':
      velocity = stepIndex === 0 ? 0.72 : 0.58;
      break;
    case 'steady_accent':
      velocity = stepIndex % 2 === 0 ? 0.82 : 0.72;
      break;
    case 'accented_drop':
    case 'accented_even':
      velocity = stepIndex === 0 ? 0.88 : 0.74;
      break;
    case 'firm_even':
      velocity = 0.82;
      break;
    case 'bright_even':
      velocity = 0.8;
      break;
    case 'warm_even':
      velocity = 0.68;
      break;
    case 'medium_even':
    default:
      velocity = 0.74;
      break;
  }

  return clamp(velocity * velocityScale, 0.28, 0.98);
}

function buildCompPattern(rhythmPattern: string, durationBeats: number): PatternStep[] {
  const patternMap: Record<string, PatternStep[]> = {
    syncopated_stabs: [
      { offsetBeats: 0, durationBeats: 0.4, mode: 'chord', velocityScale: 1 },
      { offsetBeats: 1.5, durationBeats: 0.28, mode: 'chord', velocityScale: 0.92 },
      { offsetBeats: 2.75, durationBeats: 0.28, mode: 'chord', velocityScale: 0.96 }
    ],
    four_on_floor_stabs: [
      { offsetBeats: 0, durationBeats: 0.28, mode: 'chord', velocityScale: 0.94 },
      { offsetBeats: 1, durationBeats: 0.28, mode: 'chord', velocityScale: 0.9 },
      { offsetBeats: 2, durationBeats: 0.28, mode: 'chord', velocityScale: 0.98 },
      { offsetBeats: 3, durationBeats: 0.28, mode: 'chord', velocityScale: 0.92 }
    ],
    lazy_syncopation: [
      { offsetBeats: 0.5, durationBeats: 0.66, mode: 'chord', velocityScale: 0.9 },
      { offsetBeats: 2, durationBeats: 0.5, mode: 'chord', velocityScale: 1 },
      { offsetBeats: 3.25, durationBeats: 0.4, mode: 'chord', velocityScale: 0.88 }
    ],
    restrained_syncopation: [
      { offsetBeats: 0, durationBeats: 0.42, mode: 'chord', velocityScale: 0.9 },
      { offsetBeats: 2.5, durationBeats: 0.34, mode: 'chord', velocityScale: 0.82 }
    ],
    laid_back_syncopation: [
      { offsetBeats: 0.5, durationBeats: 0.44, mode: 'chord', velocityScale: 0.88 },
      { offsetBeats: 1.75, durationBeats: 0.44, mode: 'chord', velocityScale: 0.84 },
      { offsetBeats: 3, durationBeats: 0.38, mode: 'chord', velocityScale: 0.94 }
    ],
    offbeat_chord_swells: [
      { offsetBeats: 0.5, durationBeats: 0.88, mode: 'chord', velocityScale: 0.84 },
      { offsetBeats: 2.5, durationBeats: 0.88, mode: 'chord', velocityScale: 0.92 }
    ]
  };

  const steps = patternMap[rhythmPattern] ?? [
    { offsetBeats: 0, durationBeats: 0.45, mode: 'chord', velocityScale: 0.92 },
    { offsetBeats: Math.max(0.5, durationBeats / 2), durationBeats: 0.4, mode: 'chord', velocityScale: 0.88 }
  ];

  return steps.filter((step) => step.offsetBeats < durationBeats);
}

function buildArpPattern(rhythmPattern: string, durationBeats: number): PatternStep[] {
  const stepSize = rhythmPattern === 'slow_broken_chords' || rhythmPattern === 'broken_chord_wave' ? 1 : 0.5;
  const steps: PatternStep[] = [];

  for (let offsetBeats = 0; offsetBeats < durationBeats; offsetBeats += stepSize) {
    steps.push({
      offsetBeats,
      durationBeats: Math.min(stepSize * 0.92, durationBeats - offsetBeats),
      mode: 'arp',
      velocityScale: 0.88 + (offsetBeats / Math.max(durationBeats, 1)) * 0.12
    });
  }

  return steps;
}

function buildPatternSteps(
  preset: MidiPreset,
  slotDurationBeats: number
): PatternStep[] {
  if (preset.mode === 'comp') {
    return buildCompPattern(preset.rhythmPattern, slotDurationBeats);
  }

  if (preset.mode === 'arp') {
    return buildArpPattern(preset.rhythmPattern, slotDurationBeats);
  }

  return [
    {
      offsetBeats: 0,
      durationBeats: Math.max(0.25, slotDurationBeats * resolveSustainFactor(preset.sustainBehavior)),
      mode: 'chord',
      velocityScale: 1
    }
  ];
}

function rotatePattern<TValue>(values: readonly TValue[], rotation: number): TValue[] {
  if (values.length === 0) {
    return [];
  }

  const normalizedRotation = ((rotation % values.length) + values.length) % values.length;
  return [...values.slice(normalizedRotation), ...values.slice(0, normalizedRotation)];
}

function buildArpNotes(
  voices: readonly number[],
  stepIndex: number,
  stepCount: number,
  seedKey: string
): number[] {
  const rng = createSeededRng(`${seedKey}:arp-order`);
  const rotated = rotatePattern(voices, rng.pickIndex(Math.max(voices.length, 1)));

  if (rotated.length === 0) {
    return [];
  }

  const cycleLength = rotated.length === 1 ? 1 : rotated.length * 2 - 2;
  const cycleIndex = stepCount <= 1 ? stepIndex % rotated.length : stepIndex % cycleLength;
  const noteIndex =
    cycleIndex < rotated.length ? cycleIndex : cycleLength - cycleIndex;
  const note = rotated[noteIndex] ?? rotated[0];

  return note === undefined ? [] : [note];
}

function flattenHitNotes(hit: MidiHitEvent): MidiNoteEvent[] {
  return hit.midiNotes.map((midiNote, noteIndex) => ({
    id: `${hit.id}-note-${noteIndex}`,
    slotIndex: hit.slotIndex,
    midi: midiNote,
    timeBeats: hit.timeBeats,
    durationBeats: hit.durationBeats,
    velocity: hit.velocity
  }));
}

export function buildMidiFileName(bundle: GenerationBundle): string {
  const fileParts = [
    bundle.result.familyId,
    bundle.result.substyleId,
    bundle.result.sectionIntent,
    bundle.request.key,
    bundle.request.scaleMode,
    bundle.midiPreset.mode,
    bundle.request.seed
  ]
    .map(sanitizeFilePart)
    .filter((value) => value.length > 0);

  return `${fileParts.join('__')}.mid`;
}

export function realizeMidiClip(bundle: GenerationBundle): RealizedMidiClip {
  let currentBeat = 0;
  const hits: MidiHitEvent[] = [];

  for (const slot of bundle.result.chordSlots) {
    const voices = buildChordVoicing(bundle, slot.index);
    const patternSteps = buildPatternSteps(bundle.midiPreset, slot.durationBeats);

    patternSteps.forEach((patternStep, stepIndex) => {
      const midiNotes =
        patternStep.mode === 'arp'
          ? buildArpNotes(
              voices,
              stepIndex,
              patternSteps.length,
              `${bundle.request.seed}:${bundle.result.substyleId}:${slot.index}`
            )
          : voices;

      if (midiNotes.length === 0) {
        return;
      }

      const sustainFactor = resolveSustainFactor(bundle.midiPreset.sustainBehavior);
      const durationBeats = Math.max(
        0.12,
        Math.min(patternStep.durationBeats * sustainFactor, slot.durationBeats - patternStep.offsetBeats + 0.001)
      );

      hits.push({
        id: `hit-${slot.index}-${stepIndex}`,
        slotIndex: slot.index,
        timeBeats: currentBeat + patternStep.offsetBeats,
        durationBeats,
        midiNotes,
        velocity: resolveVelocity(
          bundle.midiPreset.velocityProfile,
          stepIndex,
          patternSteps.length,
          patternStep.velocityScale
        )
      });
    });

    currentBeat += slot.durationBeats;
  }

  return {
    preset: bundle.midiPreset,
    bpm: resolvePreviewTempo(bundle),
    totalBeats: currentBeat,
    fileName: buildMidiFileName(bundle),
    hits,
    noteEvents: hits.flatMap(flattenHitNotes)
  };
}
