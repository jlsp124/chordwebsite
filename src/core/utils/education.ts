import type {
  ChordSlot,
  ExplanationItem,
  ExplanationType,
  GenerationBundle,
  SuggestionItem
} from '../types/index.ts';
import { getVariationVersionLabel } from './variation-display.ts';

type TabContentMap = Record<ExplanationType, ExplanationItem[]>;

function formatTokenLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

function unique<TValue>(values: readonly TValue[]): TValue[] {
  return [...new Set(values)];
}

function formatChordList(slots: readonly ChordSlot[]): string {
  return slots.map((slot) => `${slot.romanNumeral} (${slot.chordName})`).join(', ');
}

function formatFunctionGloss(functionLabel: string): string {
  switch (functionLabel) {
    case 'tonic':
      return 'home';
    case 'tonic_family':
      return 'home-adjacent';
    case 'predominant':
      return 'movement';
    case 'dominant':
      return 'pull';
    case 'contrast':
      return 'reframe';
    default:
      return formatTokenLabel(functionLabel);
  }
}

function pickSuggestionByType(
  suggestions: readonly SuggestionItem[],
  type: SuggestionItem['type']
): SuggestionItem | undefined {
  return suggestions.find((entry) => entry.type === type);
}

function createExplanation(
  id: string,
  type: ExplanationType,
  title: string,
  body: string,
  relatedChordIndexes?: number[]
): ExplanationItem {
  return {
    id,
    type,
    title,
    body,
    relatedChordIndexes
  };
}

