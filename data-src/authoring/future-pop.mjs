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

const familyId = 'pop';
const substyleId = 'future_pop';
const id = (suffix) => `${substyleId}_${suffix}`;
const scope = styleScope(familyId, substyleId);

const slotProfile = {
  tonic: { allowedDecorations: ['add9', 'maj7', '6'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  tonic_family: { allowedDecorations: ['add9', 'maj7', '9'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  predominant: { allowedDecorations: ['sus2', 'add9', '6'], allowedSlashBassDegrees: ['6'], forbidOnLowSpice: false },
  dominant: { allowedDecorations: ['7', 'sus4', '9'], allowedSlashBassDegrees: ['7'], forbidOnLowSpice: true },
  contrast: { allowedDecorations: ['maj7', 'add9', '#11'], allowedSlashBassDegrees: [], forbidOnLowSpice: false },
  default: { allowedDecorations: ['add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: false }
};

const cadenceProfiles = [
  ['open_loop', 'Open Loop', 'open_loop', ['predominant', 'dominant'], 0.44, ['full_loop', 'verse'], 1],
  ['soft_release', 'Soft Release', 'soft_resolve', ['tonic', 'tonic_family'], 0.74, ['chorus'], 1],
  ['lift_setup', 'Lift Setup', 'lift_without_arrival', ['dominant', 'contrast'], 0.68, ['pre_chorus', 'bridge'], 0.92]
].map(([suffix, name, type, allowedEndFunctions, strength, commonUseCases, weight]) =>
  createCadenceProfile({ id: id(suffix), name, type, allowedEndFunctions, strength, commonUseCases, weight })
);

const harmonicRhythmProfiles = [
  ['mid_glide', 'Mid Glide', 'medium', [4, 4, 4, 4], ['full_loop', 'verse']],
  ['active_push', 'Active Push', 'active', [2, 2, 2, 2, 2, 2, 2, 2], ['pre_chorus', 'chorus']],
  ['wide_air', 'Wide Air', 'slow', [8, 8], ['bridge', 'chorus']]
].map(([suffix, name, density, beatsPerChangePattern, commonUseCases]) =>
  createHarmonicRhythmProfile({ id: id(suffix), name, density, beatsPerChangePattern, commonUseCases })
);

const archetypes = [
  ['glide_loop', 'Glide Loop', ['I', 'vi', 'IV', 'V'], ['tonic', 'tonic_family', 'predominant', 'dominant'], 'mid_glide', ['full_loop', 'verse'], 'open_loop', 0.92, ['stable', 'soft_drop', 'lift', 'open'], ['future_pop', 'glossy', 'loop_core'], 1],
  ['release_loop', 'Release Loop', ['vi', 'IV', 'I', 'V'], ['tonic_family', 'predominant', 'tonic', 'dominant'], 'active_push', ['chorus'], 'soft_resolve', 0.86, ['held_tension', 'lift', 'release', 'open'], ['future_pop', 'chorus_payoff', 'glossy'], 0.98],
  ['shimmer_rise', 'Shimmer Rise', ['IV', 'V', 'vi', 'I'], ['predominant', 'dominant', 'tonic_family', 'tonic'], 'active_push', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.73, ['lift', 'push', 'held_tension', 'release'], ['future_pop', 'lift_ready', 'glossy'], 0.87],
  ['airlock', 'Airlock', ['I', 'V', 'vi', 'iii'], ['tonic', 'dominant', 'tonic_family', 'tonic_family'], 'mid_glide', ['verse', 'chorus'], 'soft_resolve', 0.76, ['stable', 'push', 'soft_drop', 'lean'], ['glossy', 'hook_forward', 'future_pop'], 0.8],
  ['bright_launch', 'Bright Launch', ['ii', 'IV', 'I', 'V'], ['predominant', 'predominant', 'tonic', 'dominant'], 'active_push', ['pre_chorus', 'chorus'], 'soft_resolve', 0.72, ['lift', 'rise', 'release', 'open'], ['bright', 'chorus_ready', 'future_pop'], 0.79],
  ['held_lift', 'Held Lift', ['vi', 'V', 'IV', 'I'], ['tonic_family', 'dominant', 'predominant', 'tonic'], 'active_push', ['chorus', 'bridge'], 'soft_resolve', 0.69, ['soft_drop', 'push', 'lift', 'release'], ['airy', 'future_pop', 'chorus_ready'], 0.74],
  ['daybreak', 'Daybreak', ['I', 'iii', 'IV', 'V'], ['tonic', 'tonic_family', 'predominant', 'dominant'], 'mid_glide', ['verse', 'chorus'], 'soft_resolve', 0.75, ['stable', 'lean', 'lift', 'open'], ['bright', 'daylight', 'future_pop'], 0.77],
  ['afterglow', 'Afterglow', ['IV', 'I', 'vi', 'V'], ['predominant', 'tonic', 'tonic_family', 'dominant'], 'mid_glide', ['full_loop', 'chorus'], 'open_loop', 0.83, ['open', 'stable', 'soft_drop', 'open'], ['afterglow', 'glossy', 'loop_core'], 0.76],
  ['open_frame', 'Open Frame', ['I', 'IV', 'vi', 'V'], ['tonic', 'predominant', 'tonic_family', 'dominant'], 'mid_glide', ['full_loop', 'verse'], 'open_loop', 0.87, ['stable', 'open', 'soft_drop', 'open'], ['loop_core', 'airy', 'future_pop'], 0.81],
  ['skyline_push', 'Skyline Push', ['ii', 'V', 'vi', 'IV'], ['predominant', 'dominant', 'tonic_family', 'predominant'], 'active_push', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.7, ['lift', 'push', 'held_tension', 'release'], ['lift_ready', 'chorus_ready', 'future_pop'], 0.78],
  ['chorus_sweep', 'Chorus Sweep', ['vi', 'IV', 'I', 'I'], ['tonic_family', 'predominant', 'tonic', 'tonic'], 'wide_air', ['chorus'], 'soft_resolve', 0.65, ['held_tension', 'lift', 'release', 'settle'], ['chorus_payoff', 'airy', 'future_pop'], 0.73],
  ['pre_drop', 'Pre-Drop', ['IV', 'V', 'I', 'V'], ['predominant', 'dominant', 'tonic', 'dominant'], 'active_push', ['pre_chorus'], 'lift_without_arrival', 0.68, ['lift', 'push', 'tease', 'held_tension'], ['lift_ready', 'drop_ready', 'future_pop'], 0.75],
  ['glass_arch', 'Glass Arch', ['I', 'ii', 'IV', 'V'], ['tonic', 'predominant', 'predominant', 'dominant'], 'mid_glide', ['verse', 'pre_chorus'], 'soft_resolve', 0.72, ['stable', 'lift', 'rise', 'push'], ['glossy', 'bright', 'future_pop'], 0.72],
  ['neon_open', 'Neon Open', ['iii', 'vi', 'IV', 'I'], ['tonic_family', 'tonic_family', 'predominant', 'tonic'], 'wide_air', ['bridge', 'chorus'], 'contrastive', 0.58, ['lean', 'soft_drop', 'lift', 'release'], ['bridge_contrast', 'neon', 'future_pop'], 0.67],
  ['bridge_flight', 'Bridge Flight', ['vi', 'ii', 'IV', 'I'], ['tonic_family', 'predominant', 'predominant', 'tonic'], 'wide_air', ['bridge'], 'contrastive', 0.56, ['soft_drop', 'lift', 'rise', 'release'], ['bridge_contrast', 'flight', 'future_pop'], 0.66]
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
    preferredRhythmDensities: ['medium'],
    preferredArchetypeTags: ['loop_core', 'glossy'],
    allowedVariationTypes: ['safer', 'brighter', 'more_open'],
    allowedSpecialMoveIds: [id('delay_arrival')],
    forbiddenTags: ['heavy_dissonance'],
    energyShape: 'floating'
  }),
  verseRules: createSectionRuleBlock({
    preferredCadenceTypes: ['open_loop'],
    preferredRhythmDensities: ['medium'],
    preferredArchetypeTags: ['glossy', 'hook_forward'],
    allowedVariationTypes: ['safer', 'brighter'],
    allowedSpecialMoveIds: [id('delay_arrival')],
    forbiddenTags: ['heavy_dissonance'],
    energyShape: 'gliding'
  }),
  preChorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['lift_without_arrival'],
    preferredRhythmDensities: ['active'],
    preferredArchetypeTags: ['lift_ready', 'drop_ready'],
    allowedVariationTypes: ['pre_chorus_lift', 'more_open'],
    allowedSpecialMoveIds: [id('delay_arrival'), id('bass_climb')],
    forbiddenTags: ['loop_core'],
    energyShape: 'rising'
  }),
  chorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['soft_resolve'],
    preferredRhythmDensities: ['active', 'medium'],
    preferredArchetypeTags: ['chorus_payoff', 'chorus_ready'],
    allowedVariationTypes: ['chorus_payoff', 'brighter', 'more_resolved'],
    allowedSpecialMoveIds: [id('chorus_widen')],
    forbiddenTags: ['heavy_dissonance'],
    energyShape: 'release'
  }),
  bridgeRules: createSectionRuleBlock({
    preferredCadenceTypes: ['contrastive'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['bridge_contrast', 'flight'],
    allowedVariationTypes: ['bridge_contrast', 'darker'],
    allowedSpecialMoveIds: [id('bridge_reframe')],
    forbiddenTags: ['loop_core'],
    energyShape: 'lifted_reframe'
  })
});

