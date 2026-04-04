import { loadFamilyPack } from '../../data/packs/runtime-loader.ts';
import type {
  CadenceProfile,
  FamilyPack,
  HarmonicRhythmProfile,
  MidiPreset,
  ProgressionArchetype,
  SectionBehavior,
  SectionIntent,
  SectionRuleBlock,
  SpecialMove,
  SpicinessTransform,
  Substyle,
  VariationRule
} from '../types/index.ts';
import type {
  ChordSlot,
  ExplanationItem,
  GenerationBundle,
  GenerationMetadata,
  GenerationRequest,
  GenerationResult,
  SuggestionItem
} from '../types/index.ts';
import { alignBeatsPattern, formatChordName } from './music-theory.ts';
import { createSeededRng, type SeededRng, type WeightedChoice } from './seeded-rng.ts';

interface PackIndexes {
  substyles: Map<string, Substyle>;
  archetypes: Map<string, ProgressionArchetype>;
  cadenceProfiles: Map<string, CadenceProfile>;
  harmonicRhythmProfiles: Map<string, HarmonicRhythmProfile>;
  sectionBehaviors: Map<string, SectionBehavior>;
  spicinessTransforms: Map<string, SpicinessTransform>;
  variationRules: Map<string, VariationRule>;
  specialMoves: Map<string, SpecialMove>;
  midiPresets: Map<string, MidiPreset>;
}

interface MutableSlot {
  romanNumeral: string;
  functionLabel: string;
  decorationTags: string[];
  slashBassDegree: string | null;
  slotIndex: number;
}

interface MutableBlueprint {
  slots: MutableSlot[];
  cadenceProfile: CadenceProfile;
  rhythmProfile: HarmonicRhythmProfile;
}

interface GenerationSelections {
  substyle: Substyle;
  archetype: ProgressionArchetype;
  cadenceProfile: CadenceProfile;
  rhythmProfile: HarmonicRhythmProfile;
  sectionBehavior: SectionBehavior;
  sectionRules: SectionRuleBlock;
  spicinessTransforms: SpicinessTransform[];
  variationRule: VariationRule | null;
  specialMove: SpecialMove | null;
  midiPreset: MidiPreset;
}

interface ExplanationTemplateRecord {
  id: string;
  type: ExplanationItem['type'];
  content: string;
}

function createIndexes(pack: FamilyPack): PackIndexes {
  return {
    substyles: new Map(pack.substyles.map((entry) => [entry.id, entry])),
    archetypes: new Map(pack.archetypes.map((entry) => [entry.id, entry])),
    cadenceProfiles: new Map(pack.cadenceProfiles.map((entry) => [entry.id, entry])),
    harmonicRhythmProfiles: new Map(pack.harmonicRhythmProfiles.map((entry) => [entry.id, entry])),
    sectionBehaviors: new Map(pack.sectionBehaviors.map((entry) => [entry.id, entry])),
    spicinessTransforms: new Map(pack.spicinessTransforms.map((entry) => [entry.id, entry])),
    variationRules: new Map(pack.variationRules.map((entry) => [entry.id, entry])),
    specialMoves: new Map(pack.specialMoves.map((entry) => [entry.id, entry])),
    midiPresets: new Map(pack.midiPresets.map((entry) => [entry.id, entry]))
  };
}

