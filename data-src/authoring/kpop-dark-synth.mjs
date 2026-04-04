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

const familyId = 'kpop';
const substyleId = 'kpop_dark_synth';
const id = (suffix) => `${substyleId}_${suffix}`;
const scope = styleScope(familyId, substyleId);

const slotProfile = {
  tonic: { allowedDecorations: ['add9', 'min7'], allowedSlashBassDegrees: ['5'], forbidOnLowSpice: false },
  tonic_family: { allowedDecorations: ['min7', 'add11'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  predominant: { allowedDecorations: ['sus2', '11', 'add9'], allowedSlashBassDegrees: ['6'], forbidOnLowSpice: false },
  dominant: { allowedDecorations: ['7', 'sus4', 'b9'], allowedSlashBassDegrees: ['7'], forbidOnLowSpice: true },
  contrast: { allowedDecorations: ['add9', 'maj7', '#11'], allowedSlashBassDegrees: [], forbidOnLowSpice: true },
  default: { allowedDecorations: ['add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: false }
};

const cadenceProfiles = [
  ['shadow_loop', 'Shadow Loop', 'open_loop', ['contrast', 'dominant'], 0.48, ['full_loop', 'verse'], 1],
  ['drop_release', 'Drop Release', 'strong_resolve', ['tonic', 'dominant'], 0.82, ['chorus'], 1],
  ['build_pull', 'Build Pull', 'lift_without_arrival', ['dominant', 'contrast'], 0.7, ['pre_chorus', 'bridge'], 1]
].map(([suffix, name, type, allowedEndFunctions, strength, commonUseCases, weight]) =>
  createCadenceProfile({ id: id(suffix), name, type, allowedEndFunctions, strength, commonUseCases, weight })
);

const harmonicRhythmProfiles = [
  ['locked_grid', 'Locked Grid', 'medium', [4, 4, 4, 4], ['full_loop', 'verse']],
  ['build_drive', 'Build Drive', 'active', [2, 2, 2, 2, 2, 2, 2, 2], ['pre_chorus', 'chorus']],
  ['drop_hold', 'Drop Hold', 'slow', [8, 8], ['chorus', 'bridge']]
].map(([suffix, name, density, beatsPerChangePattern, commonUseCases]) =>
  createHarmonicRhythmProfile({ id: id(suffix), name, density, beatsPerChangePattern, commonUseCases })
);

const archetypes = [
  ['shadow_cycle', 'Shadow Cycle', ['i', 'VI', 'III', 'VII'], ['tonic', 'contrast', 'tonic_family', 'dominant'], 'locked_grid', ['full_loop', 'verse'], 'open_loop', 0.94, ['stable', 'broaden', 'glow', 'open'], ['dark', 'synth', 'loop_core'], 1],
  ['neon_drop', 'Neon Drop', ['i', 'v', 'VI', 'VII'], ['tonic', 'dominant', 'contrast', 'dominant'], 'build_drive', ['chorus'], 'strong_resolve', 0.78, ['stable', 'push', 'expand', 'drop'], ['drop_ready', 'dark', 'synth'], 0.96],
  ['glass_minor', 'Glass Minor', ['i', 'iv', 'VI', 'V'], ['tonic', 'predominant', 'contrast', 'dominant'], 'locked_grid', ['verse', 'chorus'], 'strong_resolve', 0.8, ['stable', 'darken', 'expand', 'push'], ['dark', 'emphatic', 'drop_ready'], 0.88],
  ['chrome_lift', 'Chrome Lift', ['VI', 'VII', 'i', 'v'], ['contrast', 'dominant', 'tonic', 'dominant'], 'build_drive', ['pre_chorus'], 'lift_without_arrival', 0.7, ['expand', 'push', 'tease', 'held_tension'], ['pre_chorus_energy', 'drop_ready', 'synth'], 0.92],
  ['machine_turn', 'Machine Turn', ['i', 'VII', 'VI', 'VII'], ['tonic', 'dominant', 'contrast', 'dominant'], 'locked_grid', ['full_loop', 'verse'], 'open_loop', 0.91, ['stable', 'push', 'shadow', 'open'], ['loop_core', 'dark', 'mechanical'], 0.84],
  ['hollow_hook', 'Hollow Hook', ['i', 'III', 'VII', 'VI'], ['tonic', 'tonic_family', 'dominant', 'contrast'], 'locked_grid', ['full_loop', 'chorus'], 'open_loop', 0.87, ['stable', 'glow', 'push', 'open'], ['dark', 'hook_forward', 'synth'], 0.83],
  ['synth_pull', 'Synth Pull', ['iv', 'VI', 'i', 'V'], ['predominant', 'contrast', 'tonic', 'dominant'], 'build_drive', ['pre_chorus', 'chorus'], 'strong_resolve', 0.72, ['darken', 'expand', 'tease', 'push'], ['drop_ready', 'pull_forward', 'dark'], 0.81],
  ['cold_arrival', 'Cold Arrival', ['VI', 'i', 'VII', 'V'], ['contrast', 'tonic', 'dominant', 'dominant'], 'drop_hold', ['chorus'], 'strong_resolve', 0.67, ['expand', 'tease', 'push', 'drop'], ['chorus_payoff', 'cold', 'dark'], 0.76],
  ['midnight_axis', 'Midnight Axis', ['i', 'v', 'i', 'VII'], ['tonic', 'dominant', 'tonic', 'dominant'], 'locked_grid', ['full_loop', 'verse'], 'open_loop', 0.88, ['stable', 'push', 'reset', 'open'], ['loop_core', 'focused', 'dark'], 0.79],
  ['tension_spiral', 'Tension Spiral', ['i', 'VI', 'iv', 'V'], ['tonic', 'contrast', 'predominant', 'dominant'], 'build_drive', ['pre_chorus'], 'lift_without_arrival', 0.66, ['stable', 'expand', 'darken', 'push'], ['pre_chorus_energy', 'spiral', 'dark'], 0.86],
  ['reverse_glow', 'Reverse Glow', ['III', 'VII', 'i', 'VI'], ['tonic_family', 'dominant', 'tonic', 'contrast'], 'drop_hold', ['bridge', 'chorus'], 'contrastive', 0.63, ['glow', 'push', 'reveal', 'shadow'], ['bridge_contrast', 'futuristic', 'dark'], 0.72],
  ['wide_minor', 'Wide Minor', ['i', 'VI', 'iv', 'VII'], ['tonic', 'contrast', 'predominant', 'dominant'], 'locked_grid', ['full_loop', 'verse'], 'open_loop', 0.85, ['stable', 'expand', 'darken', 'open'], ['loop_core', 'wide', 'dark'], 0.77],
  ['drop_frame', 'Drop Frame', ['i', 'i', 'VI', 'VII'], ['tonic', 'tonic', 'contrast', 'dominant'], 'drop_hold', ['chorus', 'full_loop'], 'open_loop', 0.89, ['stable', 'anchor', 'expand', 'drop'], ['drop_ready', 'pedal_dark', 'synth'], 0.82],
  ['pre_echo', 'Pre Echo', ['VI', 'V', 'i', 'VII'], ['contrast', 'dominant', 'tonic', 'dominant'], 'build_drive', ['pre_chorus'], 'lift_without_arrival', 0.68, ['expand', 'push', 'tease', 'held_tension'], ['pre_chorus_energy', 'bass_climb_ready', 'dark'], 0.8],
  ['bridge_mirror', 'Bridge Mirror', ['iv', 'i', 'VI', 'III'], ['predominant', 'tonic', 'contrast', 'tonic_family'], 'drop_hold', ['bridge'], 'contrastive', 0.55, ['darken', 'reveal', 'expand', 'glow'], ['bridge_contrast', 'mirror', 'dark'], 0.69]
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
    preferredArchetypeTags: ['loop_core', 'dark'],
    allowedVariationTypes: ['safer', 'darker'],
    allowedSpecialMoveIds: [id('drop_simplify')],
    forbiddenTags: ['sunny_major'],
    energyShape: 'locked'
  }),
  verseRules: createSectionRuleBlock({
    preferredCadenceTypes: ['open_loop'],
    preferredRhythmDensities: ['medium'],
    preferredArchetypeTags: ['dark', 'hook_forward'],
    allowedVariationTypes: ['safer', 'darker', 'more_open'],
    allowedSpecialMoveIds: [id('drop_simplify')],
    forbiddenTags: ['sunny_major'],
    energyShape: 'cold'
  }),
  preChorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['lift_without_arrival'],
    preferredRhythmDensities: ['active'],
    preferredArchetypeTags: ['pre_chorus_energy', 'bass_climb_ready'],
    allowedVariationTypes: ['pre_chorus_lift', 'darker'],
    allowedSpecialMoveIds: [id('delay_arrival'), id('bass_climb')],
    forbiddenTags: ['pedal_dark'],
    energyShape: 'tightening'
  }),
  chorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['strong_resolve'],
    preferredRhythmDensities: ['slow', 'active'],
    preferredArchetypeTags: ['drop_ready', 'chorus_payoff'],
    allowedVariationTypes: ['chorus_payoff', 'more_resolved', 'darker'],
    allowedSpecialMoveIds: [id('drop_simplify'), id('chorus_widen')],
    forbiddenTags: ['sunny_major'],
    energyShape: 'drop_release'
  }),
  bridgeRules: createSectionRuleBlock({
    preferredCadenceTypes: ['contrastive', 'lift_without_arrival'],
    preferredRhythmDensities: ['slow', 'variable'],
    preferredArchetypeTags: ['bridge_contrast', 'futuristic'],
    allowedVariationTypes: ['bridge_contrast', 'more_open'],
    allowedSpecialMoveIds: [id('bridge_reframe')],
    forbiddenTags: ['loop_core'],
    energyShape: 'reframe'
  })
});

