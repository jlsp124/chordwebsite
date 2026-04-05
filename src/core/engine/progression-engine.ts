import { loadFamilyPack } from '../../data/packs/runtime-loader.ts';
import type {
  FamilyPack,
  HarmonicRhythmProfile,
  MidiPreset,
  ProgressionArchetype,
  SpecialMove,
  SpicinessTransform,
  Substyle,
  VariationRule
} from '../types/index.ts';
import type {
  ChordSlot,
  ChordChangeRate,
  GenerationBundle,
  GenerationMetadata,
  GenerationRequest,
  GenerationResult,
  LoopBarCount
} from '../types/index.ts';
import { alignBeatsPattern, formatChordName } from './music-theory.ts';

interface PackIndexes {
  substyles: Map<string, Substyle>;
  archetypes: Map<string, ProgressionArchetype>;
  harmonicRhythmProfiles: Map<string, HarmonicRhythmProfile>;
  spicinessTransforms: Map<string, SpicinessTransform>;
  variationRules: Map<string, VariationRule>;
  specialMoves: Map<string, SpecialMove>;
  midiPresets: Map<string, MidiPreset>;
}

interface MutableSlot {
  slotIndex: number;
  romanNumeral: string;
  functionLabel: string;
  decorationTags: string[];
  slashBassDegree: string | null;
}

interface MutableBlueprint {
  slots: MutableSlot[];
}

interface GenerationSelections {
  substyle: Substyle;
  archetype: ProgressionArchetype;
  rhythmProfile: HarmonicRhythmProfile;
  rhythmPattern: number[];
  spicinessTransforms: SpicinessTransform[];
  variationRule: VariationRule | null;
  specialMove: SpecialMove | null;
  midiPreset: MidiPreset;
}

interface WeightedChoice<TValue> {
  value: TValue;
  weight: number;
}

const LOOP_SAFE_VARIATION_TYPES = new Set<VariationRule['type']>([
  'safer',
  'richer',
  'darker',
  'brighter',
  'more_open',
  'more_resolved'
]);

const LOOP_SAFE_SPECIAL_MOVES = new Set<SpecialMove['operation']>([
  'borrowed_iv_darken',
  'delay_tonic_arrival',
  'drop_simplify',
  'groove_lock',
  'last_bar_tilt',
  'trap_soul_enrich'
]);

function createIndexes(pack: FamilyPack): PackIndexes {
  return {
    substyles: new Map(pack.substyles.map((entry) => [entry.id, entry])),
    archetypes: new Map(pack.archetypes.map((entry) => [entry.id, entry])),
    harmonicRhythmProfiles: new Map(pack.harmonicRhythmProfiles.map((entry) => [entry.id, entry])),
    spicinessTransforms: new Map(pack.spicinessTransforms.map((entry) => [entry.id, entry])),
    variationRules: new Map(pack.variationRules.map((entry) => [entry.id, entry])),
    specialMoves: new Map(pack.specialMoves.map((entry) => [entry.id, entry])),
    midiPresets: new Map(pack.midiPresets.map((entry) => [entry.id, entry]))
  };
}

function randomUnit(): number {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject?.getRandomValues) {
    const values = new Uint32Array(1);
    cryptoObject.getRandomValues(values);
    return (values[0] ?? 0) / 0x100000000;
  }

  return Math.random();
}

function chooseWeighted<TValue>(entries: readonly WeightedChoice<TValue>[]): TValue {
  const totalWeight = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);

  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    throw new Error('Weighted selection failed because all weights were non-positive.');
  }

  let cursor = randomUnit() * totalWeight;

  for (const entry of entries) {
    cursor -= Math.max(0, entry.weight);

    if (cursor <= 0) {
      return entry.value;
    }
  }

  return entries[entries.length - 1]!.value;
}

function overlapCount(values: readonly string[], preferred: readonly string[]): number {
  const preferredSet = new Set(preferred);
  return values.reduce((count, value) => count + (preferredSet.has(value) ? 1 : 0), 0);
}

function hasForbiddenTag(values: readonly string[], forbiddenTags: readonly string[]): boolean {
  const forbiddenSet = new Set(forbiddenTags);
  return values.some((value) => forbiddenSet.has(value));
}

function styleScopeMatches(styleScope: readonly string[], familyId: string, substyleId: string): boolean {
  return styleScope.includes(familyId) || styleScope.includes(substyleId);
}