function getSectionRuleBlock(
  sectionBehavior: SectionBehavior,
  sectionIntent: SectionIntent
): SectionRuleBlock {
  switch (sectionIntent) {
    case 'full_loop':
      return sectionBehavior.fullLoopRules;
    case 'verse':
      return sectionBehavior.verseRules;
    case 'pre_chorus':
      return sectionBehavior.preChorusRules;
    case 'chorus':
      return sectionBehavior.chorusRules;
    case 'bridge':
      return sectionBehavior.bridgeRules;
    default:
      return sectionBehavior.fullLoopRules;
  }
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

function findSlotIndexByFunction(
  blueprint: MutableBlueprint,
  functionLabels: readonly string[],
  preferLast = false
): number | null {
  const indexes = blueprint.slots
    .map((slot, index) => ({ index, slot }))
    .filter(({ slot }) => functionLabels.includes(slot.functionLabel))
    .map(({ index }) => index);

  if (indexes.length === 0) {
    return null;
  }

  return preferLast ? (indexes[indexes.length - 1] ?? null) : (indexes[0] ?? null);
}

function findLastNonInitialTonicSlot(blueprint: MutableBlueprint): number | null {
  for (let index = blueprint.slots.length - 1; index >= 1; index -= 1) {
    if (getSlot(blueprint, index).functionLabel === 'tonic') {
      return index;
    }
  }

  return null;
}

function tonicRoman(request: GenerationRequest): string {
  return request.scaleMode === 'minor' ? 'i' : 'I';
}

function dominantRoman(request: GenerationRequest): string {
  return request.scaleMode === 'minor' ? 'V' : 'V';
}

function contrastRoman(request: GenerationRequest): string {
  return request.scaleMode === 'minor' ? 'bVI' : 'vi';
}

function createBlueprint(
  archetype: ProgressionArchetype,
  cadenceProfile: CadenceProfile,
  rhythmProfile: HarmonicRhythmProfile
): MutableBlueprint {
  return {
    cadenceProfile,
    rhythmProfile,
    slots: archetype.romanNumerals.map((romanNumeral, slotIndex) => ({
      romanNumeral,
      functionLabel: archetype.functionPath[slotIndex] ?? 'tonic',
      decorationTags: [],
      slashBassDegree: null,
      slotIndex
    }))
  };
}

function cloneBlueprint(blueprint: MutableBlueprint): MutableBlueprint {
  return {
    cadenceProfile: blueprint.cadenceProfile,
    rhythmProfile: blueprint.rhythmProfile,
    slots: blueprint.slots.map((slot) => ({
      romanNumeral: slot.romanNumeral,
      functionLabel: slot.functionLabel,
      decorationTags: [...slot.decorationTags],
      slashBassDegree: slot.slashBassDegree,
      slotIndex: slot.slotIndex
    }))
  };
}

function getContextTags(substyle: Substyle, archetype: ProgressionArchetype): string[] {
  return Array.from(new Set([...substyle.tags, ...archetype.tags]));
}

function chooseWeighted<TValue>(
  rng: SeededRng,
  entries: readonly WeightedChoice<TValue>[]
): TValue {
  return rng.chooseWeighted(entries);
}

function selectArchetype(
  pack: FamilyPack,
  indexes: PackIndexes,
  substyle: Substyle,
  sectionRules: SectionRuleBlock,
  request: GenerationRequest,
  rng: SeededRng
): ProgressionArchetype {
  const archetypes = substyle.archetypeIds
    .map((id) => indexes.archetypes.get(id))
    .filter((entry): entry is ProgressionArchetype => entry !== undefined)
    .filter((entry) => entry.allowedSectionIntents.includes(request.sectionIntent))
    .filter((entry) => !hasForbiddenTag(entry.tags, substyle.mustAvoidTags))
    .filter((entry) => !hasForbiddenTag(entry.tags, sectionRules.forbiddenTags));

  if (archetypes.length === 0) {
    throw new Error(`No archetypes available for ${substyle.id} and ${request.sectionIntent}.`);
  }

  const choices = archetypes.map((archetype) => {
    let weight = archetype.weight;
    weight += overlapCount(archetype.tags, substyle.mustIncludeTags) * 0.25;
    weight += overlapCount(archetype.tags, sectionRules.preferredArchetypeTags) * 0.22;

    if (substyle.modeBias === 'loop_first') {
      weight += archetype.loopability * 0.6;
    } else {
      weight += archetype.loopability * (request.sectionIntent === 'full_loop' ? 0.4 : 0.12);
    }

    if (request.sectionIntent === 'chorus' && archetype.tags.includes('hands_up')) {
      weight += 0.18;
    }

    if (request.sectionIntent === 'bridge' && archetype.tags.includes('bridge')) {
      weight += 0.2;
    }

    if (pack.family.id === 'dance' && archetype.tags.includes('groove_core')) {
      weight += 0.22;
    }

    if (pack.family.id === 'trap' && request.sectionIntent === 'full_loop') {
      weight += archetype.loopability * 0.3;
    }

    return buildChoice(archetype, Math.max(0.05, weight));
  });

  return chooseWeighted(rng, choices);
}

function selectCadenceProfile(
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  sectionRules: SectionRuleBlock,
  request: GenerationRequest,
  rng: SeededRng
): CadenceProfile {
  const endFunction =
    archetype.functionPath[archetype.functionPath.length - 1] ??
    archetype.functionPath[0] ??
    'tonic';
  const candidates = substyle.cadenceProfileIds
    .map((id) => indexes.cadenceProfiles.get(id))
    .filter((entry): entry is CadenceProfile => entry !== undefined);

  const weightedCandidates = candidates
    .map((profile) => {
      let weight = profile.weight;

      if (profile.type === archetype.resolutionBias) {
        weight += 0.35;
      }

      if (profile.commonUseCases.includes(request.sectionIntent)) {
        weight += 0.25;
      }

      if (sectionRules.preferredCadenceTypes.includes(profile.type)) {
        weight += 0.28;
      }

      if (profile.allowedEndFunctions.includes(endFunction)) {
        weight += 0.22;
      } else {
        weight -= 0.16;
      }

      return buildChoice(profile, Math.max(0.05, weight));
    })
    .filter((choice) => choice.weight > 0);

  if (weightedCandidates.length === 0) {
    throw new Error(`No cadence profiles available for ${substyle.id}.`);
  }

  return chooseWeighted(rng, weightedCandidates);
}

function selectHarmonicRhythmProfile(
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  sectionRules: SectionRuleBlock,
  request: GenerationRequest,
  rng: SeededRng
): HarmonicRhythmProfile {
  const defaultProfile = indexes.harmonicRhythmProfiles.get(archetype.harmonicRhythmProfileId);
  const candidates = substyle.harmonicRhythmProfileIds
    .map((id) => indexes.harmonicRhythmProfiles.get(id))
    .filter((entry): entry is HarmonicRhythmProfile => entry !== undefined);

  const choices = candidates.map((profile) => {
    let weight = 0.4;

    if (profile.id === defaultProfile?.id) {
      weight += 0.4;
    }

    if (profile.commonUseCases.includes(request.sectionIntent)) {
      weight += 0.2;
    }

    if (sectionRules.preferredRhythmDensities.includes(profile.density)) {
      weight += 0.24;
    }

    if (substyle.modeBias === 'loop_first' && profile.density === 'slow') {
      weight += 0.12;
    }

    if (request.sectionIntent === 'pre_chorus' && profile.density === 'active') {
      weight += 0.14;
    }

    return buildChoice(profile, Math.max(0.05, weight));
  });

  return chooseWeighted(rng, choices);
}

function selectSpicinessTransforms(
  pack: FamilyPack,
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  request: GenerationRequest,
  rng: SeededRng
): SpicinessTransform[] {
  const contextTags = getContextTags(substyle, archetype);
  const candidates = substyle.spicinessTransformIds
    .map((id) => indexes.spicinessTransforms.get(id))
    .filter((entry): entry is SpicinessTransform => entry !== undefined)
    .filter((entry) => entry.level <= request.spiceLevel)
    .filter((entry) => styleScopeMatches(entry.styleScope, pack.family.id, substyle.id))
    .filter((entry) => !entry.forbiddenSectionIntents.includes(request.sectionIntent))
    .filter((entry) => !hasForbiddenTag(contextTags, entry.forbiddenTags));

  return candidates
    .filter((entry) => {
      const threshold = Math.min(0.92, 0.42 + request.spiceLevel * 0.12 + entry.weight * 0.08);
      return rng.fork(entry.id).next() <= threshold;
    })
    .sort((left, right) => left.level - right.level || right.weight - left.weight);
}

function selectVariationRule(
  pack: FamilyPack,
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  sectionRules: SectionRuleBlock,
  request: GenerationRequest,
  rng: SeededRng
): VariationRule | null {
  const contextTags = getContextTags(substyle, archetype);
  const candidates = substyle.variationRuleIds
    .map((id) => indexes.variationRules.get(id))
    .filter((entry): entry is VariationRule => entry !== undefined)
    .filter((entry) => styleScopeMatches(entry.styleScope, pack.family.id, substyle.id))
    .filter((entry) => entry.allowedSectionIntents.includes(request.sectionIntent))
    .filter((entry) => sectionRules.allowedVariationTypes.includes(entry.type))
    .filter((entry) => !hasForbiddenTag(contextTags, entry.forbiddenTags))
    .filter((entry) =>
      entry.requiredTags.length === 0 || entry.requiredTags.every((tag) => contextTags.includes(tag))
    );

  const nullWeight = Math.max(0.18, 0.74 - request.spiceLevel * 0.12);
  const choices: WeightedChoice<VariationRule | null>[] = [buildChoice(null, nullWeight)];

  for (const entry of candidates) {
    let weight = entry.weight;
    weight += overlapCount(entry.targets, sectionRules.preferredArchetypeTags) * 0.04;

    if (pack.family.id === 'kpop' && request.sectionIntent !== 'full_loop') {
      weight += 0.08;
    }

    if (pack.family.id === 'trap' && entry.type === 'chorus_payoff') {
      weight -= 0.16;
    }

    if (pack.family.id === 'dance' && entry.type === 'richer') {
      weight -= 0.1;
    }

    choices.push(buildChoice(entry, Math.max(0.05, weight)));
  }

  return chooseWeighted(rng, choices);
}

function selectSpecialMove(
  pack: FamilyPack,
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  sectionRules: SectionRuleBlock,
  request: GenerationRequest,
  rng: SeededRng
): SpecialMove | null {
  const contextTags = getContextTags(substyle, archetype);
  const allowedMoveIds = new Set(sectionRules.allowedSpecialMoveIds);
  const candidates = substyle.specialMoveIds
    .map((id) => indexes.specialMoves.get(id))
    .filter((entry): entry is SpecialMove => entry !== undefined)
    .filter((entry) => styleScopeMatches(entry.styleScope, pack.family.id, substyle.id))
    .filter((entry) => entry.allowedSectionIntents.includes(request.sectionIntent))
    .filter((entry) => allowedMoveIds.size === 0 || allowedMoveIds.has(entry.id))
    .filter(
      (entry) =>
        entry.triggerTags.length === 0 || entry.triggerTags.some((tag) => contextTags.includes(tag))
    );

  const choices: WeightedChoice<SpecialMove | null>[] = [
    buildChoice(null, request.sectionIntent === 'full_loop' ? 0.52 : 0.34)
  ];

  for (const entry of candidates) {
    let weight = entry.weight;

    if (pack.family.id === 'kpop' && request.sectionIntent !== 'full_loop') {
      weight += 0.12;
    }

    if (pack.family.id === 'dance' && entry.operation === 'groove_lock') {
      weight += 0.1;
    }

    choices.push(buildChoice(entry, Math.max(0.05, weight)));
  }

  return chooseWeighted(rng, choices);
}

function selectMidiPreset(
  indexes: PackIndexes,
  substyle: Substyle,
  archetype: ProgressionArchetype,
  request: GenerationRequest,
  rng: SeededRng
): MidiPreset {
  const contextTags = getContextTags(substyle, archetype);
  const candidates = substyle.midiPresetIds
    .map((id) => indexes.midiPresets.get(id))
    .filter((entry): entry is MidiPreset => entry !== undefined);

  const choices = candidates.map((entry) => {
    let weight = entry.weight;

    if (entry.mode === request.midiMode) {
      weight += 0.35;
    }

    weight += overlapCount(entry.styleTags, contextTags) * 0.08;
    return buildChoice(entry, Math.max(0.05, weight));
  });

  return chooseWeighted(rng, choices);
}

function addDecoration(slot: MutableSlot, decorationTag: string): void {
  if (!slot.decorationTags.includes(decorationTag)) {
    slot.decorationTags.push(decorationTag);
  }
}

function applySpiciness(
  archetype: ProgressionArchetype,
  spicinessTransforms: readonly SpicinessTransform[],
  request: GenerationRequest,
  blueprint: MutableBlueprint
): void {
  for (const transform of spicinessTransforms) {
    for (const slot of blueprint.slots) {
      const slotOption = archetype.slotOptions.find((option) => option.slotIndex === slot.slotIndex);

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

      if (!slot.slashBassDegree && request.spiceLevel >= 3 && slotOption.allowedSlashBassDegrees.length > 0) {
        slot.slashBassDegree = slotOption.allowedSlashBassDegrees[0] ?? null;
      }
    }
  }
}

function setRomanNumeral(slot: MutableSlot, romanNumeral: string, functionLabel?: string): void {
  slot.romanNumeral = romanNumeral;

  if (functionLabel) {
    slot.functionLabel = functionLabel;
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

  const lastSlot = getSlot(blueprint, blueprint.slots.length - 1);
  const firstSlot = getSlot(blueprint, 0);

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
    case 'darker': {
      const contrastIndex =
        findSlotIndexByFunction(blueprint, ['predominant', 'contrast'], true) ??
        findSlotIndexByFunction(blueprint, ['tonic_family'], true);

      if (contrastIndex !== null) {
        const targetSlot = getSlot(blueprint, contrastIndex);
        if (targetSlot.romanNumeral === 'IV') {
          setRomanNumeral(targetSlot, 'iv', 'predominant');
        } else {
          addDecoration(targetSlot, 'min7');
        }
      }
      break;
    }
    case 'brighter':
      for (const slot of blueprint.slots) {
        if (slot.functionLabel === 'tonic') {
          addDecoration(slot, 'add9');
        }
        if (slot.functionLabel === 'predominant') {
          addDecoration(slot, '6');
        }
      }
      break;
    case 'more_open':
      if (lastSlot.functionLabel === 'tonic') {
        setRomanNumeral(lastSlot, dominantRoman(request), 'dominant');
        addDecoration(lastSlot, 'sus4');
      } else {
        addDecoration(lastSlot, 'sus2');
      }
      break;
    case 'more_resolved':
      setRomanNumeral(lastSlot, tonicRoman(request), 'tonic');
      addDecoration(lastSlot, request.scaleMode === 'minor' ? '9' : 'add9');
      break;
    case 'pre_chorus_lift':
      addDecoration(lastSlot, 'sus4');
      if (!lastSlot.slashBassDegree) {
        lastSlot.slashBassDegree = '7';
      }
      if (lastSlot.functionLabel !== 'dominant') {
        setRomanNumeral(lastSlot, dominantRoman(request), 'dominant');
      }
      break;
    case 'chorus_payoff':
      setRomanNumeral(lastSlot, tonicRoman(request), 'tonic');
      addDecoration(lastSlot, request.scaleMode === 'minor' ? '9' : 'maj7');
      if (firstSlot.functionLabel === 'tonic_family') {
        firstSlot.functionLabel = 'tonic';
      }
      break;
    case 'bridge_contrast': {
      const contrastIndex =
        findSlotIndexByFunction(blueprint, ['contrast', 'predominant'], false) ??
        Math.min(1, blueprint.slots.length - 1);
      const target = getSlot(blueprint, contrastIndex);
      setRomanNumeral(target, contrastRoman(request), 'contrast');
      addDecoration(target, request.scaleMode === 'minor' ? 'maj7' : 'min7');
      break;
    }
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
  const secondLastSlot = getSlot(blueprint, Math.max(blueprint.slots.length - 2, 0));

  switch (specialMove.operation) {
    case 'delay_tonic_arrival': {
      const tonicIndex = findLastNonInitialTonicSlot(blueprint);
      if (tonicIndex !== null) {
        const slot = getSlot(blueprint, tonicIndex);
        setRomanNumeral(slot, dominantRoman(request), 'dominant');
        addDecoration(slot, 'sus4');
      }
      break;
    }
    case 'borrowed_iv_darken': {
      const targetIndex =
        findSlotIndexByFunction(blueprint, ['predominant'], true) ??
        findSlotIndexByFunction(blueprint, ['contrast'], true);
      if (targetIndex !== null) {
        setRomanNumeral(getSlot(blueprint, targetIndex), 'iv', 'predominant');
      }
      break;
    }
    case 'bass_climb_lead_in':
      if (!secondLastSlot.slashBassDegree) {
        secondLastSlot.slashBassDegree = '6';
      }
      if (!lastSlot.slashBassDegree) {
        lastSlot.slashBassDegree = '7';
      }
      break;
    case 'dominant_pressure':
      setRomanNumeral(lastSlot, dominantRoman(request), 'dominant');
      addDecoration(lastSlot, '7');
      break;
    case 'drop_simplify':
    case 'groove_lock':
      for (const slot of blueprint.slots) {
        slot.decorationTags = slot.decorationTags.slice(0, slot.slotIndex === 0 ? 1 : 0);
        if (specialMove.operation === 'groove_lock' || slot.slotIndex !== blueprint.slots.length - 1) {
          slot.slashBassDegree = null;
        }
      }
      break;
    case 'chorus_payoff_widen':
      setRomanNumeral(lastSlot, tonicRoman(request), 'tonic');
      addDecoration(lastSlot, request.scaleMode === 'minor' ? '11' : 'maj7');
      break;
    case 'bridge_reframe':
      setRomanNumeral(getSlot(blueprint, 0), contrastRoman(request), 'contrast');
      addDecoration(getSlot(blueprint, 0), request.scaleMode === 'minor' ? 'maj7' : 'min7');
      break;
    case 'trap_soul_enrich':
      for (const slot of blueprint.slots) {
        if (slot.functionLabel === 'tonic' || slot.functionLabel === 'tonic_family') {
          addDecoration(slot, slot.romanNumeral === slot.romanNumeral.toLowerCase() ? '9' : 'add9');
        }
      }
      if (lastSlot.functionLabel === 'dominant') {
        addDecoration(lastSlot, '11');
      }
      break;
    case 'last_bar_tilt':
      addDecoration(lastSlot, 'sus2');
      if (!lastSlot.slashBassDegree) {
        lastSlot.slashBassDegree = '7';
      }
      break;
  }
}

function buildChordSlots(
  request: GenerationRequest,
  blueprint: MutableBlueprint
): ChordSlot[] {
  const durations = alignBeatsPattern(blueprint.slots.length, blueprint.rhythmProfile.beatsPerChangePattern);

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
    durationBeats: durations[index] ?? 4,
    decorationTags: slot.decorationTags,
    slashBassDegree: slot.slashBassDegree
  }));
}