const spicinessTransforms = [
  ['clean_sheen', 'Clean Sheen', 1, ['add9', '6', 'sus2'], ['tonic', 'predominant'], [], ['heavy_dissonance'], 1],
  ['gloss_color', 'Gloss Color', 2, ['add9', 'maj7', '9'], ['tonic', 'tonic_family', 'predominant'], [], ['heavy_dissonance'], 1],
  ['edge_bright', 'Edge Bright', 3, ['9', '#11', 'sus4'], ['dominant', 'contrast'], ['full_loop'], ['heavy_dissonance'], 0.84]
].map(([suffix, name, level, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight]) =>
  createSpicinessTransform({ id: id(suffix), name, level, styleScope: scope, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight })
);

const variationRules = [
  ['safer_loop', 'Safer Loop', 'safer', ['full_loop', 'verse'], ['hook_identity', 'topline_space'], ['surface_simplify', 'cleaner_end'], ['loop_core'], ['heavy_dissonance'], 1],
  ['brighter_hook', 'Brighter Hook', 'brighter', ['full_loop', 'chorus'], ['hook_identity'], ['tonic_shine', 'upper_color'], ['bright'], ['heavy_dissonance'], 0.92],
  ['more_open_loop', 'More Open Loop', 'more_open', ['full_loop', 'verse'], ['glossy_identity'], ['last_slot_openness', 'cadence_softening'], ['glossy'], ['heavy_dissonance'], 0.86],
  ['pre_lift_rule', 'Lift Setup', 'pre_chorus_lift', ['pre_chorus'], ['hook_identity', 'drop_space'], ['dominant_pull', 'bass_motion'], ['lift_ready'], ['loop_core'], 0.9],
  ['chorus_payoff_rule', 'Gloss Payoff', 'chorus_payoff', ['chorus'], ['hook_identity'], ['release_width', 'tonic_arrival'], ['chorus_payoff'], ['heavy_dissonance'], 1]
].map(([suffix, name, type, allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight]) =>
  createVariationRule({ id: id(suffix), name, type, styleScope: [substyleId], allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight })
);

