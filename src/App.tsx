import { startTransition, useEffect, useMemo, useState } from 'react';
import { ControlBar } from './components/control-bar/ControlBar';
import { ResultArea } from './components/result-area/ResultArea';
import { ResultTabs } from './components/result-tabs/ResultTabs';
import { SuggestionRail } from './components/suggestion-rail/SuggestionRail';
import { generateProgression } from './core/engine';
import {
  DEFAULT_CONTROL_STATE,
  DEFAULT_TAB,
  EXPLANATION_TABS,
  SUBSTYLE_OPTIONS,
  type ExplanationType,
  type ShellControlState
} from './core/options';
import { getRuntimeBasePath } from './core/runtime-path.ts';
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
  const [generation, setGeneration] = useState<Awaited<ReturnType<typeof generateProgression>> | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const substyleOptions = useMemo(
    () => SUBSTYLE_OPTIONS[controls.familyId] ?? [],
    [controls.familyId]
  );

  const manifestUrl = useMemo(() => getPackManifestUrl(), []);
  const runtimeBasePath = getRuntimeBasePath();

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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const bundle = await generateProgression({
        seed: controls.seed,
        familyId: controls.familyId,
        substyleId: controls.substyleId,
        key: controls.key,
        scaleMode: controls.scaleMode,
        sectionIntent: controls.sectionIntent,
        spiceLevel: controls.spiceLevel,
        midiMode: controls.midiMode
      });

      startTransition(() => {
        setGeneration(bundle);
        setActiveTab(DEFAULT_TAB);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown generation error.';
      startTransition(() => {
        setGeneration(null);
        setErrorMessage(message);
      });
    } finally {
      setIsGenerating(false);
    }
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
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        runtimeBasePath={runtimeBasePath}
        manifestUrl={manifestUrl}
      />

      <main className={`workspace ${preferences.compactRail ? 'workspace--compact-rail' : ''}`}>
        <section className="main-column">
          <ResultArea
            result={generation?.result ?? null}
            metadata={generation?.metadata ?? null}
            showFunctionLabels={preferences.showFunctionLabels}
            downloadDisabledReason={MIDI_EXPORT_PLACEHOLDER_REASON}
            isGenerating={isGenerating}
            errorMessage={errorMessage}
          />

          <ResultTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabOptions={EXPLANATION_TABS}
            explanations={generation?.result.explanations ?? []}
          />
        </section>

        <SuggestionRail
          suggestions={generation?.result.suggestions ?? []}
          compact={preferences.compactRail}
        />
      </main>
    </div>
  );
}
