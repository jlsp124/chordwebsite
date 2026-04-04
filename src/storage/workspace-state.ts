import { DEFAULT_CONTROL_STATE, type ShellControlState } from '../core/options';
import type { GenerationBundle, SectionIntent } from '../core/types/index.ts';

export interface StoredProgressionEntry {
  id: string;
  familyId: string;
  substyleId: string;
  substyleName: string;
  sectionIntent: SectionIntent;
  seed: string;
  controls: ShellControlState;
  previewRomanNumerals: string[];
  updatedAt: number;
}

export interface WorkspaceState {
  favorites: StoredProgressionEntry[];
  lastSeed: string;
  lastUsedSettings: ShellControlState;
  recentHistory: StoredProgressionEntry[];
}

const STORAGE_KEY = 'chord-generator.workspace-state';
const MAX_FAVORITES = 12;
const MAX_RECENTS = 8;

const DEFAULT_WORKSPACE_STATE: WorkspaceState = {
  favorites: [],
  lastSeed: DEFAULT_CONTROL_STATE.seed,
  lastUsedSettings: DEFAULT_CONTROL_STATE,
  recentHistory: []
};

function normalizeControls(value: Partial<ShellControlState> | null | undefined): ShellControlState {
  return {
    familyId:
      typeof value?.familyId === 'string' && value.familyId.trim().length > 0
        ? value.familyId
        : DEFAULT_CONTROL_STATE.familyId,
    substyleId:
      typeof value?.substyleId === 'string' && value.substyleId.trim().length > 0
        ? value.substyleId
        : DEFAULT_CONTROL_STATE.substyleId,
    seed:
      typeof value?.seed === 'string' && value.seed.trim().length > 0
        ? value.seed
        : DEFAULT_CONTROL_STATE.seed,
    sectionIntent:
      value?.sectionIntent ?? DEFAULT_CONTROL_STATE.sectionIntent,
    key:
      typeof value?.key === 'string' && value.key.trim().length > 0
        ? value.key
        : DEFAULT_CONTROL_STATE.key,
    scaleMode:
      value?.scaleMode === 'minor' ? 'minor' : DEFAULT_CONTROL_STATE.scaleMode,
    spiceLevel:
      typeof value?.spiceLevel === 'number' && Number.isFinite(value.spiceLevel)
        ? Math.min(4, Math.max(1, Math.round(value.spiceLevel)))
        : DEFAULT_CONTROL_STATE.spiceLevel,
    midiMode:
      value?.midiMode ?? DEFAULT_CONTROL_STATE.midiMode
  };
}

function normalizeEntry(value: Partial<StoredProgressionEntry> | null | undefined): StoredProgressionEntry | null {
  if (!value) {
    return null;
  }

  const controls = normalizeControls(value.controls);
  const previewRomanNumerals = Array.isArray(value.previewRomanNumerals)
    ? value.previewRomanNumerals.filter((entry): entry is string => typeof entry === 'string').slice(0, 8)
    : [];

  if (previewRomanNumerals.length === 0) {
    return null;
  }

  return {
    id:
      typeof value.id === 'string' && value.id.trim().length > 0
        ? value.id
        : buildStoredEntryId(controls),
    familyId: controls.familyId,
    substyleId: controls.substyleId,
    substyleName:
      typeof value.substyleName === 'string' && value.substyleName.trim().length > 0
        ? value.substyleName
        : controls.substyleId,
    sectionIntent: controls.sectionIntent,
    seed: controls.seed,
    controls,
    previewRomanNumerals,
    updatedAt:
      typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt)
        ? value.updatedAt
        : Date.now()
  };
}

function trimEntries(entries: StoredProgressionEntry[], limit: number): StoredProgressionEntry[] {
  return entries.slice(0, limit);
}

export function buildStoredEntryId(controls: ShellControlState): string {
  return [
    controls.familyId,
    controls.substyleId,
    controls.sectionIntent,
    controls.key,
    controls.scaleMode,
    controls.spiceLevel,
    controls.midiMode,
    controls.seed
  ].join('__');
}

export function createStoredProgressionEntry(bundle: GenerationBundle): StoredProgressionEntry {
  return {
    id: buildStoredEntryId(bundle.request),
    familyId: bundle.result.familyId,
    substyleId: bundle.result.substyleId,
    substyleName: bundle.metadata.substyleName,
    sectionIntent: bundle.result.sectionIntent,
    seed: bundle.request.seed,
    controls: {
      familyId: bundle.request.familyId,
      substyleId: bundle.request.substyleId,
      seed: bundle.request.seed,
      sectionIntent: bundle.request.sectionIntent,
      key: bundle.request.key,
      scaleMode: bundle.request.scaleMode,
      spiceLevel: bundle.request.spiceLevel,
      midiMode: bundle.request.midiMode
    },
    previewRomanNumerals: [...bundle.result.romanNumerals],
    updatedAt: Date.now()
  };
}

export function upsertRecentHistory(
  entries: StoredProgressionEntry[],
  entry: StoredProgressionEntry
): StoredProgressionEntry[] {
  const nextEntries = [entry, ...entries.filter((existingEntry) => existingEntry.id !== entry.id)];
  return trimEntries(nextEntries, MAX_RECENTS);
}

export function toggleFavoriteEntry(
  entries: StoredProgressionEntry[],
  entry: StoredProgressionEntry
): StoredProgressionEntry[] {
  const existingIndex = entries.findIndex((existingEntry) => existingEntry.id === entry.id);

  if (existingIndex >= 0) {
    return entries.filter((existingEntry) => existingEntry.id !== entry.id);
  }

  return trimEntries([entry, ...entries], MAX_FAVORITES);
}

export function loadWorkspaceState(): WorkspaceState {
  try {
    const rawValue = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (!rawValue) {
      return DEFAULT_WORKSPACE_STATE;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<WorkspaceState>;
    const favorites = Array.isArray(parsedValue.favorites)
      ? parsedValue.favorites
          .map((entry) => normalizeEntry(entry))
          .filter((entry): entry is StoredProgressionEntry => entry !== null)
      : [];
    const recentHistory = Array.isArray(parsedValue.recentHistory)
      ? parsedValue.recentHistory
          .map((entry) => normalizeEntry(entry))
          .filter((entry): entry is StoredProgressionEntry => entry !== null)
      : [];

    return {
      favorites: trimEntries(favorites, MAX_FAVORITES),
      lastSeed:
        typeof parsedValue.lastSeed === 'string' && parsedValue.lastSeed.trim().length > 0
          ? parsedValue.lastSeed
          : normalizeControls(parsedValue.lastUsedSettings).seed,
      lastUsedSettings: normalizeControls(parsedValue.lastUsedSettings),
      recentHistory: trimEntries(recentHistory, MAX_RECENTS)
    };
  } catch {
    return DEFAULT_WORKSPACE_STATE;
  }
}

export function saveWorkspaceState(state: WorkspaceState): void {
  try {
    globalThis.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        favorites: trimEntries(state.favorites, MAX_FAVORITES),
        lastSeed: state.lastSeed,
        lastUsedSettings: normalizeControls(state.lastUsedSettings),
        recentHistory: trimEntries(state.recentHistory, MAX_RECENTS)
      })
    );
  } catch {
    // Ignore storage failures so the app still works statically.
  }
}
