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
const substyleId = 'melodic_trap';
const id = (suffix) => `${substyleId}_${suffix}`;
const scope = styleScope(familyId, substyleId);

const slotProfile = {
  tonic: { allowedDecorations: ['add9', 'min7'], allowedSlashBassDegrees: ['5'], forbidOnLowSpice: false },
  tonic_family: { allowedDecorations: ['add9', 'min7', '11'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  predominant: { allowedDecorations: ['sus2', '11'], allowedSlashBassDegrees: ['6'], forbidOnLowSpice: false },
  dominant: { allowedDecorations: ['7', 'sus4'], allowedSlashBassDegrees: ['7'], forbidOnLowSpice: true },
  contrast: { allowedDecorations: ['add9', 'maj7'], allowedSlashBassDegrees: [], forbidOnLowSpice: true },
  default: { allowedDecorations: ['add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: false }
};

const cadenceProfiles = [
  ['open_loop', 'Open Loop', 'open_loop', ['contrast', 'dominant'], 0.46, ['full_loop', 'verse'], 1],
  ['last_bar_release', 'Last-Bar Release', 'soft_resolve', ['tonic', 'tonic_family'], 0.6, ['chorus'], 0.8],
  ['tilted_push', 'Tilted Push', 'lift_without_arrival', ['dominant', 'contrast'], 0.64, ['pre_chorus', 'bridge'], 0.82]
].map(([suffix, name, type, allowedEndFunctions, strength, commonUseCases, weight]) =>
  createCadenceProfile({ id: id(suffix), name, type, allowedEndFunctions, strength, commonUseCases, weight })
);

const harmonicRhythmProfiles = [
  ['slow_drag', 'Slow Drag', 'slow', [8, 8], ['full_loop', 'verse']],
  ['mid_roll', 'Mid Roll', 'medium', [4, 4, 4, 4], ['full_loop', 'chorus']],
  ['tilt_turn', 'Tilt Turn', 'variable', [8, 4, 4], ['pre_chorus', 'bridge']]
].map(([suffix, name, density, beatsPerChangePattern, commonUseCases]) =>
  createHarmonicRhythmProfile({ id: id(suffix), name, density, beatsPerChangePattern, commonUseCases })
);

const archetypes = [
  ['noir_core', 'Noir Core', ['i', 'VI', 'III', 'VII'], ['tonic', 'contrast', 'tonic_family', 'dominant'], 'mid_roll', ['full_loop', 'verse'], 'open_loop', 0.95, ['stable', 'expand', 'glow', 'open'], ['trap', 'loop_core', 'dark'], 1],
  ['lament_loop', 'Lament Loop', ['i', 'iv', 'VI', 'v'], ['tonic', 'predominant', 'contrast', 'dominant'], 'mid_roll', ['full_loop', 'verse'], 'open_loop', 0.87, ['stable', 'darken', 'expand', 'open'], ['melodic', 'dark', 'loop_core'], 0.9],
  ['glass_loop', 'Glass Loop', ['i', 'VII', 'VI', 'VII'], ['tonic', 'dominant', 'contrast', 'dominant'], 'slow_drag', ['full_loop', 'verse'], 'open_loop', 0.93, ['stable', 'push', 'shadow', 'open'], ['loop_core', 'cold', 'trap'], 0.92],
  ['minor_roll', 'Minor Roll', ['i', 'VI', 'i', 'VII'], ['tonic', 'contrast', 'tonic', 'dominant'], 'mid_roll', ['full_loop', 'chorus'], 'open_loop', 0.91, ['stable', 'expand', 'reset', 'open'], ['loop_core', 'pedal_low', 'trap'], 0.86],
  ['shadow_bounce', 'Shadow Bounce', ['i', 'III', 'VII', 'VII'], ['tonic', 'tonic_family', 'dominant', 'dominant'], 'slow_drag', ['full_loop', 'verse'], 'open_loop', 0.88, ['stable', 'glow', 'push', 'open'], ['melodic', 'hook_forward', 'trap'], 0.82],
  ['narrow_drop', 'Narrow Drop', ['i', 'i', 'VI', 'VII'], ['tonic', 'tonic', 'contrast', 'dominant'], 'slow_drag', ['full_loop', 'chorus'], 'open_loop', 0.94, ['stable', 'anchor', 'expand', 'open'], ['drop_ready', 'pedal_low', 'trap'], 0.89],
  ['hook_hold', 'Hook Hold', ['i', 'iv', 'i', 'VI'], ['tonic', 'predominant', 'tonic', 'contrast'], 'mid_roll', ['full_loop', 'verse'], 'open_loop', 0.85, ['stable', 'darken', 'reset', 'expand'], ['melodic', 'hook_forward', 'dark'], 0.81],
  ['rise_tilt', 'Rise Tilt', ['i', 'VI', 'VII', 'VII'], ['tonic', 'contrast', 'dominant', 'dominant'], 'tilt_turn', ['chorus', 'pre_chorus'], 'lift_without_arrival', 0.74, ['stable', 'expand', 'push', 'tilt'], ['turnback', 'trap', 'dark'], 0.78],
  ['moody_two_step', 'Moody Two-Step', ['i', 'VI'], ['tonic', 'contrast'], 'slow_drag', ['full_loop', 'verse'], 'open_loop', 0.97, ['stable', 'open'], ['minimal', 'loop_core', 'trap'], 0.83],
  ['distant_memory', 'Distant Memory', ['VI', 'i', 'VII', 'i'], ['contrast', 'tonic', 'dominant', 'tonic'], 'mid_roll', ['chorus', 'verse'], 'soft_resolve', 0.73, ['expand', 'tease', 'push', 'reset'], ['melodic', 'memory', 'trap'], 0.74],
  ['unstable_pull', 'Unstable Pull', ['i', 'v', 'VI', 'VII'], ['tonic', 'dominant', 'contrast', 'dominant'], 'tilt_turn', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.72, ['stable', 'push', 'expand', 'held_tension'], ['pre_lift', 'dark', 'trap'], 0.76],
  ['cold_turn', 'Cold Turn', ['i', 'VII', 'i', 'v'], ['tonic', 'dominant', 'tonic', 'dominant'], 'mid_roll', ['full_loop', 'verse'], 'open_loop', 0.86, ['stable', 'push', 'reset', 'open'], ['cold', 'loop_core', 'trap'], 0.77],
  ['open_minor', 'Open Minor', ['i', 'III', 'VI', 'VII'], ['tonic', 'tonic_family', 'contrast', 'dominant'], 'mid_roll', ['chorus', 'full_loop'], 'open_loop', 0.8, ['stable', 'glow', 'expand', 'open'], ['melodic', 'wide', 'trap'], 0.75],
  ['smoke_arc', 'Smoke Arc', ['i', 'iv', 'VII', 'III'], ['tonic', 'predominant', 'dominant', 'tonic_family'], 'tilt_turn', ['bridge', 'chorus'], 'contrastive', 0.62, ['stable', 'darken', 'push', 'glow'], ['bridge_contrast', 'smoke', 'trap'], 0.68],
  ['descent_frame', 'Descent Frame', ['i', 'VI', 'iv', 'VII'], ['tonic', 'contrast', 'predominant', 'dominant'], 'mid_roll', ['full_loop', 'verse'], 'open_loop', 0.84, ['stable', 'expand', 'darken', 'open'], ['descent', 'loop_core', 'trap'], 0.79]
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
    preferredArchetypeTags: ['loop_core', 'minimal'],
    allowedVariationTypes: ['safer', 'darker', 'more_open'],
    allowedSpecialMoveIds: [id('groove_lock'), id('last_bar_tilt')],
    forbiddenTags: ['blunt_major'],
    energyShape: 'locked'
  }),
  verseRules: createSectionRuleBlock({
    preferredCadenceTypes: ['open_loop'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['loop_core', 'hook_forward'],
    allowedVariationTypes: ['safer', 'darker'],
    allowedSpecialMoveIds: [id('groove_lock'), id('last_bar_tilt')],
    forbiddenTags: ['blunt_major'],
    energyShape: 'steady'
  }),
  preChorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['lift_without_arrival'],
    preferredRhythmDensities: ['variable'],
    preferredArchetypeTags: ['pre_lift', 'turnback'],
    allowedVariationTypes: ['pre_chorus_lift', 'more_open'],
    allowedSpecialMoveIds: [id('last_bar_tilt'), id('dominant_pressure')],
    forbiddenTags: ['minimal'],
    energyShape: 'pressure'
  }),
  chorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['open_loop', 'soft_resolve'],
    preferredRhythmDensities: ['medium'],
    preferredArchetypeTags: ['drop_ready', 'melodic'],
    allowedVariationTypes: ['chorus_payoff', 'darker'],
    allowedSpecialMoveIds: [id('groove_lock'), id('last_bar_tilt')],
    forbiddenTags: ['blunt_major'],
    energyShape: 'lifted_loop'
  }),
  bridgeRules: createSectionRuleBlock({
    preferredCadenceTypes: ['contrastive'],
    preferredRhythmDensities: ['variable'],
    preferredArchetypeTags: ['bridge_contrast', 'smoke'],
    allowedVariationTypes: ['bridge_contrast', 'darker'],
    allowedSpecialMoveIds: [id('last_bar_tilt')],
    forbiddenTags: ['minimal'],
    energyShape: 'reframe'
  })
});

