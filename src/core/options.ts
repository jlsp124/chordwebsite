import type {
  ExplanationType,
  MidiMode,
  ScaleMode,
  SectionIntent
} from './types/index.ts';

export type { ExplanationType, MidiMode, ScaleMode, SectionIntent } from './types/index.ts';

export type ThemeMode = 'light' | 'dark';

export interface SelectOption<TValue extends string | number = string> {
  value: TValue;
  label: string;
}

export interface ShellControlState {
  familyId: string;
  substyleId: string;
  seed: string;
  sectionIntent: SectionIntent;
  key: string;
  scaleMode: ScaleMode;
  spiceLevel: number;
  midiMode: MidiMode;
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

export const SECTION_OPTIONS: SelectOption<SectionIntent>[] = [
  { value: 'full_loop', label: 'Full Loop' },
  { value: 'verse', label: 'Verse' },
  { value: 'pre_chorus', label: 'Pre-Chorus' },
  { value: 'chorus', label: 'Chorus' },
  { value: 'bridge', label: 'Bridge' }
];

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

export const SPICE_OPTIONS: SelectOption<number>[] = [
  { value: 1, label: '1 / Safe' },
  { value: 2, label: '2 / Lifted' },
  { value: 3, label: '3 / Richer' },
  { value: 4, label: '4 / Bold' }
];

export const MIDI_MODE_OPTIONS: SelectOption<MidiMode>[] = [
  { value: 'block', label: 'Block' },
  { value: 'comp', label: 'Comp' },
  { value: 'arp', label: 'Arp' }
];

export const EXPLANATION_TABS: SelectOption<ExplanationType>[] = [
  { value: 'why_it_works', label: 'Why It Works' },
  { value: 'add_notes', label: 'Add Notes' },
  { value: 'transition', label: 'Transition' },
  { value: 'section_idea', label: 'Section Idea' },
  { value: 'learn', label: 'Learn' }
];

export const DEFAULT_CONTROL_STATE: ShellControlState = {
  familyId: 'kpop',
  substyleId: 'kpop_bright_easy',
  seed: 'starter-kpop-bright-01',
  sectionIntent: 'full_loop',
  key: 'C',
  scaleMode: 'major',
  spiceLevel: 1,
  midiMode: 'block'
};

export const DEFAULT_TAB: ExplanationType = 'why_it_works';