function fillTemplate(content: string, values: Record<string, string>): string {
  return content.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => values[key] ?? `{${key}}`);
}

function formatTokenLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

function collectExplanationTemplates(
  pack: FamilyPack,
  substyle: Substyle,
  request: GenerationRequest
): ExplanationTemplateRecord[] {
  return pack.explanationTemplates
    .filter((entry) => substyle.explanationTemplateIds.includes(entry.id))
    .filter(
      (entry) =>
        styleScopeMatches(entry.styleScope, pack.family.id, substyle.id) &&
        entry.sectionIntentScope.includes(request.sectionIntent)
    )
    .map((entry) => ({
      id: entry.id,
      type:
        entry.templateType === 'section_idea' || entry.templateType === 'learn'
          ? entry.templateType
          : 'why_it_works',
      content: entry.content
    }));
}

function buildExplanationItems(
  pack: FamilyPack,
  selections: GenerationSelections,
  request: GenerationRequest,
  chordSlots: readonly ChordSlot[]
): ExplanationItem[] {
  const templateValues = {
    sectionIntent: formatTokenLabel(request.sectionIntent),
    substyleName: selections.substyle.name,
    cadenceType: formatTokenLabel(selections.cadenceProfile.type),
    rhythmName: selections.rhythmProfile.name,
    specialMoveNames:
      selections.specialMove?.name ??
      (selections.variationRule?.name ? `${selections.variationRule.name} emphasis` : 'no extra special move')
  };

  const explanationItems = collectExplanationTemplates(pack, selections.substyle, request).map(
    (template, index) => ({
      id: `${template.id}-${index}`,
      type: template.type,
      title: template.type === 'learn'
        ? 'Learn'
        : template.type === 'section_idea'
          ? 'Section Idea'
          : 'Why It Works',
      body: fillTemplate(template.content, templateValues),
      relatedChordIndexes: template.type === 'section_idea' ? [Math.max(chordSlots.length - 1, 0)] : undefined
    })
  );

  const addNoteBody = selections.spicinessTransforms.length > 0
    ? `Color comes from ${selections.spicinessTransforms.map((entry) => entry.name).join(', ')}. Keep the root path intact and let the extensions do the styling.`
    : 'Keep the voicing clean first. This progression is relying more on shape and cadence than extra color.';
  const transitionBody = selections.specialMove
    ? `${selections.specialMove.name} nudges the last phrase without replacing the core loop. That keeps the identity stable while still creating direction.`
    : `The ${selections.cadenceProfile.name} cadence and ${selections.rhythmProfile.name} rhythm already create enough motion for this ${request.sectionIntent.replace('_', ' ')}.`;

  explanationItems.push({
    id: `add-notes-${request.seed}`,
    type: 'add_notes',
    title: 'Add Notes',
    body: addNoteBody,
    relatedChordIndexes: chordSlots
      .filter((slot) => slot.decorationTags.length > 0)
      .map((slot) => slot.index)
  });

  explanationItems.push({
    id: `transition-${request.seed}`,
    type: 'transition',
    title: 'Transition',
    body: transitionBody,
    relatedChordIndexes: chordSlots.length > 1 ? [chordSlots.length - 2, chordSlots.length - 1] : [0]
  });

  return explanationItems;
}

