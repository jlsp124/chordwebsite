import {
  LOOP_CLOSURES,
  SOURCE_LICENSE_CLASSES,
  SOURCE_ROLES,
  type CompiledLoopPack,
  type SourceRegistry
} from '../../core/types/index.ts';
import {
  collectDuplicates,
  hasUniqueValues,
  isNonEmptyString,
  isNumberArray,
  isRecord,
  isStringArray
} from '../../core/utils/validation.ts';
import type { ValidationIssue } from './pack-validator.ts';

function issue(scope: string, path: string, message: string): ValidationIssue {
  return { scope, path, message };
}

function isEnumValue<TValue extends readonly string[]>(
  value: unknown,
  allowedValues: TValue
): value is TValue[number] {
  return typeof value === 'string' && allowedValues.includes(value);
}

function validateString(
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

function validateStringArray(
  value: unknown,
  scope: string,
  path: string,
  issues: ValidationIssue[],
  allowEmpty = false
): value is string[] {
  if (!isStringArray(value)) {
    issues.push(issue(scope, path, 'Expected an array of strings.'));
    return false;
  }

  if (!allowEmpty && value.length === 0) {
    issues.push(issue(scope, path, 'Expected a non-empty array.'));
    return false;
  }

  if (!hasUniqueValues(value)) {
    issues.push(issue(scope, path, `Duplicate values found: ${collectDuplicates(value).join(', ')}`));
  }

  return true;
}

function validateNumber(value: unknown, scope: string, path: string, issues: ValidationIssue[]): boolean {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return true;
  }

  issues.push(issue(scope, path, 'Expected a number.'));
  return false;
}

export function validateSourceRegistry(registry: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = 'source-registry';

  if (!isRecord(registry)) {
    return [issue(scope, 'registry', 'Source registry must be an object.')];
  }

  validateString(registry.registryVersion, scope, 'registryVersion', issues);

  if (!Array.isArray(registry.sources) || registry.sources.length === 0) {
    issues.push(issue(scope, 'sources', 'Source registry must include at least one source.'));
    return issues;
  }

  const sourceIds: string[] = [];

  for (const [index, entry] of registry.sources.entries()) {
    const path = `sources[${index}]`;

    if (!isRecord(entry)) {
      issues.push(issue(scope, path, 'Source entry must be an object.'));
      continue;
    }

    if (validateString(entry.sourceId, scope, `${path}.sourceId`, issues)) {
      sourceIds.push(entry.sourceId);
    }

    validateString(entry.version, scope, `${path}.version`, issues);
    validateString(entry.downloadUrl, scope, `${path}.downloadUrl`, issues);
    validateString(entry.format, scope, `${path}.format`, issues);
    validateString(entry.license, scope, `${path}.license`, issues);

    if (!isEnumValue(entry.licenseClass, SOURCE_LICENSE_CLASSES)) {
      issues.push(
        issue(scope, `${path}.licenseClass`, `Expected one of: ${SOURCE_LICENSE_CLASSES.join(', ')}`)
      );
    }

    if (!isEnumValue(entry.role, SOURCE_ROLES)) {
      issues.push(issue(scope, `${path}.role`, `Expected one of: ${SOURCE_ROLES.join(', ')}`));
    }

    if (typeof entry.enabledByDefault !== 'boolean') {
      issues.push(issue(scope, `${path}.enabledByDefault`, 'Expected a boolean.'));
    }

    validateString(entry.checksum, scope, `${path}.checksum`, issues);
    validateString(entry.notes, scope, `${path}.notes`, issues);

    if (entry.downloadTargets !== undefined) {
      if (!Array.isArray(entry.downloadTargets) || entry.downloadTargets.length === 0) {
        issues.push(issue(scope, `${path}.downloadTargets`, 'Expected a non-empty target array.'));
      } else {
        for (const [targetIndex, target] of entry.downloadTargets.entries()) {
          const targetPath = `${path}.downloadTargets[${targetIndex}]`;

          if (!isRecord(target)) {
            issues.push(issue(scope, targetPath, 'Download target must be an object.'));
            continue;
          }

          validateString(target.fileName, scope, `${targetPath}.fileName`, issues);
          validateString(target.url, scope, `${targetPath}.url`, issues);

          if (target.kind !== 'direct' && target.kind !== 'github_archive') {
            issues.push(issue(scope, `${targetPath}.kind`, 'Expected "direct" or "github_archive".'));
          }
        }
      }
    }
  }

  if (!hasUniqueValues(sourceIds)) {
    issues.push(issue(scope, 'sources', `Duplicate source ids: ${collectDuplicates(sourceIds).join(', ')}`));
  }

  return issues;
}

