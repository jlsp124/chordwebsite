import {
  CADENCE_TYPES,
  HARMONIC_RHYTHM_DENSITIES,
  MIDI_MODES,
  MODE_BIASES,
  SECTION_INTENTS,
  SPECIAL_MOVE_OPERATIONS,
  VARIATION_TYPES,
  type FamilyPack,
  type PackManifest
} from '../../core/types/index.ts';
import {
  collectDuplicates,
  hasUniqueValues,
  isNonEmptyString,
  isNumberArray,
  isRecord,
  isStringArray,
  type JsonRecord
} from '../../core/utils/validation.ts';

export interface ValidationIssue {
  scope: string;
  path: string;
  message: string;
}

const PACK_COLLECTION_KEYS = [
  'substyles',
  'archetypes',
  'cadenceProfiles',
  'harmonicRhythmProfiles',
  'sectionBehaviors',
  'spicinessTransforms',
  'variationRules',
  'specialMoves',
  'explanationTemplates',
  'midiPresets'
] as const;

const PROHIBITED_RUNTIME_KEYS = new Set([
  'artist',
  'artistName',
  'songTitle',
  'title',
  'workId',
  'annotationId',
  'trackId',
  'sourceRef',
  'sourceRefs',
  'sourceFile',
  'sourceFiles',
  'rawRows',
  'rawCorpus',
  'audioUrl',
  'midiUrl'
]);

function issue(scope: string, path: string, message: string): ValidationIssue {
  return { scope, path, message };
}

function isEnumValue<TValue extends readonly string[]>(
  value: unknown,
  allowedValues: TValue
): value is TValue[number] {
  return typeof value === 'string' && allowedValues.includes(value);
}

function validateRequiredString(
  value: unknown,
  scope: string,
  path: string,
  issues: ValidationIssue[]
): value is string {
  if (isNonEmptyString(value)) {
    return true;
  }

  issues.push(issue(scope, path, 'Expected a non-empty string.'));
  return false;
}

function validateRequiredStringArray(
  value: unknown,
  scope: string,
  path: string,
  issues: ValidationIssue[],
  allowEmpty = false,
  enforceUnique = true
): value is string[] {
  if (!isStringArray(value)) {
    issues.push(issue(scope, path, 'Expected an array of strings.'));
    return false;
  }

  if (!allowEmpty && value.length === 0) {
    issues.push(issue(scope, path, 'Expected a non-empty array.'));
    return false;
  }

  if (enforceUnique && !hasUniqueValues(value)) {
    issues.push(issue(scope, path, `Duplicate values found: ${collectDuplicates(value).join(', ')}`));
  }

  return true;
}

function validateRequiredNumber(
  value: unknown,
  scope: string,
  path: string,
  issues: ValidationIssue[],
  minimum?: number,
  maximum?: number
): value is number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    issues.push(issue(scope, path, 'Expected a number.'));
    return false;
  }

  if (minimum !== undefined && value < minimum) {
    issues.push(issue(scope, path, `Expected a number >= ${minimum}.`));
  }

  if (maximum !== undefined && value > maximum) {
    issues.push(issue(scope, path, `Expected a number <= ${maximum}.`));
  }

  return true;
}

function validateEnumArray<TValue extends readonly string[]>(
  value: unknown,
  allowedValues: TValue,
  scope: string,
  path: string,
  issues: ValidationIssue[],
  allowEmpty = false
): value is TValue[number][] {
  if (!validateRequiredStringArray(value, scope, path, issues, allowEmpty)) {
    return false;
  }

  for (const [index, entry] of value.entries()) {
    if (!isEnumValue(entry, allowedValues)) {
      issues.push(
        issue(scope, `${path}[${index}]`, `Expected one of: ${allowedValues.join(', ')}`)
      );
    }
  }

  return true;
}