function buildSuggestionSummary(variationRule: VariationRule, sectionIntent: SectionIntent): string {
  const targetSummary = formatTokenLabel(variationRule.targets.slice(0, 2).join(' + '));
  return `Push ${formatTokenLabel(sectionIntent)} toward ${targetSummary} while keeping ${formatTokenLabel(variationRule.preserve[0] ?? 'the core identity')} intact.`;
}

function findCompanionMove(
  substyle: Substyle,
  indexes: PackIndexes,
  variationRule: VariationRule,
  request: GenerationRequest
): SpecialMove | null {
  const preferredOperationByVariation: Record<VariationRule['type'], string | null> = {
    safer: 'drop_simplify',
    richer: 'trap_soul_enrich',
    darker: 'borrowed_iv_darken',
    brighter: 'chorus_payoff_widen',
    more_open: 'last_bar_tilt',
    more_resolved: 'dominant_pressure',
    pre_chorus_lift: 'bass_climb_lead_in',
    chorus_payoff: 'chorus_payoff_widen',
    bridge_contrast: 'bridge_reframe'
  };
  const preferredOperation = preferredOperationByVariation[variationRule.type];

  if (!preferredOperation) {
    return null;
  }

  return (
    substyle.specialMoveIds
      .map((id) => indexes.specialMoves.get(id))
      .filter((entry): entry is SpecialMove => entry !== undefined)
      .find(
        (entry) =>
          entry.operation === preferredOperation &&
          entry.allowedSectionIntents.includes(request.sectionIntent)
      ) ?? null
  );
}

