import {
  createArchetype,
  createCadenceProfile,
  createExplanationTemplate,
  createHarmonicRhythmProfile,
  createMidiPreset,
  createSectionBehavior,
  createSectionRuleBlock,
  createSpecialMove,
  createSpicinessTransform,
  createSubstyle,
  createVariationRule,
  styleScope
} from './shared.mjs';

const familyId = 'trap';
const substyleId = 'trap_soul_rnb_rap';
const id = (suffix) => `${substyleId}_${suffix}`;
const scope = styleScope(familyId, substyleId);

const slotProfile = {
  tonic: { allowedDecorations: ['min7', 'add9', '9'], allowedSlashBassDegrees: ['5'], forbidOnLowSpice: false },
  tonic_family: { allowedDecorations: ['maj7', 'min7', '11'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  predominant: { allowedDecorations: ['9', '11', 'sus2'], allowedSlashBassDegrees: ['6'], forbidOnLowSpice: false },
  dominant: { allowedDecorations: ['7', 'b9', 'sus4'], allowedSlashBassDegrees: ['7'], forbidOnLowSpice: true },
  contrast: { allowedDecorations: ['maj7', '9', '13'], allowedSlashBassDegrees: [], forbidOnLowSpice: false },
  default: { allowedDecorations: ['add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: false }
};

const cadenceProfiles = [
  ['open_loop', 'Open Loop', 'open_loop', ['contrast', 'dominant'], 0.44, ['full_loop', 'verse'], 1],
  ['soft_pull', 'Soft Pull', 'soft_resolve', ['tonic', 'tonic_family'], 0.66, ['chorus'], 0.88],
  ['late_push', 'Late Push', 'lift_without_arrival', ['dominant', 'contrast'], 0.62, ['pre_chorus', 'bridge'], 0.82]
].map(([suffix, name, type, allowedEndFunctions, strength, commonUseCases, weight]) =>
  createCadenceProfile({ id: id(suffix), name, type, allowedEndFunctions, strength, commonUseCases, weight })
);

const harmonicRhythmProfiles = [
  ['slow_lux', 'Slow Lux', 'slow', [8, 8], ['full_loop', 'verse']],
  ['mid_sway', 'Mid Sway', 'medium', [4, 4, 4, 4], ['full_loop', 'chorus']],
  ['turnback_push', 'Turnback Push', 'variable', [8, 4, 4], ['pre_chorus', 'bridge']]
].map(([suffix, name, density, beatsPerChangePattern, commonUseCases]) =>
  createHarmonicRhythmProfile({ id: id(suffix), name, density, beatsPerChangePattern, commonUseCases })
);

const archetypes = [
  ['velvet_loop', 'Velvet Loop', ['i', 'iv', 'VII', 'III'], ['tonic', 'predominant', 'dominant', 'tonic_family'], 'mid_sway', ['full_loop', 'verse'], 'open_loop', 0.92, ['stable', 'darken', 'push', 'glow'], ['trap_soul', 'loop_core', 'rich_color'], 1],
  ['late_drive', 'Late Drive', ['i', 'VI', 'iv', 'V'], ['tonic', 'contrast', 'predominant', 'dominant'], 'mid_sway', ['full_loop', 'chorus'], 'soft_resolve', 0.81, ['stable', 'expand', 'darken', 'push'], ['trap_soul', 'late_night', 'rich_color'], 0.92],
  ['soul_turn', 'Soul Turn', ['vi', 'IV', 'I', 'V'], ['tonic_family', 'predominant', 'tonic', 'dominant'], 'mid_sway', ['chorus', 'verse'], 'soft_resolve', 0.78, ['soft_drop', 'lift', 'release', 'open'], ['crossover', 'hook_forward', 'rich_color'], 0.8],
  ['low_light', 'Low Light', ['i', 'iv', 'i', 'III'], ['tonic', 'predominant', 'tonic', 'tonic_family'], 'slow_lux', ['full_loop', 'verse'], 'open_loop', 0.9, ['stable', 'darken', 'reset', 'glow'], ['trap_soul', 'loop_core', 'smoky'], 0.86],
  ['champagne_minor', 'Champagne Minor', ['i', 'III', 'VII', 'VI'], ['tonic', 'tonic_family', 'dominant', 'contrast'], 'mid_sway', ['full_loop', 'chorus'], 'open_loop', 0.84, ['stable', 'glow', 'push', 'open'], ['rich_color', 'luxury', 'trap_soul'], 0.82],
  ['night_ribbon', 'Night Ribbon', ['vi', 'ii', 'V', 'I'], ['tonic_family', 'predominant', 'dominant', 'tonic'], 'turnback_push', ['chorus', 'bridge'], 'soft_resolve', 0.69, ['soft_drop', 'lift', 'push', 'release'], ['crossover', 'silky', 'rich_color'], 0.76],
  ['dusky_resolve', 'Dusky Resolve', ['i', 'iv', 'VI', 'III'], ['tonic', 'predominant', 'contrast', 'tonic_family'], 'mid_sway', ['full_loop', 'verse'], 'open_loop', 0.83, ['stable', 'darken', 'expand', 'glow'], ['smoky', 'loop_core', 'trap_soul'], 0.81],
  ['warm_slide', 'Warm Slide', ['I', 'vi', 'ii', 'V'], ['tonic', 'tonic_family', 'predominant', 'dominant'], 'turnback_push', ['chorus', 'bridge'], 'soft_resolve', 0.66, ['stable', 'soft_drop', 'lift', 'push'], ['crossover', 'warm', 'rich_color'], 0.72],
  ['tape_wobble', 'Tape Wobble', ['i', 'VII', 'iv', 'VI'], ['tonic', 'dominant', 'predominant', 'contrast'], 'slow_lux', ['full_loop', 'verse'], 'open_loop', 0.88, ['stable', 'push', 'darken', 'open'], ['smoky', 'loop_core', 'wobble'], 0.79],
  ['soft_push', 'Soft Push', ['vi', 'IV', 'ii', 'V'], ['tonic_family', 'predominant', 'predominant', 'dominant'], 'turnback_push', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.7, ['soft_drop', 'lift', 'rise', 'push'], ['pre_lift', 'crossover', 'rich_color'], 0.74],
  ['moody_home', 'Moody Home', ['i', 'V', 'VI', 'iv'], ['tonic', 'dominant', 'contrast', 'predominant'], 'mid_sway', ['chorus', 'verse'], 'soft_resolve', 0.75, ['stable', 'push', 'expand', 'darken'], ['late_night', 'trap_soul', 'rich_color'], 0.77],
  ['clouded_hook', 'Clouded Hook', ['iii', 'vi', 'ii', 'V'], ['tonic_family', 'tonic_family', 'predominant', 'dominant'], 'turnback_push', ['chorus', 'bridge'], 'soft_resolve', 0.63, ['glow', 'soft_drop', 'lift', 'push'], ['crossover', 'hook_forward', 'silky'], 0.68],
  ['city_afterglow', 'City Afterglow', ['i', 'iv', 'VII', 'VI'], ['tonic', 'predominant', 'dominant', 'contrast'], 'mid_sway', ['full_loop', 'chorus'], 'open_loop', 0.82, ['stable', 'darken', 'push', 'expand'], ['trap_soul', 'afterglow', 'rich_color'], 0.78],
  ['open_letter', 'Open Letter', ['I', 'iii', 'IV', 'iv'], ['tonic', 'tonic_family', 'predominant', 'contrast'], 'turnback_push', ['bridge', 'chorus'], 'contrastive', 0.58, ['stable', 'lean', 'lift', 'darken'], ['borrowed_color', 'crossover', 'bridge_contrast'], 0.66],
  ['lean_back', 'Lean Back', ['i', 'VI', 'III', 'V'], ['tonic', 'contrast', 'tonic_family', 'dominant'], 'mid_sway', ['full_loop', 'verse'], 'open_loop', 0.85, ['stable', 'expand', 'glow', 'push'], ['trap_soul', 'loop_core', 'late_night'], 0.8]
].map(([suffix, name, romanNumerals, functionPath, rhythm, allowedSectionIntents, resolutionBias, loopability, tensionCurve, tags, weight]) =>
  createArchetype({
    id: id(suffix),
    substyleId,
    name,
    romanNumerals,
    functionPath,
    bars: 4,
    harmonicRhythmProfileId: id(rhythm),
    allowedSectionIntents,
    resolutionBias,
    loopability,
    tensionCurve,
    tags,
    weight
  }, slotProfile)
);

const sectionBehavior = createSectionBehavior({
  id: id('sections'),
  substyleId,
  fullLoopRules: createSectionRuleBlock({
    preferredCadenceTypes: ['open_loop'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['loop_core', 'trap_soul'],
    allowedVariationTypes: ['safer', 'richer', 'darker'],
    allowedSpecialMoveIds: [id('groove_lock'), id('last_bar_tilt')],
    forbiddenTags: ['blunt_major'],
    energyShape: 'sway'
  }),
  verseRules: createSectionRuleBlock({
    preferredCadenceTypes: ['open_loop'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['loop_core', 'late_night'],
    allowedVariationTypes: ['safer', 'richer'],
    allowedSpecialMoveIds: [id('groove_lock'), id('trap_soul_enrich')],
    forbiddenTags: ['blunt_major'],
    energyShape: 'steady'
  }),
  preChorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['lift_without_arrival'],
    preferredRhythmDensities: ['variable'],
    preferredArchetypeTags: ['pre_lift', 'crossover'],
    allowedVariationTypes: ['pre_chorus_lift', 'richer'],
    allowedSpecialMoveIds: [id('last_bar_tilt'), id('dominant_pressure')],
    forbiddenTags: ['loop_core'],
    energyShape: 'tilting'
  }),
  chorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['soft_resolve'],
    preferredRhythmDensities: ['medium'],
    preferredArchetypeTags: ['rich_color', 'hook_forward'],
    allowedVariationTypes: ['chorus_payoff', 'richer', 'more_resolved'],
    allowedSpecialMoveIds: [id('trap_soul_enrich'), id('groove_lock')],
    forbiddenTags: ['blunt_major'],
    energyShape: 'open_release'
  }),
  bridgeRules: createSectionRuleBlock({
    preferredCadenceTypes: ['contrastive'],
    preferredRhythmDensities: ['variable'],
    preferredArchetypeTags: ['bridge_contrast', 'borrowed_color'],
    allowedVariationTypes: ['bridge_contrast', 'darker'],
    allowedSpecialMoveIds: [id('last_bar_tilt'), id('trap_soul_enrich')],
    forbiddenTags: ['loop_core'],
    energyShape: 'reframe'
  })
});

const spicinessTransforms = [
  ['soft_color', 'Soft Color', 1, ['min7', 'add9'], ['tonic', 'tonic_family'], [], ['blunt_major'], 1],
  ['rich_color', 'Rich Color', 2, ['9', '11', 'maj7'], ['tonic_family', 'predominant', 'contrast'], [], ['blunt_major'], 1],
  ['late_night_edge', 'Late-Night Edge', 3, ['9', '11', '13', 'b9'], ['contrast', 'dominant'], ['full_loop'], ['blunt_major'], 0.86]
].map(([suffix, name, level, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight]) =>
  createSpicinessTransform({ id: id(suffix), name, level, styleScope: scope, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight })
);

const variationRules = [
  ['safer_loop', 'Safer Loop', 'safer', ['full_loop', 'verse'], ['groove_space', 'smoky_identity'], ['surface_simplify', 'cleaner_turnback'], ['loop_core'], ['blunt_major'], 1],
  ['richer_color', 'Richer Color', 'richer', ['verse', 'chorus', 'bridge'], ['roman_root_path', 'trap_identity'], ['upper_extensions', 'smoother_color'], ['rich_color'], ['blunt_major'], 1],
  ['darker_turn', 'Darker Turn', 'darker', ['full_loop', 'chorus', 'bridge'], ['loop_identity'], ['borrowed_shadow', 'contrast_weight'], ['late_night'], ['blunt_major'], 0.9],
  ['pre_lift_rule', 'Late Push', 'pre_chorus_lift', ['pre_chorus'], ['groove_space', 'vocal_pocket'], ['dominant_pull', 'last_bar_motion'], ['pre_lift'], ['loop_core'], 0.84],
  ['chorus_payoff_rule', 'Soul Payoff', 'chorus_payoff', ['chorus'], ['hook_identity'], ['release_width', 'upper_extension'], ['hook_forward'], ['blunt_major'], 0.82]
].map(([suffix, name, type, allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight]) =>
  createVariationRule({ id: id(suffix), name, type, styleScope: [substyleId], allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight })
);

const specialMoves = [
  ['groove_lock', 'Groove Lock', 'groove', ['full_loop', 'verse', 'chorus'], ['loop_core', 'late_night'], 'groove_lock', 1],
  ['trap_soul_enrich', 'Trap-Soul Enrich', 'color', ['verse', 'chorus', 'bridge'], ['rich_color', 'crossover'], 'trap_soul_enrich', 1],
  ['last_bar_tilt', 'Last Bar Tilt', 'turnback', ['full_loop', 'pre_chorus', 'bridge'], ['turnback', 'smoky'], 'last_bar_tilt', 0.88],
  ['dominant_pressure', 'Dominant Pressure', 'tension', ['pre_chorus', 'chorus'], ['pre_lift', 'hook_forward'], 'dominant_pressure', 0.72]
].map(([suffix, name, category, allowedSectionIntents, triggerTags, operation, weight]) =>
  createSpecialMove({ id: id(suffix), name, category, styleScope: [substyleId], allowedSectionIntents, triggerTags, operation, weight })
);

const explanationTemplates = [
  ['why', 'why_it_works', ['full_loop', 'chorus'], 'producer_first', 'This {sectionIntent} keeps the trap pocket intact while the harmony leans smoother and richer than straight melodic trap.', ['sectionIntent']],
  ['section', 'section_idea', ['pre_chorus', 'bridge'], 'learning_aware', 'In {sectionIntent}, trap-soul usually changes feel through color and last-bar direction, not through busy harmonic rewriting. Keep the loop lazy, then tilt it.', ['sectionIntent']],
  ['learn', 'learn', ['full_loop', 'verse', 'chorus'], 'learning_aware', 'If {rhythmName} still feels loop-first after you add color chords, you are inside the style. If it starts sounding like pop-R&B, you pushed too far.', ['rhythmName']]
].map(([suffix, templateType, sectionIntentScope, tone, content, requiredPlaceholders]) =>
  createExplanationTemplate({ id: id(suffix), templateType, styleScope: [substyleId], sectionIntentScope, tone, content, requiredPlaceholders })
);

const midiPresets = [
  ['block', 'Trap-Soul Block', 'block', ['trap_soul', 'late_night'], 'soft_low_mid_stack', [43, 74], 'bar_hits', 'warm_even', 'smooth_bar_sustain', 1],
  ['comp', 'Trap-Soul Comp', 'comp', ['crossover', 'rich_color'], 'soft_offbeat_stabs', [48, 78], 'laid_back_syncopation', 'gentle_accent', 'short_to_medium', 0.74]
].map(([suffix, name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight]) =>
  createMidiPreset({ id: id(suffix), name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight })
);

export const trapSoulRnbRap = {
  substyle: createSubstyle({
    id: substyleId,
    familyId,
    name: 'Trap-Soul / R&B Rap',
    description: 'Loop-first trap-soul with smoother color, late-night sway, and restrained R&B extension.',
    tags: ['trap_soul', 'loop_first', 'rich_color', 'late_night'],
    modeBias: 'loop_first',
    defaultSectionIntents: ['full_loop', 'verse', 'chorus'],
    archetypeIds: archetypes.map((entry) => entry.id),
    cadenceProfileIds: cadenceProfiles.map((entry) => entry.id),
    harmonicRhythmProfileIds: harmonicRhythmProfiles.map((entry) => entry.id),
    sectionBehaviorId: sectionBehavior.id,
    spicinessTransformIds: spicinessTransforms.map((entry) => entry.id),
    variationRuleIds: variationRules.map((entry) => entry.id),
    specialMoveIds: specialMoves.map((entry) => entry.id),
    explanationTemplateIds: explanationTemplates.map((entry) => entry.id),
    midiPresetIds: midiPresets.map((entry) => entry.id),
    mustIncludeTags: ['trap_soul', 'rich_color'],
    mustAvoidTags: ['blunt_major']
  }),
  archetypes,
  cadenceProfiles,
  harmonicRhythmProfiles,
  sectionBehavior,
  spicinessTransforms,
  variationRules,
  specialMoves,
  explanationTemplates,
  midiPresets
};