function validateIdSet(
  ids: unknown,
  validIds: Set<string>,
  scope: string,
  path: string,
  issues: ValidationIssue[],
  allowEmpty = false
): ids is string[] {
  if (!validateRequiredStringArray(ids, scope, path, issues, allowEmpty)) {
    return false;
  }

  for (const entry of ids) {
    if (!validIds.has(entry)) {
      issues.push(issue(scope, path, `Unknown reference "${entry}".`));
    }
  }

  return true;
}

function validateRuleBlock(
  ruleBlock: unknown,
  scope: string,
  path: string,
  specialMoveIds: Set<string>,
  issues: ValidationIssue[]
): void {
  if (!isRecord(ruleBlock)) {
    issues.push(issue(scope, path, 'Expected a section rule object.'));
    return;
  }

  validateEnumArray(
    ruleBlock.preferredCadenceTypes,
    CADENCE_TYPES,
    scope,
    `${path}.preferredCadenceTypes`,
    issues
  );
  validateEnumArray(
    ruleBlock.preferredRhythmDensities,
    HARMONIC_RHYTHM_DENSITIES,
    scope,
    `${path}.preferredRhythmDensities`,
    issues
  );
  validateRequiredStringArray(
    ruleBlock.preferredArchetypeTags,
    scope,
    `${path}.preferredArchetypeTags`,
    issues,
    true
  );
  validateEnumArray(
    ruleBlock.allowedVariationTypes,
    VARIATION_TYPES,
    scope,
    `${path}.allowedVariationTypes`,
    issues,
    true
  );
  validateIdSet(
    ruleBlock.allowedSpecialMoveIds,
    specialMoveIds,
    scope,
    `${path}.allowedSpecialMoveIds`,
    issues,
    true
  );
  validateRequiredStringArray(
    ruleBlock.forbiddenTags,
    scope,
    `${path}.forbiddenTags`,
    issues,
    true
  );
  validateRequiredString(ruleBlock.energyShape, scope, `${path}.energyShape`, issues);
}

function validateNoRawCorpusLeak(
  value: unknown,
  scope: string,
  path: string,
  issues: ValidationIssue[]
): void {
  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      validateNoRawCorpusLeak(entry, scope, `${path}[${index}]`, issues);
    }

    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    if (PROHIBITED_RUNTIME_KEYS.has(key)) {
      issues.push(
        issue(
          scope,
          `${path}.${key}`,
          'Runtime packs must not include raw corpus identifiers or direct source metadata.'
        )
      );
    }

    validateNoRawCorpusLeak(entry, scope, `${path}.${key}`, issues);
  }
}

export function validatePackManifest(manifest: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = 'manifest';

  if (!isRecord(manifest)) {
    return [issue(scope, 'manifest', 'Manifest must be an object.')];
  }

  validateRequiredString(manifest.manifestVersion, scope, 'manifestVersion', issues);

  if (!Array.isArray(manifest.packs) || manifest.packs.length === 0) {
    issues.push(issue(scope, 'packs', 'Manifest must include at least one pack entry.'));
    return issues;
  }

  const packIds: string[] = [];
  const familyIds: string[] = [];
  const packPaths: string[] = [];

  for (const [index, entry] of manifest.packs.entries()) {
    const path = `packs[${index}]`;

    if (!isRecord(entry)) {
      issues.push(issue(scope, path, 'Manifest entry must be an object.'));
      continue;
    }

    if (validateRequiredString(entry.packId, scope, `${path}.packId`, issues)) {
      packIds.push(entry.packId);
    }

    if (validateRequiredString(entry.familyId, scope, `${path}.familyId`, issues)) {
      familyIds.push(entry.familyId);
    }

    validateRequiredString(entry.familyName, scope, `${path}.familyName`, issues);

    if (validateRequiredString(entry.path, scope, `${path}.path`, issues)) {
      packPaths.push(entry.path);

      if (entry.path.startsWith('/') || /^https?:\/\//.test(entry.path)) {
        issues.push(
          issue(scope, `${path}.path`, 'Manifest paths must be relative and GitHub Pages-safe.')
        );
      }

      if (!entry.path.startsWith('packs/')) {
        issues.push(issue(scope, `${path}.path`, 'Manifest paths must start with "packs/".'));
      }
    }

    validateRequiredString(entry.version, scope, `${path}.version`, issues);
    validateRequiredStringArray(entry.substyleIds, scope, `${path}.substyleIds`, issues);
    validateRequiredStringArray(entry.tags, scope, `${path}.tags`, issues, true);
  }

  if (!hasUniqueValues(packIds)) {
    issues.push(issue(scope, 'packs', `Duplicate packId values: ${collectDuplicates(packIds).join(', ')}`));
  }

  if (!hasUniqueValues(familyIds)) {
    issues.push(
      issue(scope, 'packs', `Duplicate familyId values: ${collectDuplicates(familyIds).join(', ')}`)
    );
  }

  if (!hasUniqueValues(packPaths)) {
    issues.push(issue(scope, 'packs', `Duplicate path values: ${collectDuplicates(packPaths).join(', ')}`));
  }

  return issues;
}

