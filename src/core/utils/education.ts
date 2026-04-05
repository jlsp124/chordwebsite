import type { GenerationBundle } from '../types/index.ts';

export interface LoopEducationItem {
  id: string;
  title: string;
  body: string;
}

export interface LoopEducationMap {
  whyItWorks: LoopEducationItem[];
  addNotes: LoopEducationItem[];
  transitions: LoopEducationItem[];
  learn: LoopEducationItem[];
}

function formatFunctionLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

export function buildEducationalTabs(bundle: GenerationBundle | null): LoopEducationMap {
  if (!bundle) {
    return {
      whyItWorks: [],
      addNotes: [],
      transitions: [],
      learn: []
    };
  }

  const { metadata, result } = bundle;
  const firstSlot = result.chordSlots[0];
  const lastSlot = result.chordSlots[result.chordSlots.length - 1];
  const decoratedSlots = result.chordSlots.filter((slot) => slot.decorationTags.length > 0);

  return {
    whyItWorks: [
      {
        id: `why-${result.loopArchetypeId}`,
        title: 'Loop Shape',
        body: `${metadata.loopName} keeps the loop readable by moving through ${result.functionPath
          .slice(0, 4)
          .map(formatFunctionLabel)
          .join(', ')}.`
      }
    ],
    addNotes: [
      {
        id: `notes-${result.loopArchetypeId}`,
        title: 'Color',
        body:
          decoratedSlots.length > 0
            ? `Current color is already landing on ${decoratedSlots
                .map((slot) => `${slot.romanNumeral} (${slot.chordName})`)
                .join(', ')}.`
            : 'This pass is intentionally clean. Add extension color on tonic-family slots first.'
      }
    ],
    transitions: [
      {
        id: `transition-${result.loopArchetypeId}`,
        title: 'Handoff',
        body: `The loop exits through ${lastSlot?.romanNumeral ?? 'the final slot'} after opening on ${firstSlot?.romanNumeral ?? 'the first slot'}.`
      }
    ],
    learn: [
      {
        id: `learn-${result.loopArchetypeId}`,
        title: 'Roman To Key',
        body: result.chordSlots
          .slice(0, 4)
          .map((slot) => `${slot.romanNumeral} = ${slot.chordName}`)
          .join('. ')
      }
    ]
  };
}