export function validateCompiledLoopPack(pack: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = 'compiled-loop-pack';

  if (!isRecord(pack)) {
    return [issue(scope, 'pack', 'Compiled loop pack must be an object.')];
  }

  validateString(pack.packVersion, scope, 'packVersion', issues);
  validateString(pack.packId, scope, 'packId', issues);

  if (!isRecord(pack.family)) {
    issues.push(issue(scope, 'family', 'Compiled loop pack family must be an object.'));
    return issues;
  }

  validateString(pack.family.id, scope, 'family.id', issues);
  validateString(pack.family.name, scope, 'family.name', issues);
  validateString(pack.family.description, scope, 'family.description', issues);
  validateStringArray(pack.family.tags, scope, 'family.tags', issues);
  validateStringArray(pack.family.substyleIds, scope, 'family.substyleIds', issues);

  if (!Array.isArray(pack.substyles) || !Array.isArray(pack.loopArchetypes)) {
    issues.push(issue(scope, 'pack', 'Compiled loop pack must include substyles and loopArchetypes.'));
    return issues;
  }

  const typedPack = pack as unknown as CompiledLoopPack;
  const substyleIds = typedPack.substyles.map((entry) => entry.id);
  const loopArchetypeIds = typedPack.loopArchetypes.map((entry) => entry.id);

  if (!hasUniqueValues(substyleIds)) {
    issues.push(issue(scope, 'substyles', `Duplicate substyle ids: ${collectDuplicates(substyleIds).join(', ')}`));
  }

  if (!hasUniqueValues(loopArchetypeIds)) {
    issues.push(
      issue(scope, 'loopArchetypes', `Duplicate loop ids: ${collectDuplicates(loopArchetypeIds).join(', ')}`)
    );
  }

  const substyleIdSet = new Set(substyleIds);
  const rhythmIdSet = new Set(
    Array.isArray(typedPack.harmonicRhythmProfiles)
      ? typedPack.harmonicRhythmProfiles
          .map((entry) => (isRecord(entry) && typeof entry.id === 'string' ? entry.id : null))
          .filter((entry): entry is string => entry !== null)
      : []
  );
  const spiceIdSet = new Set(
    Array.isArray(typedPack.spicinessTransforms)
      ? typedPack.spicinessTransforms
          .map((entry) => (isRecord(entry) && typeof entry.id === 'string' ? entry.id : null))
          .filter((entry): entry is string => entry !== null)
      : []
  );
  const variationIdSet = new Set(
    Array.isArray(typedPack.variationRules)
      ? typedPack.variationRules
          .map((entry) => (isRecord(entry) && typeof entry.id === 'string' ? entry.id : null))
          .filter((entry): entry is string => entry !== null)
      : []
  );
  const moveIdSet = new Set(
    Array.isArray(typedPack.specialMoves)
      ? typedPack.specialMoves
          .map((entry) => (isRecord(entry) && typeof entry.id === 'string' ? entry.id : null))
          .filter((entry): entry is string => entry !== null)
      : []
  );
  const midiIdSet = new Set(
    Array.isArray(typedPack.midiPresets)
      ? typedPack.midiPresets
          .map((entry) => (isRecord(entry) && typeof entry.id === 'string' ? entry.id : null))
          .filter((entry): entry is string => entry !== null)
      : []
  );

  for (const substyle of typedPack.substyles) {
    const path = `substyles.${substyle.id}`;

    validateString(substyle.id, scope, `${path}.id`, issues);
    validateString(substyle.familyId, scope, `${path}.familyId`, issues);
    validateString(substyle.name, scope, `${path}.name`, issues);
    validateString(substyle.description, scope, `${path}.description`, issues);
    validateStringArray(substyle.tags, scope, `${path}.tags`, issues);
    validateStringArray(substyle.loopArchetypeIds, scope, `${path}.loopArchetypeIds`, issues);
    validateStringArray(
      substyle.harmonicRhythmProfileIds,
      scope,
      `${path}.harmonicRhythmProfileIds`,
      issues
    );
    validateStringArray(substyle.spicinessTransformIds, scope, `${path}.spicinessTransformIds`, issues);
    validateStringArray(substyle.variationRuleIds, scope, `${path}.variationRuleIds`, issues);
    validateStringArray(substyle.specialMoveIds, scope, `${path}.specialMoveIds`, issues);
    validateStringArray(substyle.midiPresetIds, scope, `${path}.midiPresetIds`, issues);

    for (const loopId of substyle.loopArchetypeIds) {
      if (!loopArchetypeIds.includes(loopId)) {
        issues.push(issue(scope, `${path}.loopArchetypeIds`, `Unknown loop archetype "${loopId}".`));
      }
    }

    for (const id of substyle.harmonicRhythmProfileIds) {
      if (!rhythmIdSet.has(id)) {
        issues.push(issue(scope, `${path}.harmonicRhythmProfileIds`, `Unknown rhythm profile "${id}".`));
      }
    }

    for (const id of substyle.spicinessTransformIds) {
      if (!spiceIdSet.has(id)) {
        issues.push(issue(scope, `${path}.spicinessTransformIds`, `Unknown spiciness transform "${id}".`));
      }
    }

    for (const id of substyle.variationRuleIds) {
      if (!variationIdSet.has(id)) {
        issues.push(issue(scope, `${path}.variationRuleIds`, `Unknown variation rule "${id}".`));
      }
    }

    for (const id of substyle.specialMoveIds) {
      if (!moveIdSet.has(id)) {
        issues.push(issue(scope, `${path}.specialMoveIds`, `Unknown special move "${id}".`));
      }
    }

    for (const id of substyle.midiPresetIds) {
      if (!midiIdSet.has(id)) {
        issues.push(issue(scope, `${path}.midiPresetIds`, `Unknown midi preset "${id}".`));
      }
    }
  }

  for (const archetype of typedPack.loopArchetypes) {
    const path = `loopArchetypes.${archetype.id}`;

    validateString(archetype.id, scope, `${path}.id`, issues);

    if (!substyleIdSet.has(archetype.substyleId)) {
      issues.push(issue(scope, `${path}.substyleId`, `Unknown substyle "${archetype.substyleId}".`));
    }

    if (archetype.bars !== 4) {
      issues.push(issue(scope, `${path}.bars`, 'Loop archetypes must be 4 bars in the compiled pack.'));
    }

    if (archetype.chordCount !== 2 && archetype.chordCount !== 4) {
      issues.push(issue(scope, `${path}.chordCount`, 'Compiled loops must be either 2 or 4 chords.'));
    }

    validateStringArray(archetype.romanNumerals, scope, `${path}.romanNumerals`, issues);
    validateStringArray(archetype.functionPath, scope, `${path}.functionPath`, issues);

    if (
      !isNumberArray(archetype.durationPatternBeats) ||
      archetype.durationPatternBeats.length !== archetype.chordCount
    ) {
      issues.push(
        issue(scope, `${path}.durationPatternBeats`, 'Duration pattern must match the compiled chord count.')
      );
    }

    if (!isEnumValue(archetype.closure, LOOP_CLOSURES)) {
      issues.push(issue(scope, `${path}.closure`, `Expected one of: ${LOOP_CLOSURES.join(', ')}`));
    }

    validateStringArray(archetype.colorProfile, scope, `${path}.colorProfile`, issues, true);
    validateNumber(archetype.loopability, scope, `${path}.loopability`, issues);
    validateStringArray(archetype.tags, scope, `${path}.tags`, issues, true);
    validateNumber(archetype.weight, scope, `${path}.weight`, issues);

    if (!Array.isArray(archetype.transformSlots)) {
      issues.push(issue(scope, `${path}.transformSlots`, 'Expected transform slot objects.'));
    }

    if (!isRecord(archetype.provenanceSummary)) {
      issues.push(issue(scope, `${path}.provenanceSummary`, 'Expected a provenance summary.'));
    } else {
      validateNumber(
        archetype.provenanceSummary.sourceCount,
        scope,
        `${path}.provenanceSummary.sourceCount`,
        issues
      );
      validateStringArray(
        archetype.provenanceSummary.sourceIds,
        scope,
        `${path}.provenanceSummary.sourceIds`,
        issues,
        true
      );
    }
  }

  if (!isRecord(typedPack.provenanceSummary)) {
    issues.push(issue(scope, 'provenanceSummary', 'Compiled loop pack must include provenanceSummary.'));
  }

  return issues;
}