const spicinessTransforms = [
  ['low_glow', 'Low Glow', 1, ['add9', 'min7'], ['tonic', 'tonic_family'], [], ['sunny_major'], 1],
  ['tension_color', 'Tension Color', 2, ['add9', '11', 'sus4'], ['predominant', 'dominant', 'contrast'], [], ['sunny_major'], 1],
  ['edge_color', 'Edge Color', 3, ['b9', '#11', 'sus4'], ['dominant', 'contrast'], ['full_loop'], ['sunny_major'], 0.85]
].map(([suffix, name, level, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight]) =>
  createSpicinessTransform({ id: id(suffix), name, level, styleScope: scope, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight })
);

const variationRules = [
  ['safer_loop', 'Safer Dark Loop', 'safer', ['full_loop', 'verse'], ['loop_identity', 'drop_space'], ['contrast_reduction', 'simpler_surface'], ['loop_core'], ['sunny_major'], 1],
  ['darker_pull', 'Darker Pull', 'darker', ['verse', 'pre_chorus', 'chorus'], ['roman_root_path'], ['borrowed_pressure', 'dominant_edge'], ['dark'], ['sunny_major'], 0.96],
  ['more_open_drop', 'More Open Drop', 'more_open', ['chorus'], ['drop_role', 'low_end_space'], ['last_slot_release', 'contrast_width'], ['drop_ready'], ['sunny_major'], 0.82],
  ['pre_lift_rule', 'Pre-Drop Lift', 'pre_chorus_lift', ['pre_chorus'], ['section_role', 'drop_space'], ['dominant_pressure', 'bass_motion'], ['pre_chorus_energy'], ['pedal_dark'], 1],
  ['bridge_contrast_rule', 'Bridge Contrast', 'bridge_contrast', ['bridge'], ['dark_identity'], ['reframe', 'new_anchor'], ['bridge_contrast'], ['loop_core'], 0.94]
].map(([suffix, name, type, allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight]) =>
  createVariationRule({ id: id(suffix), name, type, styleScope: [substyleId], allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight })
);

