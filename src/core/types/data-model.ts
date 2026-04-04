export const MODE_BIASES = ['loop_first', 'section_first'] as const;
export const SECTION_INTENTS = [
  'full_loop',
  'verse',
  'pre_chorus',
  'chorus',
  'bridge'
] as const;
export const MIDI_MODES = ['block', 'comp', 'arp'] as const;
export const CADENCE_TYPES = [
  'open_loop',
  'soft_resolve',
  'strong_resolve',
  'lift_without_arrival',
  'contrastive'
] as const;
export const VARIATION_TYPES = [
  'safer',
  'richer',
  'darker',
  'brighter',
  'more_open',
  'more_resolved',
  'pre_chorus_lift',
  'chorus_payoff',
  'bridge_contrast'
] as const;
export const SPECIAL_MOVE_OPERATIONS = [
  'delay_tonic_arrival',
  'borrowed_iv_darken',
  'bass_climb_lead_in',
  'dominant_pressure',
  'drop_simplify',
  'chorus_payoff_widen',
  'bridge_reframe',
  'groove_lock',
  'trap_soul_enrich',
  'last_bar_tilt'
] as const;
export const HARMONIC_RHYTHM_DENSITIES = ['slow', 'medium', 'active', 'variable'] as const;

export type ModeBias = (typeof MODE_BIASES)[number];
export type SectionIntent = (typeof SECTION_INTENTS)[number];
export type MidiMode = (typeof MIDI_MODES)[number];
export type CadenceType = (typeof CADENCE_TYPES)[number];
export type VariationType = (typeof VARIATION_TYPES)[number];
export type SpecialMoveOp = (typeof SPECIAL_MOVE_OPERATIONS)[number];
export type HarmonicRhythmDensity = (typeof HARMONIC_RHYTHM_DENSITIES)[number];

export type FamilyId = string;
export type SubstyleId = string;
export type EntityId = string;

export interface PackManifestEntry {
  packId: string;
  familyId: FamilyId;
  familyName: string;
  path: string;
  version: string;
  substyleIds: SubstyleId[];
  tags?: string[];
}

export interface PackManifest {
  manifestVersion: string;
  packs: PackManifestEntry[];
}

export interface Family {
  id: FamilyId;
  name: string;
  description: string;
  tags: string[];
  defaultModeBias: ModeBias;
  substyleIds: SubstyleId[];
}

export interface Substyle {
  id: SubstyleId;
  familyId: FamilyId;
  name: string;
  description: string;
  tags: string[];
  modeBias: ModeBias;
  defaultSectionIntents: SectionIntent[];
  archetypeIds: EntityId[];
  cadenceProfileIds: EntityId[];
  harmonicRhythmProfileIds: EntityId[];
  sectionBehaviorId: EntityId;
  spicinessTransformIds: EntityId[];
  variationRuleIds: EntityId[];
  specialMoveIds: EntityId[];
  explanationTemplateIds: EntityId[];
  midiPresetIds: EntityId[];
  mustIncludeTags: string[];
  mustAvoidTags: string[];
}

export interface ArchetypeSlotOption {
  slotIndex: number;
  allowedDecorations: string[];
  allowedSlashBassDegrees: string[];
  forbidOnLowSpice: boolean;
}

export interface ProgressionArchetype {
  id: EntityId;
  substyleId: SubstyleId;
  name: string;
  romanNumerals: string[];
  functionPath: string[];
  bars: number;
  harmonicRhythmProfileId: EntityId;
  allowedSectionIntents: SectionIntent[];
  resolutionBias: CadenceType;
  loopability: number;
  tensionCurve: string[];
  tags: string[];
  weight: number;
  slotOptions: ArchetypeSlotOption[];
}

export type Archetype = ProgressionArchetype;

export interface CadenceProfile {
  id: EntityId;
  name: string;
  type: CadenceType;
  allowedEndFunctions: string[];
  strength: number;
  commonUseCases: SectionIntent[];
  weight: number;
}

export interface HarmonicRhythmProfile {
  id: EntityId;
  name: string;
  density: HarmonicRhythmDensity;
  beatsPerChangePattern: number[];
  commonUseCases: SectionIntent[];
}

export interface SectionRuleBlock {
  preferredCadenceTypes: CadenceType[];
  preferredRhythmDensities: HarmonicRhythmDensity[];
  preferredArchetypeTags: string[];
  allowedVariationTypes: VariationType[];
  allowedSpecialMoveIds: EntityId[];
  forbiddenTags: string[];
  energyShape: string;
}

export interface SectionBehavior {
  id: EntityId;
  substyleId: SubstyleId;
  fullLoopRules: SectionRuleBlock;
  verseRules: SectionRuleBlock;
  preChorusRules: SectionRuleBlock;
  chorusRules: SectionRuleBlock;
  bridgeRules: SectionRuleBlock;
}

export interface SpicinessTransform {
  id: EntityId;
  name: string;
  level: number;
  styleScope: Array<FamilyId | SubstyleId>;
  allowedDecorations: string[];
  allowedFunctions: string[];
  forbiddenSectionIntents: SectionIntent[];
  forbiddenTags: string[];
  weight: number;
}

export interface VariationRule {
  id: EntityId;
  name: string;
  type: VariationType;
  styleScope: Array<FamilyId | SubstyleId>;
  allowedSectionIntents: SectionIntent[];
  preserve: string[];
  targets: string[];
  requiredTags: string[];
  forbiddenTags: string[];
  weight: number;
}

export interface SpecialMove {
  id: EntityId;
  name: string;
  category: string;
  styleScope: Array<FamilyId | SubstyleId>;
  allowedSectionIntents: SectionIntent[];
  triggerTags: string[];
  operation: SpecialMoveOp;
  weight: number;
}

export interface ExplanationTemplate {
  id: EntityId;
  templateType: string;
  styleScope: Array<FamilyId | SubstyleId>;
  sectionIntentScope: SectionIntent[];
  tone: string;
  content: string;
  requiredPlaceholders: string[];
}

export interface MidiPreset {
  id: EntityId;
  name: string;
  mode: MidiMode;
  styleTags: string[];
  voicingStyle: string;
  registerRange: [number, number];
  rhythmPattern: string;
  velocityProfile: string;
  sustainBehavior: string;
  weight: number;
}

export interface FamilyPack {
  packVersion: string;
  packId: string;
  family: Family;
  substyles: Substyle[];
  archetypes: ProgressionArchetype[];
  cadenceProfiles: CadenceProfile[];
  harmonicRhythmProfiles: HarmonicRhythmProfile[];
  sectionBehaviors: SectionBehavior[];
  spicinessTransforms: SpicinessTransform[];
  variationRules: VariationRule[];
  specialMoves: SpecialMove[];
  explanationTemplates: ExplanationTemplate[];
  midiPresets: MidiPreset[];
}