export function validateGeneratedLoopFragments(value: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = 'generated-loop-fragments';

  if (!isRecord(value)) {
    return [issue(scope, 'root', 'Generated loop fragments must be an object.')];
  }

  validateString(value.generatedVersion, scope, 'generatedVersion', issues);

  if (!Array.isArray(value.substyles)) {
    issues.push(issue(scope, 'substyles', 'Expected generated fragments grouped by substyles.'));
    return issues;
  }

  for (const [index, entry] of value.substyles.entries()) {
    const path = `substyles[${index}]`;

    if (!isRecord(entry)) {
      issues.push(issue(scope, path, 'Substyle fragment group must be an object.'));
      continue;
    }

    validateString(entry.substyleId, scope, `${path}.substyleId`, issues);

    if (!Array.isArray(entry.loopFragments)) {
      issues.push(issue(scope, `${path}.loopFragments`, 'Expected loopFragments array.'));
      continue;
    }

    for (const [loopIndex, loop] of entry.loopFragments.entries()) {
      const loopPath = `${path}.loopFragments[${loopIndex}]`;

      if (!isRecord(loop)) {
        issues.push(issue(scope, loopPath, 'Loop fragment must be an object.'));
        continue;
      }

      validateString(loop.id, scope, `${loopPath}.id`, issues);
      validateStringArray(loop.romanSequence, scope, `${loopPath}.romanSequence`, issues);
      validateStringArray(loop.functionPath, scope, `${loopPath}.functionPath`, issues);
      validateStringArray(loop.tags, scope, `${loopPath}.tags`, issues, true);
      validateString(loop.reviewStatus, scope, `${loopPath}.reviewStatus`, issues);

      if (
        typeof loop.reviewStatus === 'string' &&
        !['ready_for_review', 'blocked_by_source_policy', 'blocked_by_blacklist'].includes(
          loop.reviewStatus
        )
      ) {
        issues.push(
          issue(
            scope,
            `${loopPath}.reviewStatus`,
            'Expected ready_for_review, blocked_by_source_policy, or blocked_by_blacklist.'
          )
        );
      }
    }
  }

  return issues;
}