const spicinessTransforms = [
  ['low_color', 'Low Color', 1, ['add9', 'min7'], ['tonic', 'tonic_family'], [], ['blunt_major'], 1],
  ['trap_glow', 'Trap Glow', 2, ['add9', '11', 'sus2'], ['tonic', 'contrast', 'predominant'], [], ['blunt_major'], 1],
  ['edge_tilt', 'Edge Tilt', 3, ['11', 'sus4', 'b9'], ['dominant', 'contrast'], ['full_loop'], ['blunt_major'], 0.84]
].map(([suffix, name, level, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight]) =>
  createSpicinessTransform({ id: id(suffix), name, level, styleScope: scope, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight })
);

const variationRules = [
  ['safer_loop', 'Safer Loop', 'safer', ['full_loop', 'verse'], ['groove_space', 'root_identity'], ['surface_simplify', 'cleaner_last_bar'], ['loop_core'], ['blunt_major'], 1],
  ['darker_pull', 'Darker Pull', 'darker', ['full_loop', 'verse', 'chorus'], ['loop_identity'], ['contrast_shadow', 'minor_weight'], ['dark'], ['blunt_major'], 0.95],
  ['more_open_loop', 'More Open Loop', 'more_open', ['full_loop', 'chorus'], ['groove_space'], ['last_slot_openness', 'cadence_softening'], ['melodic'], ['blunt_major'], 0.82],
  ['pre_lift_rule', 'Tilt Lift', 'pre_chorus_lift', ['pre_chorus'], ['loop_identity', '808_space'], ['last_bar_motion', 'dominant_pressure'], ['turnback'], ['minimal'], 0.9],
  ['chorus_payoff_rule', 'Loop Payoff', 'chorus_payoff', ['chorus'], ['loop_identity'], ['arrival_width', 'hook_emphasis'], ['drop_ready'], ['blunt_major'], 0.86]
].map(([suffix, name, type, allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight]) =>
  createVariationRule({ id: id(suffix), name, type, styleScope: [substyleId], allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight })
);

