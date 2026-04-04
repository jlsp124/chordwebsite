import { useEffect, useMemo, useState } from 'react';
import { ControlBar } from './components/control-bar/ControlBar';
import { ResultArea } from './components/result-area/ResultArea';
import { ResultTabs } from './components/result-tabs/ResultTabs';
import { SuggestionRail } from './components/suggestion-rail/SuggestionRail';
import {
  DEFAULT_CONTROL_STATE,
  DEFAULT_TAB,
  EXPLANATION_TABS,
  SUBSTYLE_OPTIONS,
  type ExplanationType,
  type ShellControlState
} from './core/options';
import { getRuntimeBasePath } from './core/runtime-path';
import { getPackManifestUrl } from './data/packs';
import { MIDI_EXPORT_PLACEHOLDER_REASON } from './export';
import {
  loadPreferences,
  savePreferences,
  type UserPreferences
} from './storage/preferences';

function mergePreferences(
  previous: UserPreferences,
  patch: Partial<UserPreferences>
): UserPreferences {
  return { ...previous, ...patch };
}

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
  const [controls, setControls] = useState<ShellControlState>(DEFAULT_CONTROL_STATE);
  const [activeTab, setActiveTab] = useState<ExplanationType>(DEFAULT_TAB);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const substyleOptions = useMemo(
    () => SUBSTYLE_OPTIONS[controls.familyId] ?? [],
    [controls.familyId]
  );

  const manifestUrl = useMemo(() => getPackManifestUrl(), []);
  const runtimeBasePath = getRuntimeBasePath();
  const hasProgression = false;

  useEffect(() => {
    savePreferences(preferences);
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.motion = preferences.reducedMotion ? 'reduced' : 'full';
    document.documentElement.style.colorScheme = preferences.theme;
  }, [preferences]);

  useEffect(() => {
    if (substyleOptions.some((option) => option.value === controls.substyleId)) {
      return;
    }

    const fallbackSubstyle = substyleOptions[0]?.value ?? '';
    setControls((previous) => ({ ...previous, substyleId: fallbackSubstyle }));
  }, [controls.substyleId, substyleOptions]);

  const updateControls = (patch: Partial<ShellControlState>) => {
    setControls((previous) => ({ ...previous, ...patch }));
  };

  const updatePreferences = (patch: Partial<UserPreferences>) => {
    setPreferences((previous) => mergePreferences(previous, patch));
  };

  const toggleTheme = () => {
    updatePreferences({
      theme: preferences.theme === 'light' ? 'dark' : 'light'
    });
  };

  return (
    <div className={`app-shell ${preferences.reducedMotion ? 'app-shell--reduced-motion' : ''}`}>
      <ControlBar
        controls={controls}
        onControlsChange={updateControls}
        preferences={preferences}
        onPreferencesChange={updatePreferences}
        onToggleTheme={toggleTheme}
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((previous) => !previous)}
        onCloseSettings={() => setSettingsOpen(false)}
        runtimeBasePath={runtimeBasePath}
        manifestUrl={manifestUrl}
      />

      <main className={`workspace ${preferences.compactRail ? 'workspace--compact-rail' : ''}`}>
        <section className="main-column">
          <ResultArea
            hasProgression={hasProgression}
            showFunctionLabels={preferences.showFunctionLabels}
            downloadDisabledReason={MIDI_EXPORT_PLACEHOLDER_REASON}
          />

          <ResultTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabOptions={EXPLANATION_TABS}
            hasProgression={hasProgression}
          />
        </section>

        <SuggestionRail hasProgression={hasProgression} compact={preferences.compactRail} />
      </main>
    </div>
  );
}
