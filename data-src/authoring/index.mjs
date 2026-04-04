import { createFamilyPack } from './shared.mjs';
import { kpopBrightEasy } from './kpop-bright-easy.mjs';
import { kpopDarkSynth } from './kpop-dark-synth.mjs';
import { kpopBalladEmotional } from './kpop-ballad-emotional.mjs';
import { melodicTrap } from './melodic-trap.mjs';
import { trapSoulRnbRap } from './trap-soul-rnb-rap.mjs';
import { modernRnb } from './modern-rnb.mjs';
import { futurePop } from './future-pop.mjs';
import { houseDisco } from './house-disco.mjs';

function buildFamilyPack({ packId, familyId, familyName, description, tags, defaultModeBias, bundles }) {
  return createFamilyPack({
    packVersion: '1.0.0',
    packId,
    family: {
      id: familyId,
      name: familyName,
      description,
      tags,
      defaultModeBias,
      substyleIds: bundles.map((bundle) => bundle.substyle.id)
    },
    substyles: bundles.map((bundle) => bundle.substyle),
    archetypes: bundles.flatMap((bundle) => bundle.archetypes),
    cadenceProfiles: bundles.flatMap((bundle) => bundle.cadenceProfiles),
    harmonicRhythmProfiles: bundles.flatMap((bundle) => bundle.harmonicRhythmProfiles),
    sectionBehaviors: bundles.map((bundle) => bundle.sectionBehavior),
    spicinessTransforms: bundles.flatMap((bundle) => bundle.spicinessTransforms),
    variationRules: bundles.flatMap((bundle) => bundle.variationRules),
    specialMoves: bundles.flatMap((bundle) => bundle.specialMoves),
    explanationTemplates: bundles.flatMap((bundle) => bundle.explanationTemplates),
    midiPresets: bundles.flatMap((bundle) => bundle.midiPresets)
  });
}

export const packs = [
  buildFamilyPack({
    packId: 'kpop',
    familyId: 'kpop',
    familyName: 'K-pop',
    description: 'Section-aware K-pop harmony with bright hooks, dark drops, and emotional ballad contrast.',
    tags: ['producer_first', 'section_aware', 'kpop'],
    defaultModeBias: 'section_first',
    bundles: [kpopBrightEasy, kpopDarkSynth, kpopBalladEmotional]
  }),
  buildFamilyPack({
    packId: 'trap',
    familyId: 'trap',
    familyName: 'Trap',
    description: 'Loop-first trap harmony with dark melodic cycles and restrained section changes.',
    tags: ['producer_first', 'loop_first', 'trap'],
    defaultModeBias: 'loop_first',
    bundles: [melodicTrap, trapSoulRnbRap]
  }),
  buildFamilyPack({
    packId: 'rnb',
    familyId: 'rnb',
    familyName: 'R&B',
    description: 'Modern R&B harmony with richer chord color, smooth cadence, and voice-leading-aware motion.',
    tags: ['producer_first', 'smooth', 'rnb'],
    defaultModeBias: 'section_first',
    bundles: [modernRnb]
  }),
  buildFamilyPack({
    packId: 'pop',
    familyId: 'pop',
    familyName: 'Pop',
    description: 'Glossy pop harmony built around polished loops, controlled lift, and bright chorus release.',
    tags: ['producer_first', 'glossy', 'pop'],
    defaultModeBias: 'section_first',
    bundles: [futurePop]
  }),
  buildFamilyPack({
    packId: 'dance',
    familyId: 'dance',
    familyName: 'Dance',
    description: 'Groove-first dance harmony with stable club loops, filter-driven lift, and floor-focused payoff.',
    tags: ['producer_first', 'groove_first', 'dance'],
    defaultModeBias: 'loop_first',
    bundles: [houseDisco]
  })
];
