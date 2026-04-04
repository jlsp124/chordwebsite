import type { ThemeMode } from '../core/options';

export interface UserPreferences {
  theme: ThemeMode;
  reducedMotion: boolean;
  showFunctionLabels: boolean;
}

const STORAGE_KEY = 'chord-generator.preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  reducedMotion: false,
  showFunctionLabels: true
};

export function loadPreferences(): UserPreferences {
  try {
    const rawValue = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (!rawValue) {
      return DEFAULT_PREFERENCES;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<UserPreferences>;

    return {
      theme: parsedValue.theme === 'dark' ? 'dark' : DEFAULT_PREFERENCES.theme,
      reducedMotion: parsedValue.reducedMotion ?? DEFAULT_PREFERENCES.reducedMotion,
      showFunctionLabels:
        parsedValue.showFunctionLabels ?? DEFAULT_PREFERENCES.showFunctionLabels
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: UserPreferences): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage failures so the static shell still renders.
  }
}
