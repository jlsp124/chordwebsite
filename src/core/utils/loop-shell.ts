import type { ChordChangeRate } from '../options.ts';

export function getChordChangeRateLabel(chordChangeRate: ChordChangeRate): string {
  return chordChangeRate === 'two_bars' ? '2 Bars / Chord' : '1 Bar / Chord';
}