export function validateFamilyPack(pack: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = 'pack';

  if (!isRecord(pack)) {
    return [issue(scope, 'pack', 'Pack must be an object.')];
  }

  validateRequiredString(pack.packVersion, scope, 'packVersion', issues);
  validateRequiredString(pack.packId, scope, 'packId', issues);

  if (!isRecord(pack.family)) {
    issues.push(issue(scope, 'family', 'Pack family must be an object.'));
    return issues;
  }

  validateRequiredString(pack.family.id, scope, 'family.id', issues);
  validateRequiredString(pack.family.name, scope, 'family.name', issues);
  validateRequiredString(pack.family.description, scope, 'family.description', issues);
  validateRequiredStringArray(pack.family.tags, scope, 'family.tags', issues, true);

  if (!isEnumValue(pack.family.defaultModeBias, MODE_BIASES)) {
    issues.push(
      issue(scope, 'family.defaultModeBias', `Expected one of: ${MODE_BIASES.join(', ')}`)
    );
  }

  validateRequiredStringArray(pack.family.substyleIds, scope, 'family.substyleIds', issues);

  for (const key of PACK_COLLECTION_KEYS) {
    const collection = pack[key];

    if (!Array.isArray(collection) || collection.length === 0) {
      issues.push(issue(scope, key, `Pack collection "${key}" must be a non-empty array.`));
    }
  }

  if (issues.length > 0) {
    return issues;
  }

  const typedPack = pack as unknown as FamilyPack;
  const substyleIds = new Set(typedPack.substyles.map((entry) => entry.id));
  const archetypeIds = new Set(typedPack.archetypes.map((entry) => entry.id));
  const cadenceIds = new Set(typedPack.cadenceProfiles.map((entry) => entry.id));
  const rhythmIds = new Set(typedPack.harmonicRhythmProfiles.map((entry) => entry.id));
  const sectionBehaviorIds = new Set(typedPack.sectionBehaviors.map((entry) => entry.id));
  const spiceIds = new Set(typedPack.spicinessTransforms.map((entry) => entry.id));
  const variationIds = new Set(typedPack.variationRules.map((entry) => entry.id));
  const specialMoveIds = new Set(typedPack.specialMoves.map((entry) => entry.id));
  const explanationIds = new Set(typedPack.explanationTemplates.map((entry) => entry.id));
  const midiPresetIds = new Set(typedPack.midiPresets.map((entry) => entry.id));

  const collections: Array<[string, string[]]> = [
    ['substyles', typedPack.substyles.map((entry) => entry.id)],
    ['archetypes', typedPack.archetypes.map((entry) => entry.id)],
    ['cadenceProfiles', typedPack.cadenceProfiles.map((entry) => entry.id)],
    ['harmonicRhythmProfiles', typedPack.harmonicRhythmProfiles.map((entry) => entry.id)],
    ['sectionBehaviors', typedPack.sectionBehaviors.map((entry) => entry.id)],
    ['spicinessTransforms', typedPack.spicinessTransforms.map((entry) => entry.id)],
    ['variationRules', typedPack.variationRules.map((entry) => entry.id)],
    ['specialMoves', typedPack.specialMoves.map((entry) => entry.id)],
    ['explanationTemplates', typedPack.explanationTemplates.map((entry) => entry.id)],
    ['midiPresets', typedPack.midiPresets.map((entry) => entry.id)]
  ];

  for (const [key, ids] of collections) {
    if (!hasUniqueValues(ids)) {
      issues.push(issue(scope, key, `Duplicate ids: ${collectDuplicates(ids).join(', ')}`));
    }
  }

  if (
    isStringArray(typedPack.family.substyleIds) &&
    typedPack.family.substyleIds.length > 0 &&
    hasUniqueValues(typedPack.family.substyleIds)
  ) {
    if (typedPack.family.substyleIds.length !== substyleIds.size) {
      issues.push(
        issue(scope, 'family.substyleIds', 'Family substyleIds must exactly match pack substyles.')
      );
    }

    for (const entry of typedPack.family.substyleIds) {
      if (!substyleIds.has(entry)) {
        issues.push(issue(scope, 'family.substyleIds', `Unknown substyle "${entry}" listed on family.`));
      }
    }
  }

  for (const substyle of typedPack.substyles) {
    const path = `substyles.${substyle.id}`;

    validateRequiredString(substyle.id, scope, `${path}.id`, issues);
    validateRequiredString(substyle.name, scope, `${path}.name`, issues);
    validateRequiredString(substyle.description, scope, `${path}.description`, issues);
    validateRequiredStringArray(substyle.tags, scope, `${path}.tags`, issues);

    if (substyle.familyId !== typedPack.family.id) {
      issues.push(issue(scope, `${path}.familyId`, 'Substyle familyId must match the pack family id.'));
    }

    if (!isEnumValue(substyle.modeBias, MODE_BIASES)) {
      issues.push(issue(scope, `${path}.modeBias`, `Expected one of: ${MODE_BIASES.join(', ')}`));
    }

    validateEnumArray(
      substyle.defaultSectionIntents,
      SECTION_INTENTS,
      scope,
      `${path}.defaultSectionIntents`,
      issues
    );
    validateIdSet(substyle.archetypeIds, archetypeIds, scope, `${path}.archetypeIds`, issues);
    validateIdSet(
      substyle.cadenceProfileIds,
      cadenceIds,
      scope,
      `${path}.cadenceProfileIds`,
      issues
    );
    validateIdSet(
      substyle.harmonicRhythmProfileIds,
      rhythmIds,
      scope,
      `${path}.harmonicRhythmProfileIds`,
      issues
    );

    if (!sectionBehaviorIds.has(substyle.sectionBehaviorId)) {
      issues.push(
        issue(scope, `${path}.sectionBehaviorId`, `Unknown section behavior "${substyle.sectionBehaviorId}".`)
      );
    }

    validateIdSet(
      substyle.spicinessTransformIds,
      spiceIds,
      scope,
      `${path}.spicinessTransformIds`,
      issues
    );
    validateIdSet(
      substyle.variationRuleIds,
      variationIds,
      scope,
      `${path}.variationRuleIds`,
      issues
    );
    validateIdSet(
      substyle.specialMoveIds,
      specialMoveIds,
      scope,
      `${path}.specialMoveIds`,
      issues
    );
    validateIdSet(
      substyle.explanationTemplateIds,
      explanationIds,
      scope,
      `${path}.explanationTemplateIds`,
      issues
    );
    validateIdSet(
      substyle.midiPresetIds,
      midiPresetIds,
      scope,
      `${path}.midiPresetIds`,
      issues
    );
    validateRequiredStringArray(
      substyle.mustIncludeTags,
      scope,
      `${path}.mustIncludeTags`,
      issues,
      true
    );
    validateRequiredStringArray(
      substyle.mustAvoidTags,
      scope,
      `${path}.mustAvoidTags`,
      issues,
      true
    );
  }

  for (const archetype of typedPack.archetypes) {
    const path = `archetypes.${archetype.id}`;

    validateRequiredString(archetype.id, scope, `${path}.id`, issues);
    validateRequiredString(archetype.name, scope, `${path}.name`, issues);

    if (!substyleIds.has(archetype.substyleId)) {
      issues.push(issue(scope, `${path}.substyleId`, `Unknown substyle "${archetype.substyleId}".`));
    }

    validateRequiredStringArray(
      archetype.romanNumerals,
      scope,
      `${path}.romanNumerals`,
      issues,
      false,
      false
    );
    validateRequiredStringArray(
      archetype.functionPath,
      scope,
      `${path}.functionPath`,
      issues,
      false,
      false
    );

    if (archetype.functionPath.length !== archetype.romanNumerals.length) {
      issues.push(
        issue(scope, `${path}.functionPath`, 'Function path length must match roman numeral length.')
      );
    }

    validateRequiredNumber(archetype.bars, scope, `${path}.bars`, issues, 1);

    if (!rhythmIds.has(archetype.harmonicRhythmProfileId)) {
      issues.push(
        issue(
          scope,
          `${path}.harmonicRhythmProfileId`,
          `Unknown rhythm profile "${archetype.harmonicRhythmProfileId}".`
        )
      );
    }

    validateEnumArray(
      archetype.allowedSectionIntents,
      SECTION_INTENTS,
      scope,
      `${path}.allowedSectionIntents`,
      issues
    );

    if (!isEnumValue(archetype.resolutionBias, CADENCE_TYPES)) {
      issues.push(issue(scope, `${path}.resolutionBias`, `Expected one of: ${CADENCE_TYPES.join(', ')}`));
    }

    validateRequiredNumber(archetype.loopability, scope, `${path}.loopability`, issues, 0, 1);
    validateRequiredStringArray(
      archetype.tensionCurve,
      scope,
      `${path}.tensionCurve`,
      issues,
      false,
      false
    );

    if (archetype.tensionCurve.length !== archetype.romanNumerals.length) {
      issues.push(
        issue(scope, `${path}.tensionCurve`, 'Tension curve length must match roman numeral length.')
      );
    }

    validateRequiredStringArray(archetype.tags, scope, `${path}.tags`, issues);
    validateRequiredNumber(archetype.weight, scope, `${path}.weight`, issues, 0.01);

    if (!Array.isArray(archetype.slotOptions) || archetype.slotOptions.length === 0) {
      issues.push(issue(scope, `${path}.slotOptions`, 'Archetype must include slot options.'));
      continue;
    }

    const slotIndexes = new Set<number>();

    for (const [slotIndex, slotOption] of archetype.slotOptions.entries()) {
      const slotPath = `${path}.slotOptions[${slotIndex}]`;

      if (!isRecord(slotOption)) {
        issues.push(issue(scope, slotPath, 'Slot option must be an object.'));
        continue;
      }

      if (!validateRequiredNumber(slotOption.slotIndex, scope, `${slotPath}.slotIndex`, issues, 0)) {
        continue;
      }

      if (slotOption.slotIndex >= archetype.romanNumerals.length) {
        issues.push(
          issue(scope, `${slotPath}.slotIndex`, 'Slot index must be within the archetype chord range.')
        );
      }

      if (slotIndexes.has(slotOption.slotIndex)) {
        issues.push(issue(scope, `${slotPath}.slotIndex`, 'Slot indexes must be unique.'));
      }

      slotIndexes.add(slotOption.slotIndex);
      validateRequiredStringArray(
        slotOption.allowedDecorations,
        scope,
        `${slotPath}.allowedDecorations`,
        issues,
        true
      );
      validateRequiredStringArray(
        slotOption.allowedSlashBassDegrees,
        scope,
        `${slotPath}.allowedSlashBassDegrees`,
        issues,
        true
      );

      if (typeof slotOption.forbidOnLowSpice !== 'boolean') {
        issues.push(issue(scope, `${slotPath}.forbidOnLowSpice`, 'Expected a boolean.'));
      }
    }
  }

  for (const cadenceProfile of typedPack.cadenceProfiles) {
    const path = `cadenceProfiles.${cadenceProfile.id}`;

    validateRequiredString(cadenceProfile.id, scope, `${path}.id`, issues);
    validateRequiredString(cadenceProfile.name, scope, `${path}.name`, issues);

    if (!isEnumValue(cadenceProfile.type, CADENCE_TYPES)) {
      issues.push(issue(scope, `${path}.type`, `Expected one of: ${CADENCE_TYPES.join(', ')}`));
    }

    validateRequiredStringArray(
      cadenceProfile.allowedEndFunctions,
      scope,
      `${path}.allowedEndFunctions`,
      issues
    );
    validateRequiredNumber(cadenceProfile.strength, scope, `${path}.strength`, issues, 0, 1);
    validateEnumArray(
      cadenceProfile.commonUseCases,
      SECTION_INTENTS,
      scope,
      `${path}.commonUseCases`,
      issues
    );
    validateRequiredNumber(cadenceProfile.weight, scope, `${path}.weight`, issues, 0.01);
  }

  for (const rhythmProfile of typedPack.harmonicRhythmProfiles) {
    const path = `harmonicRhythmProfiles.${rhythmProfile.id}`;

    validateRequiredString(rhythmProfile.id, scope, `${path}.id`, issues);
    validateRequiredString(rhythmProfile.name, scope, `${path}.name`, issues);

    if (!isEnumValue(rhythmProfile.density, HARMONIC_RHYTHM_DENSITIES)) {
      issues.push(
        issue(scope, `${path}.density`, `Expected one of: ${HARMONIC_RHYTHM_DENSITIES.join(', ')}`)
      );
    }

    if (!isNumberArray(rhythmProfile.beatsPerChangePattern) || rhythmProfile.beatsPerChangePattern.length === 0) {
      issues.push(issue(scope, `${path}.beatsPerChangePattern`, 'Expected a non-empty number array.'));
    }

    validateEnumArray(
      rhythmProfile.commonUseCases,
      SECTION_INTENTS,
      scope,
      `${path}.commonUseCases`,
      issues
    );
  }

  for (const behavior of typedPack.sectionBehaviors) {
    const path = `sectionBehaviors.${behavior.id}`;

    validateRequiredString(behavior.id, scope, `${path}.id`, issues);

    if (!substyleIds.has(behavior.substyleId)) {
      issues.push(issue(scope, `${path}.substyleId`, `Unknown substyle "${behavior.substyleId}".`));
    }

    validateRuleBlock(behavior.fullLoopRules, scope, `${path}.fullLoopRules`, specialMoveIds, issues);
    validateRuleBlock(behavior.verseRules, scope, `${path}.verseRules`, specialMoveIds, issues);
    validateRuleBlock(
      behavior.preChorusRules,
      scope,
      `${path}.preChorusRules`,
      specialMoveIds,
      issues
    );
    validateRuleBlock(behavior.chorusRules, scope, `${path}.chorusRules`, specialMoveIds, issues);
    validateRuleBlock(behavior.bridgeRules, scope, `${path}.bridgeRules`, specialMoveIds, issues);
  }

  const validStyleScopeIds = new Set<string>([typedPack.family.id, ...substyleIds]);

  for (const transform of typedPack.spicinessTransforms) {
    const path = `spicinessTransforms.${transform.id}`;

    validateRequiredString(transform.id, scope, `${path}.id`, issues);
    validateRequiredString(transform.name, scope, `${path}.name`, issues);
    validateRequiredNumber(transform.level, scope, `${path}.level`, issues, 1);
    validateIdSet(transform.styleScope, validStyleScopeIds, scope, `${path}.styleScope`, issues);
    validateRequiredStringArray(
      transform.allowedDecorations,
      scope,
      `${path}.allowedDecorations`,
      issues
    );
    validateRequiredStringArray(
      transform.allowedFunctions,
      scope,
      `${path}.allowedFunctions`,
      issues
    );
    validateEnumArray(
      transform.forbiddenSectionIntents,
      SECTION_INTENTS,
      scope,
      `${path}.forbiddenSectionIntents`,
      issues,
      true
    );
    validateRequiredStringArray(transform.forbiddenTags, scope, `${path}.forbiddenTags`, issues, true);
    validateRequiredNumber(transform.weight, scope, `${path}.weight`, issues, 0.01);
  }

  for (const variationRule of typedPack.variationRules) {
    const path = `variationRules.${variationRule.id}`;

    validateRequiredString(variationRule.id, scope, `${path}.id`, issues);
    validateRequiredString(variationRule.name, scope, `${path}.name`, issues);
    if (!isEnumValue(variationRule.type, VARIATION_TYPES)) {
      issues.push(issue(scope, `${path}.type`, `Expected one of: ${VARIATION_TYPES.join(', ')}`));
    }

    validateIdSet(variationRule.styleScope, validStyleScopeIds, scope, `${path}.styleScope`, issues);
    validateEnumArray(
      variationRule.allowedSectionIntents,
      SECTION_INTENTS,
      scope,
      `${path}.allowedSectionIntents`,
      issues
    );
    validateRequiredStringArray(variationRule.preserve, scope, `${path}.preserve`, issues);
    validateRequiredStringArray(variationRule.targets, scope, `${path}.targets`, issues);
    validateRequiredStringArray(variationRule.requiredTags, scope, `${path}.requiredTags`, issues, true);
    validateRequiredStringArray(
      variationRule.forbiddenTags,
      scope,
      `${path}.forbiddenTags`,
      issues,
      true
    );
    validateRequiredNumber(variationRule.weight, scope, `${path}.weight`, issues, 0.01);
  }

  for (const specialMove of typedPack.specialMoves) {
    const path = `specialMoves.${specialMove.id}`;

    validateRequiredString(specialMove.id, scope, `${path}.id`, issues);
    validateRequiredString(specialMove.name, scope, `${path}.name`, issues);
    validateRequiredString(specialMove.category, scope, `${path}.category`, issues);
    validateIdSet(specialMove.styleScope, validStyleScopeIds, scope, `${path}.styleScope`, issues);
    validateEnumArray(
      specialMove.allowedSectionIntents,
      SECTION_INTENTS,
      scope,
      `${path}.allowedSectionIntents`,
      issues
    );
    validateRequiredStringArray(specialMove.triggerTags, scope, `${path}.triggerTags`, issues);

    if (!isEnumValue(specialMove.operation, SPECIAL_MOVE_OPERATIONS)) {
      issues.push(
        issue(scope, `${path}.operation`, `Expected one of: ${SPECIAL_MOVE_OPERATIONS.join(', ')}`)
      );
    }

    validateRequiredNumber(specialMove.weight, scope, `${path}.weight`, issues, 0.01);
  }

  for (const template of typedPack.explanationTemplates) {
    const path = `explanationTemplates.${template.id}`;

    validateRequiredString(template.id, scope, `${path}.id`, issues);
    validateRequiredString(template.templateType, scope, `${path}.templateType`, issues);
    validateIdSet(template.styleScope, validStyleScopeIds, scope, `${path}.styleScope`, issues);
    validateEnumArray(
      template.sectionIntentScope,
      SECTION_INTENTS,
      scope,
      `${path}.sectionIntentScope`,
      issues
    );
    validateRequiredString(template.tone, scope, `${path}.tone`, issues);
    validateRequiredString(template.content, scope, `${path}.content`, issues);
    validateRequiredStringArray(
      template.requiredPlaceholders,
      scope,
      `${path}.requiredPlaceholders`,
      issues,
      true
    );

    for (const placeholder of template.requiredPlaceholders) {
      if (!template.content.includes(`{${placeholder}}`)) {
        issues.push(
          issue(
            scope,
            `${path}.requiredPlaceholders`,
            `Placeholder "{${placeholder}}" is missing from template content.`
          )
        );
      }
    }
  }

  for (const preset of typedPack.midiPresets) {
    const path = `midiPresets.${preset.id}`;

    validateRequiredString(preset.id, scope, `${path}.id`, issues);
    if (!isEnumValue(preset.mode, MIDI_MODES)) {
      issues.push(issue(scope, `${path}.mode`, `Expected one of: ${MIDI_MODES.join(', ')}`));
    }

    validateRequiredString(preset.name, scope, `${path}.name`, issues);
    validateRequiredStringArray(preset.styleTags, scope, `${path}.styleTags`, issues);
    validateRequiredString(preset.voicingStyle, scope, `${path}.voicingStyle`, issues);

    if (!Array.isArray(preset.registerRange) || preset.registerRange.length !== 2) {
      issues.push(issue(scope, `${path}.registerRange`, 'Expected a [min, max] note range.'));
    } else {
      const [minNote, maxNote] = preset.registerRange;
      validateRequiredNumber(minNote, scope, `${path}.registerRange[0]`, issues, 0, 127);
      validateRequiredNumber(maxNote, scope, `${path}.registerRange[1]`, issues, 0, 127);

      if (typeof minNote === 'number' && typeof maxNote === 'number' && minNote > maxNote) {
        issues.push(issue(scope, `${path}.registerRange`, 'Register range must be ascending.'));
      }
    }

    validateRequiredString(preset.rhythmPattern, scope, `${path}.rhythmPattern`, issues);
    validateRequiredString(preset.velocityProfile, scope, `${path}.velocityProfile`, issues);
    validateRequiredString(preset.sustainBehavior, scope, `${path}.sustainBehavior`, issues);
    validateRequiredNumber(preset.weight, scope, `${path}.weight`, issues, 0.01);
  }

  return issues;
}