const specialMoves = [
  ['delay_arrival', 'Delay Arrival', 'section_lift', ['full_loop', 'pre_chorus'], ['lift_ready', 'glossy'], 'delay_tonic_arrival', 0.92],
  ['chorus_widen', 'Chorus Widen', 'payoff', ['chorus'], ['chorus_payoff', 'chorus_ready'], 'chorus_payoff_widen', 0.94],
  ['bass_climb', 'Bass Climb Lead-In', 'lead_in', ['pre_chorus'], ['lift_ready', 'drop_ready'], 'bass_climb_lead_in', 0.88],
  ['bridge_reframe', 'Bridge Reframe', 'bridge', ['bridge'], ['bridge_contrast', 'flight'], 'bridge_reframe', 0.82]
].map(([suffix, name, category, allowedSectionIntents, triggerTags, operation, weight]) =>
  createSpecialMove({ id: id(suffix), name, category, styleScope: [substyleId], allowedSectionIntents, triggerTags, operation, weight })
);

const explanationTemplates = [
  ['why', 'why_it_works', ['full_loop', 'chorus'], 'producer_first', 'This {sectionIntent} works because future pop keeps the loop polished and readable, then spends its bigger release only where the payoff needs it.', ['sectionIntent']],
  ['section', 'section_idea', ['pre_chorus', 'bridge'], 'learning_aware', 'In {sectionIntent}, future pop usually lifts through timing and brightness first. The progression should feel like it is opening up before it feels harmonically crowded.', ['sectionIntent']],
  ['learn', 'learn', ['full_loop', 'verse', 'chorus'], 'learning_aware', 'When {rhythmName} keeps repeating cleanly, you can add sheen without losing focus. If the chord movement starts feeling busier than the production, pull it back.', ['rhythmName']]
].map(([suffix, templateType, sectionIntentScope, tone, content, requiredPlaceholders]) =>
  createExplanationTemplate({ id: id(suffix), templateType, styleScope: [substyleId], sectionIntentScope, tone, content, requiredPlaceholders })
);