const specialMoves = [
  ['groove_lock', 'Groove Lock', 'groove', ['full_loop', 'verse', 'chorus'], ['loop_core', 'minimal'], 'groove_lock', 1],
  ['last_bar_tilt', 'Last Bar Tilt', 'turnback', ['full_loop', 'pre_chorus', 'bridge'], ['turnback', 'descent'], 'last_bar_tilt', 0.9],
  ['dominant_pressure', 'Dominant Pressure', 'tension', ['pre_chorus', 'chorus'], ['pre_lift', 'turnback'], 'dominant_pressure', 0.72],
  ['trap_soul_enrich', 'Trap-Soul Enrich', 'color', ['chorus', 'bridge'], ['melodic', 'memory'], 'trap_soul_enrich', 0.68]
].map(([suffix, name, category, allowedSectionIntents, triggerTags, operation, weight]) =>
  createSpecialMove({ id: id(suffix), name, category, styleScope: [substyleId], allowedSectionIntents, triggerTags, operation, weight })
);

const explanationTemplates = [
  ['why', 'why_it_works', ['full_loop', 'chorus'], 'producer_first', 'This {sectionIntent} works because the loop stays planted. The harmony adds motion, but it never steals space from the groove or vocal pocket.', ['sectionIntent']],
  ['section', 'section_idea', ['pre_chorus', 'bridge'], 'learning_aware', 'In {sectionIntent}, melodic trap usually changes direction through the last bar, not through a whole new chord world.', ['sectionIntent']],
  ['learn', 'learn', ['full_loop', 'verse', 'chorus'], 'learning_aware', 'If {cadenceType} starts feeling too strong, the progression stops sounding trap-first. Keep the loop identity louder than the resolution.', ['cadenceType']]
].map(([suffix, templateType, sectionIntentScope, tone, content, requiredPlaceholders]) =>
  createExplanationTemplate({ id: id(suffix), templateType, styleScope: [substyleId], sectionIntentScope, tone, content, requiredPlaceholders })
);

const midiPresets = [
  ['block', 'Melodic Trap Block', 'block', ['trap', 'dark'], 'low_mid_stack', [42, 70], 'bar_hits', 'firm_even', 'tight_bar_sustain', 1],
  ['comp', 'Melodic Trap Comp', 'comp', ['melodic', 'trap'], 'short_mid_stabs', [45, 72], 'restrained_syncopation', 'accented_even', 'short_release', 0.6]
].map(([suffix, name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight]) =>
  createMidiPreset({ id: id(suffix), name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight })
);

export const melodicTrap = {
  substyle: createSubstyle({
    id: substyleId,
    familyId,
    name: 'Melodic Trap',
    description: 'Loop-first melodic trap with dark minor cycles, tilted turnbacks, and restrained harmonic movement.',
    tags: ['trap', 'loop_first', 'dark', 'melodic'],
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
    mustIncludeTags: ['trap', 'loop_core'],
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
