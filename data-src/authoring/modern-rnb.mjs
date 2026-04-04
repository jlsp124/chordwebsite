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

const familyId = 'rnb';
const substyleId = 'modern_rnb';
const id = (suffix) => `${substyleId}_${suffix}`;
const scope = styleScope(familyId, substyleId);

const slotProfile = {
  tonic: { allowedDecorations: ['maj7', 'add9', '6'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  tonic_family: { allowedDecorations: ['min7', '9', '11'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  predominant: { allowedDecorations: ['9', '11', '13'], allowedSlashBassDegrees: ['6'], forbidOnLowSpice: false },
  dominant: { allowedDecorations: ['7', 'b9', '13', 'sus4'], allowedSlashBassDegrees: ['7'], forbidOnLowSpice: true },
  contrast: { allowedDecorations: ['maj7', '9', '#11'], allowedSlashBassDegrees: [], forbidOnLowSpice: false },
  default: { allowedDecorations: ['add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: false }
};

const cadenceProfiles = [
  ['soft_return', 'Soft Return', 'soft_resolve', ['tonic', 'tonic_family'], 0.7, ['verse', 'chorus'], 1],
  ['soul_pull', 'Soul Pull', 'strong_resolve', ['tonic', 'dominant'], 0.78, ['chorus'], 0.9],
  ['bridge_reframe', 'Bridge Reframe', 'contrastive', ['contrast', 'predominant'], 0.64, ['bridge', 'pre_chorus'], 0.84]
].map(([suffix, name, type, allowedEndFunctions, strength, commonUseCases, weight]) =>
  createCadenceProfile({ id: id(suffix), name, type, allowedEndFunctions, strength, commonUseCases, weight })
);

const harmonicRhythmProfiles = [
  ['slow_sway', 'Slow Sway', 'slow', [8, 8], ['verse', 'bridge']],
  ['mid_flow', 'Mid Flow', 'medium', [4, 4, 4, 4], ['full_loop', 'chorus']],
  ['turn_push', 'Turn Push', 'variable', [4, 4, 2, 2, 4], ['pre_chorus', 'chorus']]
].map(([suffix, name, density, beatsPerChangePattern, commonUseCases]) =>
  createHarmonicRhythmProfile({ id: id(suffix), name, density, beatsPerChangePattern, commonUseCases })
);

const archetypes = [
  ['silk_cycle', 'Silk Cycle', ['I', 'iii', 'vi', 'ii'], ['tonic', 'tonic_family', 'tonic_family', 'predominant'], 'mid_flow', ['full_loop', 'verse'], 'soft_resolve', 0.82, ['stable', 'lean', 'soft_drop', 'lift'], ['rnb', 'smooth', 'rich_color'], 1],
  ['moody_window', 'Moody Window', ['i', 'iv', 'VII', 'III'], ['tonic', 'predominant', 'dominant', 'tonic_family'], 'mid_flow', ['full_loop', 'chorus'], 'soft_resolve', 0.8, ['stable', 'darken', 'push', 'glow'], ['rnb', 'late_night', 'rich_color'], 0.94],
  ['major_luxury', 'Major Luxury', ['IV', 'iii', 'ii', 'V'], ['predominant', 'tonic_family', 'predominant', 'dominant'], 'turn_push', ['chorus', 'bridge'], 'strong_resolve', 0.71, ['open', 'lean', 'lift', 'push'], ['luxury', 'rnb', 'chorus_ready'], 0.82],
  ['tonic_family_glow', 'Tonic Family Glow', ['I', 'vi', 'iii', 'IV'], ['tonic', 'tonic_family', 'tonic_family', 'predominant'], 'mid_flow', ['verse', 'chorus'], 'soft_resolve', 0.76, ['stable', 'soft_drop', 'lean', 'release'], ['smooth', 'glow', 'rnb'], 0.84],
  ['afterhours_pull', 'Afterhours Pull', ['vi', 'ii', 'V', 'I'], ['tonic_family', 'predominant', 'dominant', 'tonic'], 'turn_push', ['chorus', 'bridge'], 'strong_resolve', 0.68, ['soft_drop', 'lift', 'push', 'release'], ['afterhours', 'chorus_ready', 'rnb'], 0.78],
  ['borrowed_soften', 'Borrowed Soften', ['I', 'IV', 'iv', 'I'], ['tonic', 'predominant', 'contrast', 'tonic'], 'slow_sway', ['verse', 'bridge'], 'contrastive', 0.62, ['stable', 'lift', 'darken', 'release'], ['borrowed_color', 'smooth', 'rnb'], 0.86],
  ['suspended_desire', 'Suspended Desire', ['ii', 'V', 'iii', 'vi'], ['predominant', 'dominant', 'tonic_family', 'tonic_family'], 'turn_push', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.64, ['lift', 'push', 'hover', 'soft_drop'], ['desire', 'pre_lift', 'rnb'], 0.79],
  ['slow_heat', 'Slow Heat', ['i', 'VII', 'VI', 'V'], ['tonic', 'dominant', 'contrast', 'dominant'], 'slow_sway', ['full_loop', 'verse'], 'open_loop', 0.77, ['stable', 'push', 'expand', 'open'], ['late_night', 'slow_heat', 'rnb'], 0.75],
  ['halo_return', 'Halo Return', ['IV', 'V', 'iii', 'vi'], ['predominant', 'dominant', 'tonic_family', 'tonic_family'], 'turn_push', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.67, ['lift', 'push', 'lean', 'soft_drop'], ['chorus_ready', 'halo', 'rnb'], 0.74],
  ['open_color', 'Open Color', ['I', 'iii', 'IV', 'ii'], ['tonic', 'tonic_family', 'predominant', 'predominant'], 'mid_flow', ['verse', 'full_loop'], 'soft_resolve', 0.73, ['stable', 'lean', 'lift', 'open'], ['rich_color', 'open', 'rnb'], 0.72],
  ['velvet_resolve', 'Velvet Resolve', ['iii', 'vi', 'ii', 'V'], ['tonic_family', 'tonic_family', 'predominant', 'dominant'], 'turn_push', ['chorus', 'bridge'], 'strong_resolve', 0.61, ['lean', 'soft_drop', 'lift', 'push'], ['velvet', 'chorus_ready', 'rnb'], 0.69],
  ['gospel_tilt', 'Gospel Tilt', ['I', 'IV', 'ii', 'V'], ['tonic', 'predominant', 'predominant', 'dominant'], 'mid_flow', ['chorus', 'verse'], 'soft_resolve', 0.72, ['stable', 'open', 'lift', 'push'], ['gospel_tint', 'rich_color', 'rnb'], 0.7],
  ['neo_soul_turn', 'Neo-Soul Turn', ['iv', 'I', 'iii', 'VI'], ['contrast', 'tonic', 'tonic_family', 'contrast'], 'turn_push', ['bridge', 'chorus'], 'contrastive', 0.57, ['darken', 'release', 'lean', 'expand'], ['borrowed_color', 'bridge_contrast', 'rnb'], 0.68],
  ['downlit_minor', 'Downlit Minor', ['i', 'iv', 'v', 'VI'], ['tonic', 'predominant', 'dominant', 'contrast'], 'slow_sway', ['full_loop', 'verse'], 'open_loop', 0.74, ['stable', 'darken', 'push', 'expand'], ['late_night', 'minor', 'rnb'], 0.71],
  ['bridge_smoke', 'Bridge Smoke', ['ii', 'III', 'I', 'VI'], ['predominant', 'tonic_family', 'tonic', 'contrast'], 'slow_sway', ['bridge'], 'contrastive', 0.52, ['lift', 'glow', 'release', 'expand'], ['bridge_contrast', 'smoke', 'rnb'], 0.66]
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
    preferredCadenceTypes: ['soft_resolve', 'open_loop'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['rich_color', 'smooth'],
    allowedVariationTypes: ['safer', 'richer'],
    allowedSpecialMoveIds: [id('last_bar_tilt'), id('trap_soul_enrich')],
    forbiddenTags: ['blunt_major'],
    energyShape: 'floating'
  }),
  verseRules: createSectionRuleBlock({
    preferredCadenceTypes: ['soft_resolve'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['smooth', 'late_night'],
    allowedVariationTypes: ['safer', 'richer', 'darker'],
    allowedSpecialMoveIds: [id('last_bar_tilt'), id('borrowed_iv')],
    forbiddenTags: ['blunt_major'],
    energyShape: 'intimate'
  }),
  preChorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['lift_without_arrival'],
    preferredRhythmDensities: ['variable'],
    preferredArchetypeTags: ['pre_lift', 'chorus_ready'],
    allowedVariationTypes: ['pre_chorus_lift', 'richer'],
    allowedSpecialMoveIds: [id('dominant_pressure'), id('last_bar_tilt')],
    forbiddenTags: ['smooth'],
    energyShape: 'leaning_forward'
  }),
  chorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['strong_resolve', 'soft_resolve'],
    preferredRhythmDensities: ['medium'],
    preferredArchetypeTags: ['chorus_ready', 'rich_color'],
    allowedVariationTypes: ['chorus_payoff', 'richer', 'more_resolved'],
    allowedSpecialMoveIds: [id('dominant_pressure'), id('trap_soul_enrich')],
    forbiddenTags: ['blunt_major'],
    energyShape: 'release'
  }),
  bridgeRules: createSectionRuleBlock({
    preferredCadenceTypes: ['contrastive'],
    preferredRhythmDensities: ['slow', 'variable'],
    preferredArchetypeTags: ['bridge_contrast', 'borrowed_color'],
    allowedVariationTypes: ['bridge_contrast', 'darker'],
    allowedSpecialMoveIds: [id('borrowed_iv'), id('last_bar_tilt')],
    forbiddenTags: ['smooth'],
    energyShape: 'reframe'
  })
});

const spicinessTransforms = [
  ['soft_color', 'Soft Color', 1, ['maj7', 'add9', '6'], ['tonic', 'tonic_family'], [], ['blunt_major'], 1],
  ['rich_color', 'Rich Color', 2, ['9', '11', '13'], ['tonic_family', 'predominant', 'contrast'], [], ['blunt_major'], 1],
  ['dominant_edge', 'Dominant Edge', 3, ['9', '13', 'b9'], ['dominant', 'contrast'], ['full_loop'], ['blunt_major'], 0.86]
].map(([suffix, name, level, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight]) =>
  createSpicinessTransform({ id: id(suffix), name, level, styleScope: scope, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight })
);

const variationRules = [
  ['safer_loop', 'Safer Loop', 'safer', ['full_loop', 'verse'], ['topline_space', 'smooth_identity'], ['surface_simplify', 'cleaner_turnback'], ['smooth'], ['blunt_major'], 1],
  ['richer_color', 'Richer Color', 'richer', ['full_loop', 'verse', 'chorus', 'bridge'], ['roman_root_path', 'rnb_identity'], ['upper_extensions', 'voice_leading_detail'], ['rich_color'], ['blunt_major'], 1],
  ['darker_turn', 'Darker Turn', 'darker', ['verse', 'bridge', 'chorus'], ['smooth_identity'], ['borrowed_shadow', 'minor_weight'], ['late_night'], ['blunt_major'], 0.9],
  ['pre_lift_rule', 'Soul Lift', 'pre_chorus_lift', ['pre_chorus'], ['vocal_pocket', 'rnb_identity'], ['dominant_pressure', 'phrase_direction'], ['pre_lift'], ['smooth'], 0.82],
  ['chorus_payoff_rule', 'R&B Payoff', 'chorus_payoff', ['chorus'], ['hook_identity', 'rnb_identity'], ['resolution_weight', 'upper_spread'], ['chorus_ready'], ['blunt_major'], 0.84]
].map(([suffix, name, type, allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight]) =>
  createVariationRule({ id: id(suffix), name, type, styleScope: [substyleId], allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight })
);

const specialMoves = [
  ['borrowed_iv', 'Borrowed iv Darken', 'color_shift', ['verse', 'chorus', 'bridge'], ['borrowed_color', 'late_night'], 'borrowed_iv_darken', 0.96],
  ['dominant_pressure', 'Dominant Pressure', 'tension', ['pre_chorus', 'chorus'], ['pre_lift', 'chorus_ready'], 'dominant_pressure', 0.9],
  ['trap_soul_enrich', 'Trap-Soul Enrich', 'color', ['full_loop', 'chorus', 'bridge'], ['rich_color', 'smooth'], 'trap_soul_enrich', 0.86],
  ['last_bar_tilt', 'Last Bar Tilt', 'turnback', ['full_loop', 'verse', 'bridge'], ['bridge_contrast', 'smooth'], 'last_bar_tilt', 0.82]
].map(([suffix, name, category, allowedSectionIntents, triggerTags, operation, weight]) =>
  createSpecialMove({ id: id(suffix), name, category, styleScope: [substyleId], allowedSectionIntents, triggerTags, operation, weight })
);

const explanationTemplates = [
  ['why', 'why_it_works', ['verse', 'chorus', 'bridge'], 'producer_first', 'This {sectionIntent} sounds modern R&B because the progression lets color chords breathe instead of treating every bar like a hook punch.', ['sectionIntent']],
  ['section', 'section_idea', ['pre_chorus', 'bridge'], 'learning_aware', 'In {sectionIntent}, modern R&B usually moves through richer voice-leading and borrowed color, not through maximum chord count.', ['sectionIntent']],
  ['learn', 'learn', ['full_loop', 'verse', 'chorus'], 'learning_aware', 'If {rhythmName} still feels smooth after you add 9ths, 11ths, or borrowed color, the progression is doing its job. If it starts sounding stiff, simplify.', ['rhythmName']]
].map(([suffix, templateType, sectionIntentScope, tone, content, requiredPlaceholders]) =>
  createExplanationTemplate({ id: id(suffix), templateType, styleScope: [substyleId], sectionIntentScope, tone, content, requiredPlaceholders })
);

const midiPresets = [
  ['block', 'Modern R&B Block', 'block', ['rnb', 'smooth'], 'wide_soft_stack', [46, 80], 'half_note_support', 'soft_swell', 'phrase_sustain', 1],
  ['comp', 'Modern R&B Comp', 'comp', ['rich_color', 'rnb'], 'offbeat_chord_swells', [50, 82], 'lazy_syncopation', 'warm_pulse', 'short_to_medium', 0.82],
  ['arp', 'Modern R&B Arp', 'arp', ['late_night', 'smooth'], 'rolled_upper_spread', [52, 86], 'broken_chord_wave', 'gentle_wave', 'pedal_like', 0.7]
].map(([suffix, name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight]) =>
  createMidiPreset({ id: id(suffix), name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight })
);

export const modernRnb = {
  substyle: createSubstyle({
    id: substyleId,
    familyId,
    name: 'Modern R&B',
    description: 'Rich-color modern R&B with smoother cadence, borrowed turns, and voice-leading-friendly progression shapes.',
    tags: ['rnb', 'smooth', 'rich_color', 'section_aware'],
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
    mustIncludeTags: ['rnb', 'rich_color'],
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
