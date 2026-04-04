import type { ChordSlot, GenerationBundle } from '../types/index.ts';
import type { ChordChangeRate, LoopBarCount } from '../options.ts';

export interface LoopRenderSettings {
  loopBars: LoopBarCount;
  chordChangeRate: ChordChangeRate;
}

function getBaseDurationBeats(chordChangeRate: ChordChangeRate): number {
  return chordChangeRate === 'two_bars' ? 8 : 4;
}

export function getChordChangeRateLabel(chordChangeRate: ChordChangeRate): string {
  return chordChangeRate === 'two_bars' ? '2 Bars / Chord' : '1 Bar / Chord';
}

export function adaptBundleToLoopSettings(
  bundle: GenerationBundle,
  settings: LoopRenderSettings
): GenerationBundle {
  const repetitions = settings.loopBars / 4;
  const durationBeats = getBaseDurationBeats(settings.chordChangeRate);
  const baseSlots = bundle.result.chordSlots.map((slot) => ({
    ...slot,
    durationBeats
  }));

  const chordSlots: ChordSlot[] = [];

  for (let repetition = 0; repetition < repetitions; repetition += 1) {
    for (const slot of baseSlots) {
      chordSlots.push({
        ...slot,
        index: chordSlots.length
      });
    }
  }

  return {
    ...bundle,
    result: {
      ...bundle.result,
      chordSlots,
      romanNumerals: chordSlots.map((slot) => slot.romanNumeral),
      functionPath: chordSlots.map((slot) => slot.functionLabel)
    }
  };
}
