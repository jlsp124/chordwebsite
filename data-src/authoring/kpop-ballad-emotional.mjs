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
const substyleId = 'kpop_ballad_emotional';
const id = (suffix) => `${substyleId}_${suffix}`;
const scope = styleScope(familyId, substyleId);

const slotProfile = {
  tonic: { allowedDecorations: ['add9', 'maj7', '6'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  tonic_family: { allowedDecorations: ['min7', 'add9', '11'], allowedSlashBassDegrees: ['3'], forbidOnLowSpice: false },
  predominant: { allowedDecorations: ['add9', '6', '11'], allowedSlashBassDegrees: ['6'], forbidOnLowSpice: false },
  dominant: { allowedDecorations: ['7', 'sus4', 'b9'], allowedSlashBassDegrees: ['7'], forbidOnLowSpice: true },
  contrast: { allowedDecorations: ['maj7', 'add9', '11'], allowedSlashBassDegrees: [], forbidOnLowSpice: false },
  default: { allowedDecorations: ['add9'], allowedSlashBassDegrees: [], forbidOnLowSpice: false }
};

const cadenceProfiles = [
  ['soft_return', 'Soft Return', 'soft_resolve', ['tonic', 'tonic_family'], 0.72, ['verse', 'chorus'], 1],
  ['tear_lift', 'Tear Lift', 'lift_without_arrival', ['dominant', 'contrast'], 0.74, ['pre_chorus'], 1],
  ['bridge_set', 'Bridge Reframe', 'contrastive', ['contrast', 'predominant'], 0.66, ['bridge'], 1]
].map(([suffix, name, type, allowedEndFunctions, strength, commonUseCases, weight]) =>
  createCadenceProfile({ id: id(suffix), name, type, allowedEndFunctions, strength, commonUseCases, weight })
);

const harmonicRhythmProfiles = [
  ['wide_hold', 'Wide Hold', 'slow', [8, 8], ['verse', 'bridge']],
  ['turnback_flow', 'Turnback Flow', 'medium', [4, 4, 4, 4], ['chorus']],
  ['rise_push', 'Rise Push', 'active', [2, 2, 4, 4, 2, 2], ['pre_chorus']]
].map(([suffix, name, density, beatsPerChangePattern, commonUseCases]) =>
  createHarmonicRhythmProfile({ id: id(suffix), name, density, beatsPerChangePattern, commonUseCases })
);

const archetypes = [
  ['warm_release', 'Warm Release', ['I', 'iii', 'vi', 'IV'], ['tonic', 'tonic_family', 'tonic_family', 'predominant'], 'turnback_flow', ['verse', 'chorus'], 'soft_resolve', 0.82, ['stable', 'lean', 'soft_drop', 'release'], ['emotional', 'open_heart', 'ballad_core'], 1],
  ['aching_turn', 'Aching Turn', ['vi', 'IV', 'I', 'V'], ['tonic_family', 'predominant', 'tonic', 'dominant'], 'turnback_flow', ['chorus', 'verse'], 'soft_resolve', 0.85, ['soft_drop', 'lift', 'release', 'open'], ['emotional', 'chorus_payoff', 'ballad_core'], 0.97],
  ['sigh_lift', 'Sigh Lift', ['IV', 'V', 'iii', 'vi'], ['predominant', 'dominant', 'tonic_family', 'tonic_family'], 'rise_push', ['pre_chorus'], 'lift_without_arrival', 0.68, ['open', 'push', 'hover', 'held_tension'], ['pre_chorus_energy', 'yearning', 'emotional'], 0.95],
  ['open_confession', 'Open Confession', ['I', 'vi', 'ii', 'V'], ['tonic', 'tonic_family', 'predominant', 'dominant'], 'wide_hold', ['verse', 'pre_chorus'], 'soft_resolve', 0.77, ['stable', 'soft_drop', 'lift', 'push'], ['open_heart', 'confessional', 'emotional'], 0.88],
  ['late_night_return', 'Late Night Return', ['vi', 'iii', 'IV', 'I'], ['tonic_family', 'tonic_family', 'predominant', 'tonic'], 'wide_hold', ['verse', 'chorus'], 'soft_resolve', 0.72, ['soft_drop', 'lean', 'lift', 'release'], ['emotional', 'afterglow', 'ballad_core'], 0.8],
  ['borrowed_glow', 'Borrowed Glow', ['I', 'IV', 'iv', 'I'], ['tonic', 'predominant', 'contrast', 'tonic'], 'turnback_flow', ['chorus', 'bridge'], 'contrastive', 0.64, ['stable', 'lift', 'darken', 'release'], ['borrowed_color', 'emotional', 'cinematic'], 0.9],
  ['soft_climb', 'Soft Climb', ['ii', 'iii', 'IV', 'V'], ['predominant', 'tonic_family', 'predominant', 'dominant'], 'rise_push', ['pre_chorus'], 'lift_without_arrival', 0.63, ['lift', 'lean', 'rise', 'push'], ['pre_chorus_energy', 'soft_climb', 'emotional'], 0.84],
  ['prayer_cycle', 'Prayer Cycle', ['vi', 'V', 'IV', 'I'], ['tonic_family', 'dominant', 'predominant', 'tonic'], 'turnback_flow', ['chorus', 'verse'], 'soft_resolve', 0.71, ['soft_drop', 'push', 'lift', 'release'], ['open_heart', 'release', 'emotional'], 0.83],
  ['held_tonic', 'Held Tonic', ['I', 'V', 'vi', 'iii'], ['tonic', 'dominant', 'tonic_family', 'tonic_family'], 'wide_hold', ['verse', 'chorus'], 'soft_resolve', 0.69, ['stable', 'push', 'soft_drop', 'lean'], ['ballad_core', 'held_center', 'emotional'], 0.74],
  ['blue_arrival', 'Blue Arrival', ['ii', 'V', 'I', 'IV'], ['predominant', 'dominant', 'tonic', 'predominant'], 'turnback_flow', ['chorus'], 'strong_resolve', 0.62, ['lift', 'push', 'release', 'open'], ['chorus_payoff', 'blue_tint', 'emotional'], 0.75],
  ['bridge_window', 'Bridge Window', ['iii', 'vi', 'ii', 'V'], ['tonic_family', 'tonic_family', 'predominant', 'dominant'], 'wide_hold', ['bridge'], 'contrastive', 0.56, ['lean', 'soft_drop', 'lift', 'push'], ['bridge_contrast', 'emotional', 'suspended'], 0.7],
  ['falling_letter', 'Falling Letter', ['IV', 'iii', 'ii', 'V'], ['predominant', 'tonic_family', 'predominant', 'dominant'], 'turnback_flow', ['verse', 'pre_chorus'], 'lift_without_arrival', 0.67, ['open', 'lean', 'lift', 'push'], ['yearning', 'letter', 'emotional'], 0.72],
  ['patient_lift', 'Patient Lift', ['I', 'ii', 'IV', 'V'], ['tonic', 'predominant', 'predominant', 'dominant'], 'rise_push', ['pre_chorus'], 'lift_without_arrival', 0.66, ['stable', 'lift', 'rise', 'push'], ['patient_build', 'pre_chorus_energy', 'emotional'], 0.8],
  ['emotional_open', 'Emotional Open', ['vi', 'ii', 'IV', 'V'], ['tonic_family', 'predominant', 'predominant', 'dominant'], 'rise_push', ['pre_chorus', 'chorus'], 'lift_without_arrival', 0.65, ['soft_drop', 'lift', 'rise', 'push'], ['open_heart', 'rise', 'emotional'], 0.78],
  ['cinematic_close', 'Cinematic Close', ['I', 'iii', 'IV', 'iv'], ['tonic', 'tonic_family', 'predominant', 'contrast'], 'wide_hold', ['bridge', 'chorus'], 'contrastive', 0.53, ['stable', 'lean', 'lift', 'darken'], ['borrowed_color', 'bridge_contrast', 'emotional'], 0.77]
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
    preferredCadenceTypes: ['soft_resolve'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['ballad_core', 'open_heart'],
    allowedVariationTypes: ['safer', 'richer'],
    allowedSpecialMoveIds: [id('borrowed_iv')],
    forbiddenTags: ['blunt_groove'],
    energyShape: 'steady_breath'
  }),
  verseRules: createSectionRuleBlock({
    preferredCadenceTypes: ['soft_resolve'],
    preferredRhythmDensities: ['slow', 'medium'],
    preferredArchetypeTags: ['confessional', 'ballad_core'],
    allowedVariationTypes: ['safer', 'richer'],
    allowedSpecialMoveIds: [id('borrowed_iv')],
    forbiddenTags: ['blunt_groove'],
    energyShape: 'intimate'
  }),
  preChorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['lift_without_arrival'],
    preferredRhythmDensities: ['active', 'medium'],
    preferredArchetypeTags: ['pre_chorus_energy', 'yearning'],
    allowedVariationTypes: ['pre_chorus_lift', 'richer'],
    allowedSpecialMoveIds: [id('delay_arrival'), id('dominant_pressure')],
    forbiddenTags: ['held_center'],
    energyShape: 'swelling'
  }),
  chorusRules: createSectionRuleBlock({
    preferredCadenceTypes: ['soft_resolve', 'strong_resolve'],
    preferredRhythmDensities: ['medium'],
    preferredArchetypeTags: ['chorus_payoff', 'release'],
    allowedVariationTypes: ['chorus_payoff', 'richer', 'more_resolved'],
    allowedSpecialMoveIds: [id('chorus_widen'), id('borrowed_iv')],
    forbiddenTags: ['blunt_groove'],
    energyShape: 'release'
  }),
  bridgeRules: createSectionRuleBlock({
    preferredCadenceTypes: ['contrastive'],
    preferredRhythmDensities: ['slow'],
    preferredArchetypeTags: ['bridge_contrast', 'borrowed_color'],
    allowedVariationTypes: ['bridge_contrast', 'darker'],
    allowedSpecialMoveIds: [id('bridge_reframe'), id('borrowed_iv')],
    forbiddenTags: ['ballad_core'],
    energyShape: 'wider_perspective'
  })
});

