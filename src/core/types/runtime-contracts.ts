import type {
  FamilyId,
  HarmonicRhythmDensity,
  MidiPreset,
  SubstyleId
} from './data-model.ts';

export type ScaleMode = 'major' | 'minor';
export type LoopBarCount = 4 | 8 | 16;
export type ChordChangeRate = 'one_bar' | 'two_bars';

export interface GenerationRequest {
  familyId: FamilyId;
  substyleId: SubstyleId;
  key: string;
  scaleMode: ScaleMode;
  loopBars: LoopBarCount;
  chordChangeRate: ChordChangeRate;
  spiceLevel: number;
}

export interface ChordSlot {
  index: number;
  romanNumeral: string;
  functionLabel: string;
  chordName: string;
  durationBeats: number;
  decorationTags: string[];
  slashBassDegree?: string | null;
}

export interface GenerationResult {
  packId: string;
  familyId: FamilyId;
  substyleId: SubstyleId;
  loopArchetypeId: string;
  harmonicRhythmProfileId: string;
  totalBars: LoopBarCount;
  chordChangeRate: ChordChangeRate;
  romanNumerals: string[];
  functionPath: string[];
  chordSlots: ChordSlot[];
  appliedSpicinessTransformIds: string[];
  appliedVariationIds: string[];
  appliedSpecialMoveIds: string[];
  midiPresetId: string;
}

export interface GenerationMetadata {
  familyName: string;
  substyleName: string;
  loopName: string;
  rhythmName: string;
  rhythmDensity: HarmonicRhythmDensity;
  baseLoopBars: 4;
  renderedBars: LoopBarCount;
  loopTags: string[];
  colorSummary: string[];
  activeSpicinessTransformIds: string[];
  selectedVariationIds: string[];
  selectedSpecialMoveIds: string[];
}

export interface GenerationBundle {
  request: GenerationRequest;
  result: GenerationResult;
  metadata: GenerationMetadata;
  midiPreset: MidiPreset;
}