function targetChordCount(chordChangeRate: ChordChangeRate): 2 | 4 {
  return chordChangeRate === 'two_bars' ? 2 : 4;
}

function targetDurationPattern(chordChangeRate: ChordChangeRate): number[] {
  return chordChangeRate === 'two_bars' ? [8, 8] : [4, 4, 4, 4];
}

function tonicRoman(scaleMode: GenerationRequest['scaleMode']): string {
  return scaleMode === 'minor' ? 'i' : 'I';
}

function dominantRoman(scaleMode: GenerationRequest['scaleMode']): string {
  return scaleMode === 'minor' ? 'V' : 'V';
}

function contrastRoman(scaleMode: GenerationRequest['scaleMode']): string {
  return scaleMode === 'minor' ? 'bVI' : 'vi';
}

function getContextTags(substyle: Substyle, archetype: ProgressionArchetype): string[] {
  return Array.from(new Set([...substyle.tags, ...archetype.tags]));
}

function buildChoice<TValue>(value: TValue, weight: number): WeightedChoice<TValue> {
  return {
    value,
    weight
  };
}

function getSlot(blueprint: MutableBlueprint, index: number): MutableSlot {
  const slot = blueprint.slots[index];

  if (!slot) {
    throw new Error(`Blueprint slot ${index} does not exist.`);
  }

  return slot;
}

function setRomanNumeral(slot: MutableSlot, romanNumeral: string, functionLabel?: string): void {
  slot.romanNumeral = romanNumeral;

  if (functionLabel) {
    slot.functionLabel = functionLabel;
  }
}

function addDecoration(slot: MutableSlot, decorationTag: string): void {
  if (!slot.decorationTags.includes(decorationTag)) {
    slot.decorationTags.push(decorationTag);
  }
}

function createBlueprint(archetype: ProgressionArchetype): MutableBlueprint {
  return {
    slots: archetype.romanNumerals.map((romanNumeral, slotIndex) => ({
      slotIndex,
      romanNumeral,
      functionLabel: archetype.functionPath[slotIndex] ?? 'tonic',
      decorationTags: [],
      slashBassDegree: null
    }))
  };
}

function archetypeSupportsLoopMode(archetype: ProgressionArchetype, request: GenerationRequest): boolean {
  return (
    archetype.bars === 4 &&
    archetype.romanNumerals.length === targetChordCount(request.chordChangeRate)
  );
}

function computeArchetypeWeight(
  pack: FamilyPack,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  request: GenerationRequest
): number {
  let weight = archetype.weight + archetype.loopability * 0.9;

  weight += overlapCount(archetype.tags, substyle.mustIncludeTags) * 0.2;

  if (archetype.allowedSectionIntents.includes('full_loop')) {
    weight += 0.32;
  } else {
    weight -= 0.18;
  }

  if (request.loopBars > 4) {
    weight += archetype.loopability * 0.18;
  }

  if (pack.family.id === 'trap') {
    if (archetype.tags.includes('loop_core')) {
      weight += 0.3;
    }

    if (archetype.resolutionBias === 'open_loop' || archetype.resolutionBias === 'contrastive') {
      weight += 0.16;
    }
  }

  if (pack.family.id === 'dance') {
    if (archetype.tags.includes('groove_core')) {
      weight += 0.32;
    }

    if (archetype.romanNumerals.length === 2) {
      weight += 0.12;
    }
  }

  if (pack.family.id === 'kpop') {
    if (substyle.id === 'kpop_bright_easy' && archetype.tags.includes('bright')) {
      weight += 0.22;
    }

    if (substyle.id === 'kpop_dark_synth' && (archetype.tags.includes('dark') || archetype.tags.includes('cold'))) {
      weight += 0.24;
    }

    if (substyle.id === 'kpop_ballad_emotional' && archetype.tags.includes('emotional')) {
      weight += 0.24;
    }
  }

  if (pack.family.id === 'rnb' && archetype.tags.includes('rich_color')) {
    weight += 0.18;
  }

  if (pack.family.id === 'pop' && archetype.tags.includes('glossy')) {
    weight += 0.18;
  }

  return Math.max(0.05, weight);
}

