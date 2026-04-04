import type { ScaleMode } from './types/index.ts';

export type { ScaleMode } from './types/index.ts';

export type ThemeMode = 'light' | 'dark';
export type LoopBarCount = 4 | 8 | 16;
export type ChordChangeRate = 'two_bars' | 'one_bar';

export interface SelectOption<TValue extends string | number = string> {
  value: TValue;
  label: string;
}

export interface ShellControlState {
  familyId: string;
  substyleId: string;
  key: string;
  scaleMode: ScaleMode;
  loopBars: LoopBarCount;
  chordChangeRate: ChordChangeRate;
  spiceLevel: number;
}

export const FAMILY_OPTIONS: SelectOption[] = [
  { value: 'kpop', label: 'K-pop' },
  { value: 'trap', label: 'Hip-Hop / Trap' },
  { value: 'rnb', label: 'R&B / Neo-Soul' },
  { value: 'pop', label: 'Pop' },
  { value: 'dance', label: 'Dance / Electronic' }
];

export const SUBSTYLE_OPTIONS: Record<string, SelectOption[]> = {
  kpop: [
    { value: 'kpop_bright_easy', label: 'Bright Easy-Listening' },
    { value: 'kpop_dark_synth', label: 'Dark Synth / Futuristic' },
    { value: 'kpop_ballad_emotional', label: 'Ballad / Emotional' }
  ],
  trap: [
    { value: 'melodic_trap', label: 'Melodic Trap' },
    { value: 'trap_soul_rnb_rap', label: 'Trap-Soul / R&B Rap' }
  ],
  rnb: [{ value: 'modern_rnb', label: 'Modern R&B' }],
  pop: [{ value: 'future_pop', label: 'Future Pop' }],
  dance: [{ value: 'house_disco', label: 'House / Disco' }]
};

export const CHANGE_RATE_OPTIONS_BY_SUBSTYLE: Record<string, ChordChangeRate[]> = {
  kpop_bright_easy: ['one_bar'],
  kpop_dark_synth: ['one_bar'],
  kpop_ballad_emotional: ['one_bar'],
  melodic_trap: ['one_bar', 'two_bars'],
  trap_soul_rnb_rap: ['one_bar'],
  modern_rnb: ['one_bar'],
  future_pop: ['one_bar'],
  house_disco: ['one_bar', 'two_bars']
};

export const KEY_OPTIONS: SelectOption[] = [
  { value: 'C', label: 'C' },
  { value: 'Db', label: 'Db' },
  { value: 'D', label: 'D' },
  { value: 'Eb', label: 'Eb' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'Gb', label: 'Gb' },
  { value: 'G', label: 'G' },
  { value: 'Ab', label: 'Ab' },
  { value: 'A', label: 'A' },
  { value: 'Bb', label: 'Bb' },
  { value: 'B', label: 'B' }
];

export const SCALE_OPTIONS: SelectOption<ScaleMode>[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' }
];

export interface KeyModeOption {
  key: string;
  label: string;
  scaleMode: ScaleMode;
  value: string;
}

export const KEY_MODE_OPTIONS: KeyModeOption[] = KEY_OPTIONS.flatMap((keyOption) =>
  SCALE_OPTIONS.map((scaleOption) => ({
    key: keyOption.value,
    label: `${keyOption.label} ${scaleOption.label}`,
    scaleMode: scaleOption.value,
    value: `${keyOption.value}:${scaleOption.value}`
  }))
);

export const SPICE_OPTIONS: SelectOption<number>[] = [
  { value: 1, label: '1 / Safe' },
  { value: 2, label: '2 / Lifted' },
  { value: 3, label: '3 / Richer' },
  { value: 4, label: '4 / Bold' }
];

export const LOOP_BAR_OPTIONS: SelectOption<LoopBarCount>[] = [
  { value: 4, label: '4 Bars' },
  { value: 8, label: '8 Bars' },
  { value: 16, label: '16 Bars' }
];

export const CHORD_CHANGE_RATE_OPTIONS: SelectOption<ChordChangeRate>[] = [
  { value: 'one_bar', label: '1 Bar / Chord' },
  { value: 'two_bars', label: '2 Bars / Chord' }
];

export const DEFAULT_CONTROL_STATE: ShellControlState = {
  familyId: 'kpop',
  substyleId: 'kpop_bright_easy',
  key: 'C',
  scaleMode: 'major',
  loopBars: 4,
  chordChangeRate: 'one_bar',
  spiceLevel: 1
};