function buildSuggestions(
  pack: FamilyPack,
  indexes: PackIndexes,
  selections: GenerationSelections,
  request: GenerationRequest,
  blueprint: MutableBlueprint
): SuggestionItem[] {
  const candidates = selections.substyle.variationRuleIds
    .map((id) => indexes.variationRules.get(id))
    .filter((entry): entry is VariationRule => entry !== undefined)
    .filter((entry) => entry.allowedSectionIntents.includes(request.sectionIntent))
    .filter((entry) => entry.type !== selections.variationRule?.type)
    .filter((entry) => selections.sectionRules.allowedVariationTypes.includes(entry.type))
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 3);

  return candidates.map((variationRule, index) => {
    const previewBlueprint = cloneBlueprint(blueprint);
    const companionMove = findCompanionMove(selections.substyle, indexes, variationRule, request);
    applyVariationRule(variationRule, request, previewBlueprint);
    applySpecialMove(companionMove, request, previewBlueprint);

    return {
      id: `suggestion-${variationRule.id}-${index}`,
      type: variationRule.type,
      title: variationRule.name,
      summary: buildSuggestionSummary(variationRule, request.sectionIntent),
      previewRomanNumerals: previewBlueprint.slots.map((slot) => slot.romanNumeral),
      appliesVariationIds: [variationRule.id],
      appliesSpecialMoveIds: companionMove ? [companionMove.id] : []
    };
  });
}