function selectArchetype(
  pack: FamilyPack,
  indexes: PackIndexes,
  request: GenerationRequest
): { substyle: Substyle; archetype: ProgressionArchetype } {
  const substyle = indexes.substyles.get(request.substyleId);

  if (!substyle || substyle.familyId !== request.familyId) {
    throw new Error(`Substyle "${request.substyleId}" does not belong to family "${request.familyId}".`);
  }

  const substyleArchetypes = substyle.archetypeIds
    .map((id) => indexes.archetypes.get(id))
    .filter((entry): entry is ProgressionArchetype => entry !== undefined)
    .filter((entry) => archetypeSupportsLoopMode(entry, request))
    .filter((entry) => !hasForbiddenTag(entry.tags, substyle.mustAvoidTags));

  const fullLoopCandidates = substyleArchetypes.filter((entry) =>
    entry.allowedSectionIntents.includes('full_loop')
  );
  const candidates = fullLoopCandidates.length > 0 ? fullLoopCandidates : substyleArchetypes;

  if (candidates.length === 0) {
    throw new Error(
      `No 4-bar ${request.chordChangeRate === 'two_bars' ? '2-chord' : '4-chord'} loops are available for ${substyle.id}.`
    );
  }

  return {
    substyle,
    archetype: chooseWeighted(
      candidates.map((archetype) =>
        buildChoice(archetype, computeArchetypeWeight(pack, substyle, archetype, request))
      )
    )
  };
}

function selectRhythmProfile(
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  request: GenerationRequest
): { profile: HarmonicRhythmProfile; pattern: number[] } {
  const wantedPattern = targetDurationPattern(request.chordChangeRate);
  const candidates = substyle.harmonicRhythmProfileIds
    .map((id) => indexes.harmonicRhythmProfiles.get(id))
    .filter((entry): entry is HarmonicRhythmProfile => entry !== undefined)
    .map((profile) => ({
      profile,
      pattern: alignBeatsPattern(archetype.romanNumerals.length, profile.beatsPerChangePattern)
    }))
    .filter((entry) => entry.pattern.join(',') === wantedPattern.join(','));

  if (candidates.length === 0) {
    throw new Error(
      `No harmonic rhythm profile for ${substyle.id} matches ${request.chordChangeRate}.`
    );
  }

  return chooseWeighted(
    candidates.map((entry) => {
      let weight = 0.45;

      if (entry.profile.id === archetype.harmonicRhythmProfileId) {
        weight += 0.45;
      }

      if (substyle.modeBias === 'loop_first' && entry.profile.density === 'slow') {
        weight += 0.12;
      }

      if (request.chordChangeRate === 'one_bar' && entry.profile.density === 'medium') {
        weight += 0.08;
      }

      return buildChoice(entry, Math.max(0.05, weight));
    })
  );
}

function selectSpicinessTransforms(
  pack: FamilyPack,
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  request: GenerationRequest
): SpicinessTransform[] {
  const contextTags = getContextTags(substyle, archetype);
  const candidates = substyle.spicinessTransformIds
    .map((id) => indexes.spicinessTransforms.get(id))
    .filter((entry): entry is SpicinessTransform => entry !== undefined)
    .filter((entry) => entry.level <= request.spiceLevel)
    .filter((entry) => styleScopeMatches(entry.styleScope, pack.family.id, substyle.id))
    .filter((entry) => !entry.forbiddenSectionIntents.includes('full_loop'))
    .filter((entry) => !hasForbiddenTag(contextTags, entry.forbiddenTags));

  const selected: SpicinessTransform[] = [];

  for (let level = 1; level <= request.spiceLevel; level += 1) {
    const tierCandidates = candidates.filter(
      (entry) => entry.level === level && !selected.some((selectedEntry) => selectedEntry.id === entry.id)
    );

    if (tierCandidates.length === 0) {
      continue;
    }

    if (level > 1) {
      const tierChance = Math.min(0.88, 0.44 + request.spiceLevel * 0.12 - level * 0.06);

      if (randomUnit() > tierChance) {
        continue;
      }
    }

    selected.push(
      chooseWeighted(tierCandidates.map((entry) => buildChoice(entry, Math.max(0.05, entry.weight))))
    );
  }

  return selected.sort((left, right) => left.level - right.level || right.weight - left.weight);
}