const specialMoves = [
  ['delay_arrival', 'Delay Arrival', 'section_lift', ['pre_chorus', 'chorus'], ['pre_chorus_energy', 'drop_ready'], 'delay_tonic_arrival', 0.92],
  ['drop_simplify', 'Drop Simplify', 'drop', ['full_loop', 'chorus'], ['drop_ready', 'pedal_dark'], 'drop_simplify', 1],
  ['bass_climb', 'Bass Climb Lead-In', 'lead_in', ['pre_chorus'], ['bass_climb_ready', 'pre_chorus_energy'], 'bass_climb_lead_in', 0.9],
  ['chorus_widen', 'Chorus Widen', 'payoff', ['chorus'], ['chorus_payoff', 'drop_ready'], 'chorus_payoff_widen', 0.88],
  ['bridge_reframe', 'Bridge Reframe', 'bridge', ['bridge'], ['bridge_contrast', 'futuristic'], 'bridge_reframe', 0.86]
].map(([suffix, name, category, allowedSectionIntents, triggerTags, operation, weight]) =>
  createSpecialMove({ id: id(suffix), name, category, styleScope: [substyleId], allowedSectionIntents, triggerTags, operation, weight })
);

const explanationTemplates = [
  ['why', 'why_it_works', ['full_loop', 'chorus'], 'producer_first', 'This {sectionIntent} works because the dark loop identity stays intact while {specialMoveNames} can sharpen the drop or build without changing the core root path.', ['sectionIntent', 'specialMoveNames']],
  ['section', 'section_idea', ['pre_chorus', 'bridge'], 'learning_aware', 'For {sectionIntent}, {substyleName} leans on pressure and contrast more than sweetness, so the progression should feel like it is tightening or reframing.', ['sectionIntent', 'substyleName']],
  ['learn', 'learn', ['full_loop', 'verse', 'chorus'], 'learning_aware', 'The dark-synth trick is keeping {cadenceType} energy inside a repeatable loop. That lets the production feel heavy without turning the harmony into noise.', ['cadenceType']]
].map(([suffix, templateType, sectionIntentScope, tone, content, requiredPlaceholders]) =>
  createExplanationTemplate({ id: id(suffix), templateType, styleScope: [substyleId], sectionIntentScope, tone, content, requiredPlaceholders })
);

const midiPresets = [
  ['block', 'Dark Block', 'block', ['dark', 'drop_ready'], 'tight_low_mid_stack', [45, 74], 'bar_hits', 'firm_even', 'tight_bar_sustain', 1],
  ['comp', 'Dark Comp', 'comp', ['dark', 'synth'], 'staccato_mid_stabs', [48, 76], 'syncopated_stabs', 'accented_drop', 'short_release', 0.84]
].map(([suffix, name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight]) =>
  createMidiPreset({ id: id(suffix), name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight })
);

export const kpopDarkSynth = {
  substyle: createSubstyle({
    id: substyleId,
    familyId,
    name: 'K-pop Dark Synth / Futuristic',
    description: 'Darker synth-led K-pop with dramatic loop pressure, drop framing, and cinematic contrast.',
    tags: ['dark', 'synth', 'drop_ready', 'section_aware'],
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
    mustIncludeTags: ['dark', 'synth'],
    mustAvoidTags: ['sunny_major']
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