export function validatePackSet(
  manifest: unknown,
  packsByPath: Record<string, unknown>
): ValidationIssue[] {
  const issues = validatePackManifest(manifest);

  if (!isRecord(manifest) || !Array.isArray(manifest.packs)) {
    return issues;
  }

  for (const entry of manifest.packs) {
    if (!isRecord(entry) || !isNonEmptyString(entry.path)) {
      continue;
    }

    const pack = packsByPath[entry.path];

    if (pack === undefined) {
      issues.push(issue('manifest', `packs.${entry.path}`, 'Referenced pack file was not provided.'));
      continue;
    }

    const packIssues = validateFamilyPack(pack);
    issues.push(...packIssues);
    validateNoRawCorpusLeak(pack, 'runtime-pack-privacy', entry.path, issues);

    if (!isRecord(pack) || !isRecord(pack.family) || !Array.isArray(pack.substyles)) {
      continue;
    }

    if (pack.packId !== entry.packId) {
      issues.push(issue('manifest', `${entry.path}.packId`, 'Manifest packId does not match pack file.'));
    }

    if (pack.packVersion !== entry.version) {
      issues.push(
        issue('manifest', `${entry.path}.packVersion`, 'Manifest version does not match packVersion.')
      );
    }

    if (pack.family.id !== entry.familyId) {
      issues.push(
        issue('manifest', `${entry.path}.family.id`, 'Manifest familyId does not match pack family id.')
      );
    }

    const substyleIds = pack.substyles
      .map((substyle) => (isRecord(substyle) && typeof substyle.id === 'string' ? substyle.id : null))
      .filter((value): value is string => value !== null);

    if (!isStringArray(entry.substyleIds)) {
      continue;
    }

    for (const substyleId of entry.substyleIds) {
      if (!substyleIds.includes(substyleId)) {
        issues.push(
          issue(
            'manifest',
            `${entry.path}.substyleIds`,
            `Manifest substyle "${substyleId}" does not exist in the pack.`
          )
        );
      }
    }
  }

  return issues;
}