function selectVariationRule(
  pack: FamilyPack,
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  request: GenerationRequest
): VariationRule | null {
  if (request.spiceLevel <= 1) {
    return null;
  }

  const contextTags = getContextTags(substyle, archetype);
  const candidates = substyle.variationRuleIds
    .map((id) => indexes.variationRules.get(id))
    .filter((entry): entry is VariationRule => entry !== undefined)
    .filter((entry) => LOOP_SAFE_VARIATION_TYPES.has(entry.type))
    .filter((entry) => entry.allowedSectionIntents.includes('full_loop'))
    .filter((entry) => styleScopeMatches(entry.styleScope, pack.family.id, substyle.id))
    .filter((entry) => !hasForbiddenTag(contextTags, entry.forbiddenTags))
    .filter((entry) =>
      entry.requiredTags.length === 0 || entry.requiredTags.every((tag) => contextTags.includes(tag))
    );

  if (candidates.length === 0) {
    return null;
  }

  const selectionChance = request.spiceLevel >= 4 ? 0.7 : request.spiceLevel >= 3 ? 0.52 : 0.3;

  if (randomUnit() > selectionChance) {
    return null;
  }

  return chooseWeighted(
    candidates.map((entry) => {
      let weight = entry.weight;

      if (request.spiceLevel >= 3 && (entry.type === 'richer' || entry.type === 'more_open')) {
        weight += 0.12;
      }

      if (pack.family.id === 'rnb' && entry.type === 'richer') {
        weight += 0.18;
      }

      if (pack.family.id === 'dance' && entry.type === 'brighter') {
        weight += 0.14;
      }

      if (pack.family.id === 'trap' && entry.type === 'darker') {
        weight += 0.14;
      }

      return buildChoice(entry, Math.max(0.05, weight));
    })
  );
}

function selectSpecialMove(
  pack: FamilyPack,
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  request: GenerationRequest
): SpecialMove | null {
  if (request.spiceLevel <= 2) {
    return null;
  }

  const contextTags = getContextTags(substyle, archetype);
  const candidates = substyle.specialMoveIds
    .map((id) => indexes.specialMoves.get(id))
    .filter((entry): entry is SpecialMove => entry !== undefined)
    .filter((entry) => LOOP_SAFE_SPECIAL_MOVES.has(entry.operation))
    .filter((entry) => entry.allowedSectionIntents.includes('full_loop'))
    .filter((entry) => styleScopeMatches(entry.styleScope, pack.family.id, substyle.id))
    .filter((entry) =>
      entry.triggerTags.length === 0 || entry.triggerTags.some((tag) => contextTags.includes(tag))
    );

  if (candidates.length === 0) {
    return null;
  }

  const selectionChance = request.spiceLevel >= 4 ? 0.44 : 0.24;

  if (randomUnit() > selectionChance) {
    return null;
  }

  return chooseWeighted(
    candidates.map((entry) => {
      let weight = entry.weight;

      if (pack.family.id === 'dance' && entry.operation === 'groove_lock') {
        weight += 0.16;
      }

      if (pack.family.id === 'trap' && (entry.operation === 'groove_lock' || entry.operation === 'last_bar_tilt')) {
        weight += 0.14;
      }

      if (pack.family.id === 'rnb' && entry.operation === 'trap_soul_enrich') {
        weight += 0.16;
      }

      return buildChoice(entry, Math.max(0.05, weight));
    })
  );
}

function selectMidiPreset(
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype
): MidiPreset {
  const contextTags = getContextTags(substyle, archetype);
  const candidates = substyle.midiPresetIds
    .map((id) => indexes.midiPresets.get(id))
    .filter((entry): entry is MidiPreset => entry !== undefined);

  if (candidates.length === 0) {
    throw new Error(`No MIDI presets are available for ${substyle.id}.`);
  }

  return chooseWeighted(
    candidates.map((entry) => {
      let weight = entry.weight;
      weight += overlapCount(entry.styleTags, contextTags) * 0.1;
      return buildChoice(entry, Math.max(0.05, weight));
    })
  );
}

function applySpiciness(
  archetype: ProgressionArchetype,
  transforms: readonly SpicinessTransform[],
  request: GenerationRequest,
  blueprint: MutableBlueprint
): void {
  for (const transform of transforms) {
    for (const slot of blueprint.slots) {
      const slotOption = archetype.slotOptions.find((entry) => entry.slotIndex === slot.slotIndex);

      if (!slotOption) {
        continue;
      }

      if (!transform.allowedFunctions.includes(slot.functionLabel)) {
        continue;
      }

      const allowDecorations =
        request.spiceLevel > 1 || !slotOption.forbidOnLowSpice || transform.level <= 1;

      if (!allowDecorations) {
        continue;
      }

      const decoration = transform.allowedDecorations.find((entry) =>
        slotOption.allowedDecorations.includes(entry)
      );

      if (decoration) {
        addDecoration(slot, decoration);
      }

      if (
        request.spiceLevel >= 4 &&
        !slot.slashBassDegree &&
        slotOption.allowedSlashBassDegrees.length > 0 &&
        !slotOption.forbidOnLowSpice
      ) {
        slot.slashBassDegree = slotOption.allowedSlashBassDegrees[0] ?? null;
      }
    }
  }
}

