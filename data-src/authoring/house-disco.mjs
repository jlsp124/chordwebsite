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

const familyId = 'dance';
const substyleId = 'house_disco';
const id = (suffix) => `${substyleId}_${suffix}`;
const scope = styleScope(familyId, substyleId);

const slotProfile = {
  tonic: { allowedDecorations: ['add9', '6', 'maj7'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  tonic_family: { allowedDecorations: ['add9', 'min7', '6'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  predominant: { allowedDecorations: ['sus2', '9', '6'], allowedSlashBassDegrees: ['6'], forbidOnLowSpice: false },
  dominant: { allowedDecorations: ['7', 'sus4', '9'], allowedSlashBassDegrees: ['7'], forbidOnLowSpice: true },
  contrast: { allowedDecorations: ['maj7', 'add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: false },
  default: { allowedDecorations: ['add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: false }
};

const cadenceProfiles = [
  ['groove_loop', 'Groove Loop', 'open_loop', ['predominant', 'dominant'], 0.4, ['full_loop', 'verse'], 1],
  ['hands_up_release', 'Hands-Up Release', 'soft_resolve', ['tonic', 'tonic_family'], 0.64, ['chorus'], 0.9],
  ['filter_lift', 'Filter Lift', 'lift_without_arrival', ['dominant', 'contrast'], 0.62, ['pre_chorus', 'bridge'], 0.84]
].map(([suffix, name, type, allowedEndFunctions, strength, commonUseCases, weight]) =>
  createCadenceProfile({ id: id(suffix), name, type, allowedEndFunctions, strength, commonUseCases, weight })
);

const harmonicRhythmProfiles = [
  ['club_grid', 'Club Grid', 'medium', [4, 4, 4, 4], ['full_loop', 'verse']],
  ['pump_drive', 'Pump Drive', 'active', [2, 2, 2, 2, 2, 2, 2, 2], ['chorus', 'pre_chorus']],
  ['filter_hold', 'Filter Hold', 'slow', [8, 8], ['bridge', 'full_loop']]
].map(([suffix, name, density, beatsPerChangePattern, commonUseCases]) =>
  createHarmonicRhythmProfile({ id: id(suffix), name, density, beatsPerChangePattern, commonUseCases })
);

const archetypes = [
  ['piano_lift', 'Piano Lift', ['I', 'IV'], ['tonic', 'predominant'], 'club_grid', ['full_loop', 'verse'], 'open_loop', 0.96, ['stable', 'open'], ['house', 'groove_core', 'bright'], 1],
  ['mirror_bounce', 'Mirror Bounce', ['vi', 'IV', 'I', 'V'], ['tonic_family', 'predominant', 'tonic', 'dominant'], 'pump_drive', ['chorus', 'full_loop'], 'soft_resolve', 0.85, ['soft_drop', 'lift', 'release', 'open'], ['disco', 'hands_up', 'groove_core'], 0.94],
  ['filter_drive', 'Filter Drive', ['ii', 'V'], ['predominant', 'dominant'], 'pump_drive', ['pre_chorus', 'full_loop'], 'lift_without_arrival', 0.91, ['lift', 'push'], ['filter_ready', 'groove_core', 'house'], 0.92],
  ['disco_glide', 'Disco Glide', ['I', 'V', 'vi', 'IV'], ['tonic', 'dominant', 'tonic_family', 'predominant'], 'club_grid', ['chorus', 'verse'], 'soft_resolve', 0.83, ['stable', 'push', 'soft_drop', 'open'], ['disco', 'bright', 'glide'], 0.82],
  ['pump_loop', 'Pump Loop', ['I', 'I', 'IV', 'IV'], ['tonic', 'tonic', 'predominant', 'predominant'], 'pump_drive', ['full_loop', 'chorus'], 'open_loop', 0.95, ['stable', 'anchor', 'open', 'open'], ['groove_core', 'pedal', 'house'], 0.88],
  ['night_floor', 'Night Floor', ['vi', 'ii', 'V', 'I'], ['tonic_family', 'predominant', 'dominant', 'tonic'], 'pump_drive', ['chorus', 'bridge'], 'soft_resolve', 0.72, ['soft_drop', 'lift', 'push', 'release'], ['night', 'disco', 'chorus_ready'], 0.76],
  ['bright_chase', 'Bright Chase', ['IV', 'I', 'ii', 'V'], ['predominant', 'tonic', 'predominant', 'dominant'], 'club_grid', ['verse', 'chorus'], 'soft_resolve', 0.78, ['open', 'stable', 'lift', 'push'], ['bright', 'groove_core', 'chase'], 0.74],
  ['octave_lock', 'Octave Lock', ['i', 'VII', 'VI', 'VII'], ['tonic', 'dominant', 'contrast', 'dominant'], 'club_grid', ['full_loop', 'verse'], 'open_loop', 0.87, ['stable', 'push', 'expand', 'open'], ['nu_disco', 'groove_core', 'dark'], 0.71],
  ['hands_up', 'Hands Up', ['I', 'IV', 'V', 'IV'], ['tonic', 'predominant', 'dominant', 'predominant'], 'pump_drive', ['chorus'], 'soft_resolve', 0.74, ['stable', 'lift', 'push', 'open'], ['hands_up', 'chorus_ready', 'house'], 0.79],
  ['bassline_turn', 'Bassline Turn', ['vi', 'IV', 'ii', 'V'], ['tonic_family', 'predominant', 'predominant', 'dominant'], 'pump_drive', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.7, ['soft_drop', 'lift', 'rise', 'push'], ['filter_ready', 'bassline', 'house'], 0.73],
  ['classy_step', 'Classy Step', ['I', 'vi', 'IV', 'V'], ['tonic', 'tonic_family', 'predominant', 'dominant'], 'club_grid', ['full_loop', 'chorus'], 'soft_resolve', 0.84, ['stable', 'soft_drop', 'open', 'push'], ['classy', 'disco', 'groove_core'], 0.8],
  ['roller_loop', 'Roller Loop', ['ii', 'ii', 'V', 'V'], ['predominant', 'predominant', 'dominant', 'dominant'], 'pump_drive', ['pre_chorus', 'full_loop'], 'lift_without_arrival', 0.89, ['lift', 'lift', 'push', 'push'], ['filter_ready', 'roller', 'house'], 0.75],
  ['soulful_house', 'Soulful House', ['I', 'iii', 'IV', 'ii'], ['tonic', 'tonic_family', 'predominant', 'predominant'], 'club_grid', ['verse', 'chorus'], 'soft_resolve', 0.73, ['stable', 'lean', 'open', 'lift'], ['soulful', 'bright', 'groove_core'], 0.7],
  ['drop_hold', 'Drop Hold', ['I', 'I', 'I', 'V'], ['tonic', 'tonic', 'tonic', 'dominant'], 'filter_hold', ['bridge', 'chorus'], 'open_loop', 0.9, ['stable', 'anchor', 'anchor', 'push'], ['drop_ready', 'pedal', 'house'], 0.72],
  ['tension_release', 'Tension Release', ['vi', 'V', 'IV', 'V'], ['tonic_family', 'dominant', 'predominant', 'dominant'], 'pump_drive', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.71, ['soft_drop', 'push', 'lift', 'push'], ['chorus_ready', 'filter_ready', 'house'], 0.74]
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
    preferredRhythmDensities: ['medium', 'active'],
    preferredArchetypeTags: ['groove_core', 'house'],
    allowedVariationTypes: ['safer', 'brighter', 'more_open'],
    allowedSpecialMoveIds: [id('groove_lock'), id('last_bar_tilt')],
    forbiddenTags: ['blunt_ballad'],
    energyShape: 'rolling'
  }),
  verseRules: createSectionRuleBlock({
    preferredCadenceTypes: ['open_loop'],
    preferredRhythmDensities: ['medium'],
    preferredArchetypeTags: ['groove_core', 'bright'],
    allowedVariationTypes: ['safer', 'brighter'],
    allowedSpecialMoveIds: [id('groove_lock'), id('last_bar_tilt')],
    forbiddenTags: ['blunt_ballad'],
    energyShape: 'steady'
  }),
  preChorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['lift_without_arrival'],
    preferredRhythmDensities: ['active'],
    preferredArchetypeTags: ['filter_ready', 'bassline'],
    allowedVariationTypes: ['pre_chorus_lift', 'more_open'],
    allowedSpecialMoveIds: [id('last_bar_tilt'), id('drop_simplify')],
    forbiddenTags: ['pedal'],
    energyShape: 'filter_rise'
  }),
  chorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['soft_resolve', 'open_loop'],
    preferredRhythmDensities: ['active', 'medium'],
    preferredArchetypeTags: ['hands_up', 'chorus_ready'],
    allowedVariationTypes: ['chorus_payoff', 'brighter', 'more_resolved'],
    allowedSpecialMoveIds: [id('groove_lock'), id('drop_simplify')],
    forbiddenTags: ['blunt_ballad'],
    energyShape: 'release'
  }),
  bridgeRules: createSectionRuleBlock({
    preferredCadenceTypes: ['lift_without_arrival', 'contrastive'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['drop_ready', 'night'],
    allowedVariationTypes: ['bridge_contrast', 'darker'],
    allowedSpecialMoveIds: [id('drop_simplify'), id('last_bar_tilt')],
    forbiddenTags: ['groove_core'],
    energyShape: 'breakdown'
  })
});

const spicinessTransforms = [
  ['clean_shine', 'Clean Shine', 1, ['add9', '6'], ['tonic', 'predominant'], [], ['blunt_ballad'], 1],
  ['disco_color', 'Disco Color', 2, ['add9', '9', 'maj7'], ['tonic', 'tonic_family', 'predominant'], [], ['blunt_ballad'], 1],
  ['club_edge', 'Club Edge', 3, ['9', '13', 'sus4'], ['dominant', 'predominant'], ['full_loop'], ['blunt_ballad'], 0.84]
].map(([suffix, name, level, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight]) =>
  createSpicinessTransform({ id: id(suffix), name, level, styleScope: scope, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight })
);

const variationRules = [
  ['safer_loop', 'Safer Loop', 'safer', ['full_loop', 'verse'], ['groove_identity', 'kick_space'], ['surface_simplify', 'cleaner_turnback'], ['groove_core'], ['blunt_ballad'], 1],
  ['brighter_lift', 'Brighter Lift', 'brighter', ['full_loop', 'chorus'], ['groove_identity'], ['tonic_shine', 'upper_color'], ['bright'], ['blunt_ballad'], 0.9],
  ['richer_step', 'Richer Step', 'richer', ['verse', 'chorus'], ['groove_identity'], ['upper_extensions', 'predominant_color'], ['soulful'], ['blunt_ballad'], 0.76],
  ['pre_lift_rule', 'Filter Lift', 'pre_chorus_lift', ['pre_chorus'], ['groove_identity', 'kick_space'], ['last_bar_motion', 'filter_pressure'], ['filter_ready'], ['pedal'], 0.88],
  ['chorus_payoff_rule', 'Floor Payoff', 'chorus_payoff', ['chorus'], ['groove_identity'], ['release_width', 'hook_brightness'], ['hands_up'], ['blunt_ballad'], 0.86]
].map(([suffix, name, type, allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight]) =>
  createVariationRule({ id: id(suffix), name, type, styleScope: [substyleId], allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight })
);

const specialMoves = [
  ['groove_lock', 'Groove Lock', 'groove', ['full_loop', 'verse', 'chorus'], ['groove_core', 'pedal'], 'groove_lock', 1],
  ['drop_simplify', 'Drop Simplify', 'drop', ['pre_chorus', 'chorus', 'bridge'], ['drop_ready', 'filter_ready'], 'drop_simplify', 0.92],
  ['last_bar_tilt', 'Last Bar Tilt', 'turnback', ['full_loop', 'pre_chorus', 'bridge'], ['bassline', 'filter_ready'], 'last_bar_tilt', 0.84]
].map(([suffix, name, category, allowedSectionIntents, triggerTags, operation, weight]) =>
  createSpecialMove({ id: id(suffix), name, category, styleScope: [substyleId], allowedSectionIntents, triggerTags, operation, weight })
);

const explanationTemplates = [
  ['why', 'why_it_works', ['full_loop', 'chorus'], 'producer_first', 'This {sectionIntent} works because the groove stays more important than the cadence. The harmony should support motion on the floor, not narrate over it.', ['sectionIntent']],
  ['section', 'section_idea', ['pre_chorus', 'bridge'], 'learning_aware', 'In {sectionIntent}, house/disco usually builds by changing density, filter energy, or last-bar direction. The harmonic job is to keep the groove intact while the section opens.', ['sectionIntent']],
  ['learn', 'learn', ['full_loop', 'verse', 'chorus'], 'learning_aware', 'If {rhythmName} feels stable enough to loop for a long time, the progression is probably in bounds. If the harmony keeps asking for attention, simplify it.', ['rhythmName']]
].map(([suffix, templateType, sectionIntentScope, tone, content, requiredPlaceholders]) =>
  createExplanationTemplate({ id: id(suffix), templateType, styleScope: [substyleId], sectionIntentScope, tone, content, requiredPlaceholders })
);

const midiPresets = [
  ['comp', 'House Comp', 'comp', ['house', 'groove_core'], 'mid_piano_stabs', [50, 82], 'four_on_floor_stabs', 'steady_accent', 'short_release', 1],
  ['block', 'Disco Block', 'block', ['disco', 'hands_up'], 'bright_stack_hits', [52, 84], 'bar_hits', 'bright_even', 'medium_sustain', 0.72]
].map(([suffix, name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight]) =>
  createMidiPreset({ id: id(suffix), name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight })
);

export const houseDisco = {
  substyle: createSubstyle({
    id: substyleId,
    familyId,
    name: 'House / Disco',
    description: 'Groove-first house/disco with piano-led lift, repetitive floor loops, and filter-driven section changes.',
    tags: ['house', 'disco', 'groove_first', 'bright'],
    modeBias: 'loop_first',
    defaultSectionIntents: ['full_loop', 'verse', 'pre_chorus', 'chorus'],
    archetypeIds: archetypes.map((entry) => entry.id),
    cadenceProfileIds: cadenceProfiles.map((entry) => entry.id),
    harmonicRhythmProfileIds: harmonicRhythmProfiles.map((entry) => entry.id),
    sectionBehaviorId: sectionBehavior.id,
    spicinessTransformIds: spicinessTransforms.map((entry) => entry.id),
    variationRuleIds: variationRules.map((entry) => entry.id),
    specialMoveIds: specialMoves.map((entry) => entry.id),
    explanationTemplateIds: explanationTemplates.map((entry) => entry.id),
    midiPresetIds: midiPresets.map((entry) => entry.id),
    mustIncludeTags: ['house', 'groove_core'],
    mustAvoidTags: ['blunt_ballad']
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