const spicinessTransforms = [
  ['soft_color', 'Soft Color', 1, ['add9', '6', 'min7'], ['tonic', 'tonic_family', 'predominant'], [], ['blunt_groove'], 1],
  ['rich_color', 'Rich Color', 2, ['maj7', '9', '11'], ['tonic', 'tonic_family', 'predominant'], [], ['blunt_groove'], 1],
  ['borrowed_color', 'Borrowed Color', 3, ['maj7', '9', '11', 'b9'], ['contrast', 'dominant', 'predominant'], ['full_loop'], ['blunt_groove'], 0.86]
].map(([suffix, name, level, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight]) =>
  createSpicinessTransform({ id: id(suffix), name, level, styleScope: scope, allowedDecorations, allowedFunctions, forbiddenSectionIntents, forbiddenTags, weight })
);

const variationRules = [
  ['safer_loop', 'Safer Ballad Loop', 'safer', ['full_loop', 'verse'], ['emotional_center', 'topline_space'], ['surface_color_reduction', 'cleaner_resolution'], ['ballad_core'], ['blunt_groove'], 1],
  ['richer_voicing', 'Richer Voicing', 'richer', ['verse', 'chorus', 'bridge'], ['roman_root_path', 'emotional_center'], ['upper_extensions', 'smoother_voice_leading'], ['emotional'], ['blunt_groove'], 0.97],
  ['darker_turn', 'Darker Turn', 'darker', ['chorus', 'bridge'], ['release_shape'], ['borrowed_color', 'contrast_slot'], ['borrowed_color'], ['blunt_groove'], 0.89],
  ['pre_lift_rule', 'Ballad Lift', 'pre_chorus_lift', ['pre_chorus'], ['emotional_center', 'section_role'], ['dominant_pull', 'phrase_swell'], ['pre_chorus_energy'], ['held_center'], 1],
  ['bridge_contrast_rule', 'Ballad Bridge Contrast', 'bridge_contrast', ['bridge'], ['emotional_identity'], ['borrowed_color', 'bridge_reframe'], ['bridge_contrast'], ['ballad_core'], 0.95]
].map(([suffix, name, type, allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight]) =>
  createVariationRule({ id: id(suffix), name, type, styleScope: [substyleId], allowedSectionIntents, preserve, targets, requiredTags, forbiddenTags, weight })
);