function applyVariationRule(
  variationRule: VariationRule | null,
  request: GenerationRequest,
  blueprint: MutableBlueprint
): void {
  if (!variationRule) {
    return;
  }

  const firstSlot = getSlot(blueprint, 0);
  const lastSlot = getSlot(blueprint, blueprint.slots.length - 1);

  switch (variationRule.type) {
    case 'safer':
      for (const slot of blueprint.slots) {
        slot.decorationTags = slot.decorationTags.slice(0, 1);

        if (slot.slotIndex !== blueprint.slots.length - 1) {
          slot.slashBassDegree = null;
        }
      }
      break;
    case 'richer':
      for (const slot of blueprint.slots) {
        if (slot.functionLabel === 'tonic' || slot.functionLabel === 'tonic_family') {
          addDecoration(slot, slot.romanNumeral === slot.romanNumeral.toLowerCase() ? '9' : 'add9');
        } else if (slot.functionLabel === 'dominant') {
          addDecoration(slot, '7');
        }
      }
      break;
    case 'darker':
      for (const slot of blueprint.slots) {
        if (slot.functionLabel === 'predominant' && slot.romanNumeral === 'IV') {
          setRomanNumeral(slot, 'iv', 'predominant');
          break;
        }
      }
      break;
    case 'brighter':
      addDecoration(firstSlot, 'add9');
      if (lastSlot.functionLabel === 'predominant') {
        addDecoration(lastSlot, '6');
      }
      break;
    case 'more_open':
      if (lastSlot.functionLabel === 'tonic') {
        setRomanNumeral(lastSlot, dominantRoman(request.scaleMode), 'dominant');
      }
      addDecoration(lastSlot, 'sus4');
      break;
    case 'more_resolved':
      setRomanNumeral(lastSlot, tonicRoman(request.scaleMode), 'tonic');
      addDecoration(lastSlot, request.scaleMode === 'minor' ? '9' : 'add9');
      break;
  }
}

function applySpecialMove(
  specialMove: SpecialMove | null,
  request: GenerationRequest,
  blueprint: MutableBlueprint
): void {
  if (!specialMove) {
    return;
  }

  const lastSlot = getSlot(blueprint, blueprint.slots.length - 1);

  switch (specialMove.operation) {
    case 'borrowed_iv_darken':
      for (const slot of blueprint.slots) {
        if (slot.functionLabel === 'predominant' && slot.romanNumeral === 'IV') {
          setRomanNumeral(slot, 'iv', 'predominant');
          return;
        }
      }
      break;
    case 'delay_tonic_arrival':
      if (lastSlot.functionLabel === 'tonic') {
        setRomanNumeral(lastSlot, dominantRoman(request.scaleMode), 'dominant');
      }
      addDecoration(lastSlot, 'sus4');
      break;
    case 'drop_simplify':
    case 'groove_lock':
      for (const slot of blueprint.slots) {
        slot.decorationTags = slot.decorationTags.slice(0, slot.slotIndex === 0 ? 1 : 0);
        slot.slashBassDegree = null;
      }
      break;
    case 'last_bar_tilt':
      addDecoration(lastSlot, 'sus2');
      if (!lastSlot.slashBassDegree) {
        lastSlot.slashBassDegree = '7';
      }
      break;
    case 'trap_soul_enrich':
      for (const slot of blueprint.slots) {
        if (slot.functionLabel === 'tonic' || slot.functionLabel === 'tonic_family') {
          addDecoration(slot, slot.romanNumeral === slot.romanNumeral.toLowerCase() ? '9' : 'add9');
        }
      }
      break;
  }
}

function buildBaseChordSlots(
  request: GenerationRequest,
  blueprint: MutableBlueprint,
  durationPattern: readonly number[]
): ChordSlot[] {
  return blueprint.slots.map((slot, index) => ({
    index,
    romanNumeral: slot.romanNumeral,
    functionLabel: slot.functionLabel,
    chordName: formatChordName(
      request.key,
      request.scaleMode,
      slot.romanNumeral,
      slot.decorationTags,
      slot.slashBassDegree
    ),
    durationBeats: durationPattern[index] ?? 4,
    decorationTags: slot.decorationTags,
    slashBassDegree: slot.slashBassDegree
  }));
}

