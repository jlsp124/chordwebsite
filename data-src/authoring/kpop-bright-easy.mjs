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
const substyleId = 'kpop_bright_easy';
const id = (suffix) => `${substyleId}_${suffix}`;
const scope = styleScope(familyId, substyleId);

const slotProfile = {
  tonic: { allowedDecorations: ['add9', 'maj7', '6'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  tonic_family: { allowedDecorations: ['add9', '6', 'maj7'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  predominant: { allowedDecorations: ['add9', 'sus2', '6'], allowedSlashBassDegrees: ['6'], forbidOnLowSpice: false },
  dominant: { allowedDecorations: ['sus4', '7', 'add9'], allowedSlashBassDegrees: ['7'], forbidOnLowSpice: true },
  contrast: { allowedDecorations: ['sus2', 'add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: true },
  default: { allowedDecorations: ['add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: false }
};

const cadenceProfiles = [
  ['open_loop', 'Open Hook Loop', 'open_loop', ['predominant', 'dominant'], 0.42, ['full_loop', 'verse'], 1],
  ['clean_release', 'Clean Chorus Release', 'soft_resolve', ['tonic', 'tonic_family'], 0.78, ['chorus'], 1],
  ['pre_lift', 'Pre-Chorus Lift', 'lift_without_arrival', ['dominant', 'contrast'], 0.67, ['pre_chorus'], 1]
].map(([suffix, name, type, allowedEndFunctions, strength, commonUseCases, weight]) =>
  createCadenceProfile({ id: id(suffix), name, type, allowedEndFunctions, strength, commonUseCases, weight })
);

const harmonicRhythmProfiles = [
  ['mid_pulse', 'Mid Pulse', 'medium', [4, 4, 4, 4], ['full_loop', 'verse', 'chorus']],
  ['lift_drive', 'Lift Drive', 'active', [2, 2, 2, 2, 2, 2, 2, 2], ['pre_chorus', 'chorus']],
  ['wide_hold', 'Wide Hold', 'slow', [8, 8], ['bridge']]
].map(([suffix, name, density, beatsPerChangePattern, commonUseCases]) =>
  createHarmonicRhythmProfile({ id: id(suffix), name, density, beatsPerChangePattern, commonUseCases })
);

const archetypes = [
  ['hook_loop', 'Hook Loop', ['I', 'V', 'vi', 'IV'], ['tonic', 'dominant', 'tonic_family', 'predominant'], 'mid_pulse', ['full_loop', 'verse'], 'open_loop', 0.95, ['stable', 'lift', 'soft_drop', 'open'], ['bright', 'hook_forward', 'loop_core'], 1],
  ['chorus_window', 'Chorus Window', ['vi', 'IV', 'I', 'V'], ['tonic_family', 'predominant', 'tonic', 'dominant'], 'lift_drive', ['pre_chorus', 'chorus'], 'soft_resolve', 0.84, ['held_tension', 'lift', 'release', 'open'], ['bright', 'chorus_payoff', 'section_peak'], 1],
  ['sunrise_walk', 'Sunrise Walk', ['I', 'iii', 'IV', 'V'], ['tonic', 'tonic_family', 'predominant', 'dominant'], 'mid_pulse', ['verse', 'chorus'], 'soft_resolve', 0.8, ['stable', 'glide', 'lift', 'open'], ['bright', 'optimistic', 'clean_motion'], 0.86],
  ['lift_lane', 'Lift Lane', ['IV', 'V', 'iii', 'vi'], ['predominant', 'dominant', 'tonic_family', 'tonic_family'], 'lift_drive', ['pre_chorus'], 'lift_without_arrival', 0.7, ['lift', 'push', 'hover', 'held_tension'], ['lift_ready', 'pre_chorus_energy', 'bright'], 0.92],
  ['tonic_delay', 'Tonic Delay', ['I', 'V', 'IV', 'vi'], ['tonic', 'dominant', 'predominant', 'tonic_family'], 'lift_drive', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.76, ['stable', 'push', 'lift', 'held_tension'], ['delay_ready', 'hook_forward', 'bright'], 0.88],
  ['smile_turn', 'Smile Turn', ['vi', 'V', 'IV', 'V'], ['tonic_family', 'dominant', 'predominant', 'dominant'], 'lift_drive', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.74, ['soft_drop', 'push', 'lift', 'held_tension'], ['pre_chorus_energy', 'turnback', 'bright'], 0.82],
  ['clear_climb', 'Clear Climb', ['I', 'IV', 'ii', 'V'], ['tonic', 'predominant', 'predominant', 'dominant'], 'mid_pulse', ['verse', 'pre_chorus'], 'soft_resolve', 0.77, ['stable', 'open', 'lift', 'push'], ['clean_motion', 'uplift', 'bright'], 0.78],
  ['glass_rise', 'Glass Rise', ['ii', 'V', 'I', 'vi'], ['predominant', 'dominant', 'tonic', 'tonic_family'], 'lift_drive', ['pre_chorus', 'chorus'], 'soft_resolve', 0.73, ['lift', 'push', 'release', 'float'], ['section_peak', 'release', 'bright'], 0.84],
  ['sunny_turnaround', 'Sunny Turnaround', ['IV', 'I', 'V', 'vi'], ['predominant', 'tonic', 'dominant', 'tonic_family'], 'mid_pulse', ['full_loop', 'verse'], 'open_loop', 0.83, ['open', 'stable', 'push', 'soft_drop'], ['loop_core', 'bright', 'easy_listening'], 0.8],
  ['homecoming', 'Homecoming', ['I', 'vi', 'IV', 'V'], ['tonic', 'tonic_family', 'predominant', 'dominant'], 'mid_pulse', ['chorus', 'full_loop'], 'soft_resolve', 0.9, ['stable', 'soft_drop', 'lift', 'open'], ['chorus_payoff', 'bright', 'easy_listening'], 0.98],
  ['open_sky', 'Open Sky', ['IV', 'V', 'I', 'I'], ['predominant', 'dominant', 'tonic', 'tonic'], 'lift_drive', ['chorus'], 'strong_resolve', 0.68, ['lift', 'push', 'release', 'settle'], ['section_peak', 'anthemic', 'bright'], 0.75],
  ['pre_climb', 'Pre Climb', ['vi', 'ii', 'IV', 'V'], ['tonic_family', 'predominant', 'predominant', 'dominant'], 'lift_drive', ['pre_chorus'], 'lift_without_arrival', 0.69, ['soft_drop', 'lift', 'rise', 'push'], ['pre_chorus_energy', 'bass_climb_ready', 'bright'], 0.87],
  ['light_pedal', 'Light Pedal', ['I', 'I', 'IV', 'V'], ['tonic', 'tonic', 'predominant', 'dominant'], 'mid_pulse', ['full_loop', 'verse'], 'open_loop', 0.89, ['stable', 'settle', 'open', 'push'], ['easy_listening', 'pedal_hook', 'bright'], 0.71],
  ['melodic_reset', 'Melodic Reset', ['iii', 'vi', 'IV', 'V'], ['tonic_family', 'tonic_family', 'predominant', 'dominant'], 'mid_pulse', ['verse', 'pre_chorus'], 'soft_resolve', 0.76, ['glide', 'soft_drop', 'lift', 'push'], ['clean_motion', 'reset', 'bright'], 0.74],
  ['bridge_clear', 'Bridge Clear', ['ii', 'iii', 'IV', 'I'], ['predominant', 'tonic_family', 'predominant', 'tonic'], 'wide_hold', ['bridge'], 'contrastive', 0.58, ['open', 'hover', 'lift', 'release'], ['bridge_contrast', 'clear_air', 'bright'], 0.68]
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
    preferredArchetypeTags: ['loop_core', 'easy_listening'],
    allowedVariationTypes: ['safer', 'brighter', 'more_open'],
    allowedSpecialMoveIds: [id('last_bar_tilt')],
    forbiddenTags: ['heavy_dissonance'],
    energyShape: 'stable'
  }),
  verseRules: createSectionRuleBlock({
    preferredCadenceTypes: ['open_loop'],
    preferredRhythmDensities: ['medium'],
    preferredArchetypeTags: ['hook_forward', 'clean_motion'],
    allowedVariationTypes: ['safer', 'brighter'],
    allowedSpecialMoveIds: [id('last_bar_tilt')],
    forbiddenTags: ['heavy_dissonance'],
    energyShape: 'grounded'
  }),
  preChorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['lift_without_arrival'],
    preferredRhythmDensities: ['active'],
    preferredArchetypeTags: ['pre_chorus_energy', 'bass_climb_ready'],
    allowedVariationTypes: ['pre_chorus_lift', 'more_open'],
    allowedSpecialMoveIds: [id('delay_arrival'), id('bass_climb')],
    forbiddenTags: ['pedal_hook'],
    energyShape: 'rising'
  }),
  chorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['soft_resolve', 'strong_resolve'],
    preferredRhythmDensities: ['medium', 'active'],
    preferredArchetypeTags: ['chorus_payoff', 'section_peak'],
    allowedVariationTypes: ['chorus_payoff', 'brighter', 'more_resolved'],
    allowedSpecialMoveIds: [id('delay_arrival'), id('chorus_widen')],
    forbiddenTags: ['heavy_dissonance'],
    energyShape: 'release'
  }),
  bridgeRules: createSectionRuleBlock({
    preferredCadenceTypes: ['contrastive'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['bridge_contrast', 'clear_air'],
    allowedVariationTypes: ['bridge_contrast', 'darker'],
    allowedSpecialMoveIds: [id('bridge_reframe')],
    forbiddenTags: ['loop_core'],
    energyShape: 'contrast'
  })
});

const spicinessTransforms = [
  ['clean_color', 'Clean Color', 1, ['add9', 'sus2', '6'], ['tonic', 'predominant'], ['bridge'], ['heavy_dissonance'], 1],
  ['hook_polish', 'Hook Polish', 2, ['add9', 'maj7', 'sus2'], ['tonic', 'tonic_family', 'predominant'], [], ['heavy_dissonance'], 1],
  ['chorus_sheen', 'Chorus Sheen', 3, ['add9', 'maj7', 'sus4'], ['tonic', 'dominant', 'predominant'], ['full_loop'], ['heavy_dissonance'], 0.9]
].map(([suffix, name, level, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight]) =>
  createSpicinessTransform({ id: id(suffix), name, level, styleScope: scope, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight })
);

const variationRules = [
  ['safer_loop', 'Safer Loop', 'safer', ['full_loop', 'verse'], ['hook_recognition', 'loop_length'], ['decoration_reduction', 'cleaner_turnback'], ['loop_core'], ['heavy_dissonance'], 1],
  ['brighter_hook', 'Brighter Hook', 'brighter', ['full_loop', 'chorus'], ['roman_root_path', 'hook_role'], ['tonic_color', 'upper_extension'], ['bright'], ['heavy_dissonance'], 0.92],
  ['more_open_turn', 'More Open Turn', 'more_open', ['full_loop', 'verse'], ['hook_shape'], ['last_slot_openness', 'cadence_softening'], ['loop_core'], ['heavy_dissonance'], 0.88],
  ['pre_lift_rule', 'Pre Lift', 'pre_chorus_lift', ['pre_chorus'], ['section_role', 'topline_space'], ['dominant_pull', 'last_bar_motion'], ['pre_chorus_energy'], ['pedal_hook'], 1],
  ['chorus_payoff_rule', 'Chorus Payoff', 'chorus_payoff', ['chorus'], ['section_role', 'hook_recognition'], ['arrival_weight', 'tonic_brightness'], ['chorus_payoff'], ['heavy_dissonance'], 1]
].map(([suffix, name, type, allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight]) =>
  createVariationRule({ id: id(suffix), name, type, styleScope: [substyleId], allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight })
);

const specialMoves = [
  ['delay_arrival', 'Delay Arrival', 'section_lift', ['pre_chorus', 'chorus'], ['delay_ready', 'section_peak'], 'delay_tonic_arrival', 1],
  ['bass_climb', 'Bass Climb Lead-In', 'lead_in', ['pre_chorus'], ['bass_climb_ready', 'pre_chorus_energy'], 'bass_climb_lead_in', 0.92],
  ['chorus_widen', 'Chorus Widen', 'payoff', ['chorus'], ['chorus_payoff', 'section_peak'], 'chorus_payoff_widen', 0.94],
  ['last_bar_tilt', 'Last Bar Tilt', 'turnback', ['full_loop', 'verse'], ['turnback', 'loop_core'], 'last_bar_tilt', 0.82],
  ['bridge_reframe', 'Bridge Reframe', 'bridge', ['bridge'], ['bridge_contrast', 'clear_air'], 'bridge_reframe', 0.8]
].map(([suffix, name, category, allowedSectionIntents, triggerTags, operation, weight]) =>
  createSpecialMove({ id: id(suffix), name, category, styleScope: [substyleId], allowedSectionIntents, triggerTags, operation, weight })
);

const explanationTemplates = [
  ['why', 'why_it_works', ['full_loop', 'chorus'], 'producer_first', 'This {sectionIntent} stays bright by keeping the hook readable while the cadence leans {cadenceType} instead of overcomplicating the loop.', ['sectionIntent', 'cadenceType']],
  ['section', 'section_idea', ['pre_chorus', 'chorus'], 'learning_aware', 'In {sectionIntent}, {substyleName} usually increases lift through cleaner dominant pull and a brighter payoff slot.', ['sectionIntent', 'substyleName']],
  ['learn', 'learn', ['full_loop', 'verse', 'pre_chorus', 'chorus'], 'learning_aware', 'Notice how {rhythmName} keeps the progression producer-friendly: the harmony moves enough to feel polished, but the loop still leaves topline space.', ['rhythmName']]
].map(([suffix, templateType, sectionIntentScope, tone, content, requiredPlaceholders]) =>
  createExplanationTemplate({ id: id(suffix), templateType, styleScope: [substyleId], sectionIntentScope, tone, content, requiredPlaceholders })
);

const midiPresets = [
  ['block', 'Bright Block', 'block', ['bright', 'hook_forward'], 'tight_pop_stack', [50, 78], 'bar_hits', 'medium_even', 'clean_bar_sustain', 1],
  ['arp', 'Bright Arp', 'arp', ['bright', 'easy_listening'], 'light_upper_motion', [55, 84], 'eighth_note_lift', 'gentle_rise', 'phrase_sustain', 0.8]
].map(([suffix, name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight]) =>
  createMidiPreset({ id: id(suffix), name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight })
);

export const kpopBrightEasy = {
  substyle: createSubstyle({
    id: substyleId,
    familyId,
    name: 'K-pop Bright Easy-Listening',
    description: 'Polished major-key K-pop with clean hook loops, clear lift, and easy-listening payoff.',
    tags: ['bright', 'easy_listening', 'hook_forward', 'section_aware'],
    modeBias: 'section_first',
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
    mustIncludeTags: ['bright', 'hook_forward'],
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
