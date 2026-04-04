function copyArray(values = []) {
  return [...values];
}

function profileForFunction(functionLabel, slotProfile) {
  return (
    slotProfile[functionLabel] ??
    slotProfile.default ?? {
      allowedDecorations: [],
      allowedSlashBassDegrees: [],
      forbidOnLowSpice: false
    }
  );
}

export function makeSlotOptions(functionPath, slotProfile) {
  return functionPath.map((functionLabel, slotIndex) => {
    const profile = profileForFunction(functionLabel, slotProfile);

    return {
      slotIndex,
      allowedDecorations: copyArray(profile.allowedDecorations),
      allowedSlashBassDegrees: copyArray(profile.allowedSlashBassDegrees),
      forbidOnLowSpice: profile.forbidOnLowSpice ?? false
    };
  });
}

export function createArchetype(spec, slotProfile) {
  return {
    ...spec,
    slotOptions: makeSlotOptions(spec.functionPath, slotProfile)
  };
}

export function createCadenceProfile(spec) {
  return { ...spec };
}

export function createHarmonicRhythmProfile(spec) {
  return { ...spec };
}

export function createSectionRuleBlock(spec) {
  return { ...spec };
}

export function createSectionBehavior(spec) {
  return { ...spec };
}

export function createSpicinessTransform(spec) {
  return { ...spec };
}

export function createVariationRule(spec) {
  return { ...spec };
}

export function createSpecialMove(spec) {
  return { ...spec };
}

export function createExplanationTemplate(spec) {
  return { ...spec };
}

export function createMidiPreset(spec) {
  return { ...spec };
}

export function createSubstyle(spec) {
  return { ...spec };
}

export function createFamilyPack(spec) {
  return { ...spec };
}

export function styleScope(familyId, substyleId) {
  return [familyId, substyleId];
}

export function buildManifest(packs) {
  return {
    manifestVersion: '1.0.0',
    packs: packs.map((pack) => ({
      packId: pack.packId,
      familyId: pack.family.id,
      familyName: pack.family.name,
      path: `packs/${pack.packId}.pack.json`,
      version: pack.packVersion,
      substyleIds: pack.substyles.map((substyle) => substyle.id),
      tags: copyArray(pack.family.tags)
    }))
  };
}