export function buildEducationalTabs(bundle: GenerationBundle | null): TabContentMap {
  if (!bundle) {
    return {
      why_it_works: [],
      add_notes: [],
      transition: [],
      section_idea: [],
      learn: []
    };
  }

  const { metadata, request, result } = bundle;
  const baseItemsByType = result.explanations.reduce<TabContentMap>(
    (accumulator, item) => {
      accumulator[item.type].push(item);
      return accumulator;
    },
    {
      why_it_works: [],
      add_notes: [],
      transition: [],
      section_idea: [],
      learn: []
    }
  );

  const firstSlot = result.chordSlots[0];
  const lastSlot = result.chordSlots[result.chordSlots.length - 1];
  const secondLastSlot = result.chordSlots[result.chordSlots.length - 2] ?? lastSlot;
  const decoratedSlots = result.chordSlots.filter((slot) => slot.decorationTags.length > 0);
  const functionRoles = unique(result.functionPath);
  const preLiftSuggestion = pickSuggestionByType(result.suggestions, 'pre_chorus_lift');
  const chorusSuggestion = pickSuggestionByType(result.suggestions, 'chorus_payoff');
  const bridgeSuggestion = pickSuggestionByType(result.suggestions, 'bridge_contrast');
  const openSuggestion = pickSuggestionByType(result.suggestions, 'more_open');
  const resolvedSuggestion = pickSuggestionByType(result.suggestions, 'more_resolved');

  const whyItems = [
    ...baseItemsByType.why_it_works,
    createExplanation(
      `why-shape-${result.seed}`,
      'why_it_works',
      'Shape Read',
      `${metadata.substyleName} keeps this ${formatTokenLabel(request.sectionIntent)} readable by starting on ${firstSlot?.romanNumeral ?? result.romanNumerals[0]} and aiming the ending toward ${lastSlot?.romanNumeral ?? result.romanNumerals[result.romanNumerals.length - 1]}. The ${metadata.cadenceType.replace(/_/g, ' ')} cadence and ${metadata.rhythmName} rhythm let it feel ${metadata.sectionEnergyShape} without crowding the topline.`,
      firstSlot && lastSlot ? [firstSlot.index, lastSlot.index] : undefined
    ),
    createExplanation(
      `why-functions-${result.seed}`,
      'why_it_works',
      'Function Pocket',
      `The loop lives on ${functionRoles.map((role) => formatFunctionGloss(role)).join(', ')} rather than constant chord churn. That is why it still sounds produced, not over-written.`,
      result.chordSlots.map((slot) => slot.index)
    )
  ];

  const addNotesItems = [
    ...baseItemsByType.add_notes,
    createExplanation(
      `add-color-${result.seed}`,
      'add_notes',
      'Where Color Already Lives',
      decoratedSlots.length > 0
        ? `The current color is landing on ${formatChordList(decoratedSlots)}. If you extend further, keep the extra tone on those same touchpoints so the hook shape stays intact.`
        : 'This pass is intentionally clean. Add color on tonic-family slots first, then only add dominant tension if the section needs more push.',
      decoratedSlots.map((slot) => slot.index)
    ),
    createExplanation(
      `add-next-${result.seed}`,
      'add_notes',
      'Next Extension Move',
      `For this progression, add9 or 9 works best on ${result.chordSlots
        .filter((slot) => slot.functionLabel === 'tonic' || slot.functionLabel === 'tonic_family')
        .map((slot) => `${slot.romanNumeral} (${slot.chordName})`)
        .slice(0, 2)
        .join(' and ') || 'the tonic side'}. Keep predominant slots lighter, and save 7/sus pressure for the last handoff only if you want more momentum.`
    )
  ];

  const transitionItems = [
    ...baseItemsByType.transition,
    createExplanation(
      `transition-exit-${result.seed}`,
      'transition',
      'Exit Strategy',
      `${secondLastSlot?.romanNumeral ?? ''} into ${lastSlot?.romanNumeral ?? ''} is the handoff point. ${lastSlot?.slashBassDegree ? `The slash bass already tilts upward through degree ${lastSlot.slashBassDegree}.` : 'If you need more motion, tilt the final bass or add dominant pressure there instead of rewriting the whole loop.'}`,
      secondLastSlot && lastSlot ? [secondLastSlot.index, lastSlot.index] : undefined
    ),
    createExplanation(
      `transition-next-${result.seed}`,
      'transition',
      'Next Section Push',
      preLiftSuggestion
        ? `${getVariationVersionLabel(preLiftSuggestion.type)} is the cleanest way to turn this into a stronger setup. ${preLiftSuggestion.summary}`
        : resolvedSuggestion
          ? `${getVariationVersionLabel(resolvedSuggestion.type)} is the easiest way to make the phrase land harder without changing the body of the loop.`
          : 'The current cadence is already doing most of the handoff work. Change the last bar before you touch the earlier slots.'
    )
  ];

  const sectionIdeaItems = [
    ...baseItemsByType.section_idea,
    createExplanation(
      `section-fit-${result.seed}`,
      'section_idea',
      'Best Section Fit',
      request.sectionIntent === 'full_loop'
        ? `This reads best as a repeatable core loop. Keep it cycling as-is for beat writing, then use ${chorusSuggestion ? getVariationVersionLabel(chorusSuggestion.type).toLowerCase() : 'chorus payoff'} or ${preLiftSuggestion ? getVariationVersionLabel(preLiftSuggestion.type).toLowerCase() : 'pre-chorus lift'} when you need bigger contrast.`
        : `As a ${formatTokenLabel(request.sectionIntent)}, this progression already carries ${metadata.sectionEnergyShape} energy. Let arrangement changes do the heavy lift before you rewrite the harmony.`,
      lastSlot ? [lastSlot.index] : undefined
    ),
    createExplanation(
      `section-alt-${result.seed}`,
      'section_idea',
      'Alternate Placement',
      bridgeSuggestion
        ? `If you want a bridge or post-drop detour, ${bridgeSuggestion.summary}`
        : openSuggestion
          ? `If you want the same progression to loop longer, ${openSuggestion.summary}`
          : 'This progression is strongest in its current section role. Reframe it with drums, texture, or voicing before trying a bigger harmonic swap.'
    )
  ];

  const learnItems = [
    ...baseItemsByType.learn,
    createExplanation(
      `learn-map-${result.seed}`,
      'learn',
      'Roman To Key',
      result.chordSlots
        .map((slot) => `${slot.romanNumeral} means ${slot.chordName}`)
        .slice(0, 4)
        .join('. ') + '.',
      result.chordSlots.map((slot) => slot.index)
    ),
    createExplanation(
      `learn-roles-${result.seed}`,
      'learn',
      'Function Roles',
      `Read the progression as ${result.chordSlots
        .map((slot) => `${slot.romanNumeral} = ${formatFunctionGloss(slot.functionLabel)}`)
        .slice(0, 4)
        .join(', ')}. That is enough to understand the movement without turning the app into theory homework.`
    )
  ];

  return {
    why_it_works: whyItems,
    add_notes: addNotesItems,
    transition: transitionItems,
    section_idea: sectionIdeaItems,
    learn: learnItems
  };
}