const midiPresets = [
  ['block', 'Future Pop Block', 'block', ['future_pop', 'glossy'], 'wide_pop_stack', [50, 82], 'bar_hits', 'bright_even', 'clean_phrase_sustain', 1],
  ['arp', 'Future Pop Arp', 'arp', ['future_pop', 'airy'], 'polished_upper_motion', [55, 88], 'eighth_note_glide', 'lifted_wave', 'phrase_sustain', 0.94]
].map(([suffix, name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight]) =>
  createMidiPreset({ id: id(suffix), name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight })
);

export const futurePop = {
  substyle: createSubstyle({
    id: substyleId,
    familyId,
    name: 'Future Pop',
    description: 'Glossy future pop with bright loop shapes, pre-drop lift, and polished chorus release.',
    tags: ['future_pop', 'glossy', 'bright', 'section_aware'],
    modeBias: 'section_first',
    defaultSectionIntents: ['full_loop', 'verse', 'pre_chorus', 'chorus', 'bridge'],
    archetypeIds: archetypes.map((entry) => entry.id),
    cadenceProfileIds: cadenceProfiles.map((entry) => entry.id),
    harmonicRhythmProfileIds: harmonicRhythmProfiles.map((entry) => entry.id),
    sectionBehaviorId: sectionBehavior.id,
    spicinessTransformIds: spicinessTransforms.map((entry) => entry.id),
    variationRuleIds: variationRules.map((entry) => entry.id),
    specialMoveIds: specialMoves.map((entry) => entry.id),
    explanationTemplateIds: explanationTemplates.map((entry) => entry.id),
    midiPresetIds: midiPresets.map((entry) => entry.id),
    mustIncludeTags: ['future_pop', 'glossy'],
    mustAvoidTags: ['heavy_dissonance']
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
