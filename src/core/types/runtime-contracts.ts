import type {
  CadenceType,
  FamilyId,
  MidiMode,
  MidiPreset,
  SectionIntent,
  SubstyleId,
  VariationType
} from './data-model.ts';

export type ScaleMode = 'major' | 'minor';

export type ExplanationType =
  | 'why_it_works'
  | 'add_notes'
  | 'transition'
  | 'section_idea'
  | 'learn';

export interface GenerationRequest {
  seed: string;
  familyId: FamilyId;
  substyleId: SubstyleId;
  key: string;
  scaleMode: ScaleMode;
  sectionIntent: SectionIntent;
  spiceLevel: number;
  midiMode: MidiMode;
  targetChordCount?: 2 | 4;
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

export interface ExplanationItem {
  id: string;
  type: ExplanationType;
  title: string;
  body: string;
  relatedChordIndexes?: number[];
}

export interface SuggestionItem {
  id: string;
  type: VariationType;
  title: string;
  summary: string;
  previewRomanNumerals?: string[];
  appliesVariationIds: string[];
  appliesSpecialMoveIds: string[];
}

export interface GenerationResult {
  seed: string;
  packId: string;
  familyId: FamilyId;
  substyleId: SubstyleId;
  sectionIntent: SectionIntent;
  archetypeId: string;
  cadenceProfileId: string;
  harmonicRhythmProfileId: string;
  romanNumerals: string[];
  functionPath: string[];
  chordSlots: ChordSlot[];
  appliedVariationIds: string[];
  appliedSpecialMoveIds: string[];
  explanations: ExplanationItem[];
  suggestions: SuggestionItem[];
  midiPresetId: string;
}

export interface GenerationMetadata {
  mode: 'loop' | 'section';
  familyName: string;
  substyleName: string;
  archetypeName: string;
  cadenceName: string;
  cadenceType: CadenceType;
  rhythmName: string;
  rhythmDensity: string;
  sectionEnergyShape: string;
  activeSpicinessTransformIds: string[];
  selectedVariationIds: string[];
  selectedSpecialMoveIds: string[];
  selectedVariationTypes: VariationType[];
  preferredArchetypeTags: string[];
  archetypeTags: string[];
}

export interface GenerationBundle {
  request: GenerationRequest;
  result: GenerationResult;
  metadata: GenerationMetadata;
  midiPreset: MidiPreset;
}