function createMetadata(
  pack: FamilyPack,
  selections: GenerationSelections,
  request: GenerationRequest,
  archetype: ProgressionArchetype
): GenerationMetadata {
  return {
    mode: request.sectionIntent === 'full_loop' ? 'loop' : 'section',
    familyName: pack.family.name,
    substyleName: selections.substyle.name,
    archetypeName: archetype.name,
    cadenceName: selections.cadenceProfile.name,
    cadenceType: selections.cadenceProfile.type,
    rhythmName: selections.rhythmProfile.name,
    rhythmDensity: selections.rhythmProfile.density,
    sectionEnergyShape: selections.sectionRules.energyShape,
    activeSpicinessTransformIds: selections.spicinessTransforms.map((entry) => entry.id),
    selectedVariationIds: selections.variationRule ? [selections.variationRule.id] : [],
    selectedSpecialMoveIds: selections.specialMove ? [selections.specialMove.id] : [],
    selectedVariationTypes: selections.variationRule ? [selections.variationRule.type] : [],
    preferredArchetypeTags: [...selections.sectionRules.preferredArchetypeTags],
    archetypeTags: [...archetype.tags]
  };
}

function selectGenerationSelections(
  pack: FamilyPack,
  indexes: PackIndexes,
  request: GenerationRequest
): GenerationSelections {
  const substyle = indexes.substyles.get(request.substyleId);

  if (!substyle || substyle.familyId !== request.familyId) {
    throw new Error(`Substyle "${request.substyleId}" does not belong to family "${request.familyId}".`);
  }

  const sectionBehavior = indexes.sectionBehaviors.get(substyle.sectionBehaviorId);

  if (!sectionBehavior) {
    throw new Error(`Section behavior "${substyle.sectionBehaviorId}" was not found.`);
  }

  const sectionRules = getSectionRuleBlock(sectionBehavior, request.sectionIntent);
  const archetype = selectArchetype(
    pack,
    indexes,
    substyle,
    sectionRules,
    request,
    createSeededRng(`${request.seed}:${substyle.id}:archetype`)
  );
  const cadenceProfile = selectCadenceProfile(
    indexes,
    substyle,
    archetype,
    sectionRules,
    request,
    createSeededRng(`${request.seed}:${substyle.id}:cadence`)
  );
  const rhythmProfile = selectHarmonicRhythmProfile(
    indexes,
    substyle,
    archetype,
    sectionRules,
    request,
    createSeededRng(`${request.seed}:${substyle.id}:rhythm`)
  );
  const spicinessTransforms = selectSpicinessTransforms(
    pack,
    indexes,
    substyle,
    archetype,
    request,
    createSeededRng(`${request.seed}:${substyle.id}:spice`)
  );
  const variationRule = selectVariationRule(
    pack,
    indexes,
    substyle,
    archetype,
    sectionRules,
    request,
    createSeededRng(`${request.seed}:${substyle.id}:variation`)
  );
  const specialMove = selectSpecialMove(
    pack,
    indexes,
    substyle,
    archetype,
    sectionRules,
    request,
    createSeededRng(`${request.seed}:${substyle.id}:move`)
  );
  const midiPreset = selectMidiPreset(
    indexes,
    substyle,
    archetype,
    request,
    createSeededRng(`${request.seed}:${substyle.id}:midi`)
  );

  return {
    substyle,
    archetype,
    cadenceProfile,
    rhythmProfile,
    sectionBehavior,
    sectionRules,
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
  const selections = selectGenerationSelections(pack, indexes, request);
  const blueprint = createBlueprint(
    selections.archetype,
    selections.cadenceProfile,
    selections.rhythmProfile
  );

  applySpiciness(selections.archetype, selections.spicinessTransforms, request, blueprint);
  applyVariationRule(selections.variationRule, request, blueprint);
  applySpecialMove(selections.specialMove, request, blueprint);

  const chordSlots = buildChordSlots(request, blueprint);
  const explanations = buildExplanationItems(pack, selections, request, chordSlots);
  const suggestions = buildSuggestions(pack, indexes, selections, request, blueprint);
  const metadata = createMetadata(pack, selections, request, selections.archetype);

  const result: GenerationResult = {
    seed: request.seed,
    packId: pack.packId,
    familyId: pack.family.id,
    substyleId: selections.substyle.id,
    sectionIntent: request.sectionIntent,
    archetypeId: selections.archetype.id,
    cadenceProfileId: selections.cadenceProfile.id,
    harmonicRhythmProfileId: selections.rhythmProfile.id,
    romanNumerals: chordSlots.map((slot) => slot.romanNumeral),
    functionPath: chordSlots.map((slot) => slot.functionLabel),
    chordSlots,
    appliedVariationIds: selections.variationRule ? [selections.variationRule.id] : [],
    appliedSpecialMoveIds: selections.specialMove ? [selections.specialMove.id] : [],
    explanations,
    suggestions,
    midiPresetId: selections.midiPreset.id
  };

  return {
    request,
    result,
    metadata,
    midiPreset: selections.midiPreset
  };
}

export async function generateProgression(
  request: GenerationRequest
): Promise<GenerationBundle> {
  const pack = await loadFamilyPack(request.familyId);
  return generateProgressionFromPack(pack, request);
}