const specialMoves = [
  ['borrowed_iv', 'Borrowed iv Darken', 'color_shift', ['full_loop', 'chorus', 'bridge'], ['borrowed_color', 'emotional'], 'borrowed_iv_darken', 1],
  ['delay_arrival', 'Delay Arrival', 'section_lift', ['pre_chorus'], ['pre_chorus_energy', 'yearning'], 'delay_tonic_arrival', 0.86],
  ['chorus_widen', 'Chorus Widen', 'payoff', ['chorus'], ['chorus_payoff', 'release'], 'chorus_payoff_widen', 0.9],
  ['bridge_reframe', 'Bridge Reframe', 'bridge', ['bridge'], ['bridge_contrast', 'borrowed_color'], 'bridge_reframe', 0.88],
  ['dominant_pressure', 'Dominant Pressure', 'tension', ['pre_chorus', 'chorus'], ['yearning', 'pre_chorus_energy'], 'dominant_pressure', 0.84]
].map(([suffix, name, category, allowedSectionIntents, triggerTags, operation, weight]) =>
  createSpecialMove({ id: id(suffix), name, category, styleScope: [substyleId], allowedSectionIntents, triggerTags, operation, weight })
);

const explanationTemplates = [
  ['why', 'why_it_works', ['verse', 'chorus', 'bridge'], 'producer_first', 'This {sectionIntent} feels emotional because {substyleName} keeps the release gentle, then uses richer color only where the phrase can actually carry it.', ['sectionIntent', 'substyleName']],
  ['section', 'section_idea', ['pre_chorus', 'bridge'], 'learning_aware', 'In {sectionIntent}, the job is not speed. The job is direction: make the next arrival feel inevitable through cadence pressure or borrowed color.', ['sectionIntent']],
  ['learn', 'learn', ['full_loop', 'verse', 'chorus', 'bridge'], 'learning_aware', 'When {rhythmName} slows the harmony down, every color chord matters more. That is why this substyle can support richer voicings without losing clarity.', ['rhythmName']]
].map(([suffix, templateType, sectionIntentScope, tone, content, requiredPlaceholders]) =>
  createExplanationTemplate({ id: id(suffix), templateType, styleScope: [substyleId], sectionIntentScope, tone, content, requiredPlaceholders })
);

const midiPresets = [
  ['block', 'Ballad Block', 'block', ['emotional', 'ballad'], 'wide_ballad_stack', [44, 82], 'half_note_support', 'soft_swell', 'long_phrase_sustain', 1],
  ['arp', 'Ballad Arp', 'arp', ['emotional', 'open_heart'], 'rolled_upper_spread', [52, 86], 'slow_broken_chords', 'gentle_wave', 'pedal_like', 0.72]
].map(([suffix, name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight]) =>
  createMidiPreset({ id: id(suffix), name, mode, styleTags, voicingStyle, registerRange, rhythmPattern, velocityProfile, sustainBehavior, weight })
);

export const kpopBalladEmotional = {
  substyle: createSubstyle({
    id: substyleId,
    familyId,
    name: 'K-pop Ballad / Emotional',
    description: 'Emotional K-pop ballad writing with slower turns, stronger release, and borrowed-color moments.',
    tags: ['emotional', 'ballad', 'section_aware', 'open_heart'],
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
    mustIncludeTags: ['emotional', 'open_heart'],
    mustAvoidTags: ['blunt_groove']
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