function repeatLoopSlots(baseSlots: readonly ChordSlot[], loopBars: LoopBarCount): ChordSlot[] {
  const repetitions = loopBars / 4;
  const slots: ChordSlot[] = [];

  for (let repetition = 0; repetition < repetitions; repetition += 1) {
    for (const slot of baseSlots) {
      slots.push({
        ...slot,
        index: slots.length
      });
    }
  }

  return slots;
}

function createMetadata(
  pack: FamilyPack,
  selections: GenerationSelections,
  request: GenerationRequest,
  chordSlots: readonly ChordSlot[]
): GenerationMetadata {
  const colorSummary = Array.from(
    new Set(chordSlots.flatMap((slot) => slot.decorationTags))
  );

  return {
    familyName: pack.family.name,
    substyleName: selections.substyle.name,
    loopName: selections.archetype.name,
    rhythmName: selections.rhythmProfile.name,
    rhythmDensity: selections.rhythmProfile.density,
    baseLoopBars: 4,
    renderedBars: request.loopBars,
    loopTags: [...selections.archetype.tags],
    colorSummary,
    activeSpicinessTransformIds: selections.spicinessTransforms.map((entry) => entry.id),
    selectedVariationIds: selections.variationRule ? [selections.variationRule.id] : [],
    selectedSpecialMoveIds: selections.specialMove ? [selections.specialMove.id] : []
  };
}

function selectGeneration(
  pack: FamilyPack,
  indexes: PackIndexes,
  request: GenerationRequest
): GenerationSelections {
  const { substyle, archetype } = selectArchetype(pack, indexes, request);
  const { profile: rhythmProfile, pattern: rhythmPattern } = selectRhythmProfile(
    indexes,
    substyle,
    archetype,
    request
  );
  const spicinessTransforms = selectSpicinessTransforms(pack, indexes, substyle, archetype, request);
  const variationRule = selectVariationRule(pack, indexes, substyle, archetype, request);
  const specialMove = selectSpecialMove(pack, indexes, substyle, archetype, request);
  const midiPreset = selectMidiPreset(indexes, substyle, archetype);

  return {
    substyle,
    archetype,
    rhythmProfile,
    rhythmPattern,
    spicinessTransforms,
    variationRule,
    specialMove,
    midiPreset
  };
}

export function generateProgressionFromPack(
  pack: FamilyPack,
  request: GenerationRequest
): GenerationBundle {
  const indexes = createIndexes(pack);
  const selections = selectGeneration(pack, indexes, request);
  const blueprint = createBlueprint(selections.archetype);

  applySpiciness(selections.archetype, selections.spicinessTransforms, request, blueprint);
  applyVariationRule(selections.variationRule, request, blueprint);
  applySpecialMove(selections.specialMove, request, blueprint);

  const baseSlots = buildBaseChordSlots(request, blueprint, selections.rhythmPattern);
  const chordSlots = repeatLoopSlots(baseSlots, request.loopBars);
  const metadata = createMetadata(pack, selections, request, chordSlots);

  const result: GenerationResult = {
    packId: pack.packId,
    familyId: pack.family.id,
    substyleId: selections.substyle.id,
    loopArchetypeId: selections.archetype.id,
    harmonicRhythmProfileId: selections.rhythmProfile.id,
    totalBars: request.loopBars,
    chordChangeRate: request.chordChangeRate,
    romanNumerals: chordSlots.map((slot) => slot.romanNumeral),
    functionPath: chordSlots.map((slot) => slot.functionLabel),
    chordSlots,
    appliedSpicinessTransformIds: selections.spicinessTransforms.map((entry) => entry.id),
    appliedVariationIds: selections.variationRule ? [selections.variationRule.id] : [],
    appliedSpecialMoveIds: selections.specialMove ? [selections.specialMove.id] : [],
    midiPresetId: selections.midiPreset.id
  };

  return {
    request,
    result,
    metadata,
    midiPreset: selections.midiPreset
  };
}

export async function generateProgression(request: GenerationRequest): Promise<GenerationBundle> {
  const pack = await loadFamilyPack(request.familyId);
  return generateProgressionFromPack(pack, request);
}
