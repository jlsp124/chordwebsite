import { startTransition, useEffect, useMemo, useState } from 'react';
import { startProgressionPreview, stopProgressionPreview } from './audio';
import { ControlBar } from './components/control-bar/ControlBar';
import { ResultArea } from './components/result-area/ResultArea';
import { generateProgression } from './core/engine';
import {
  CHANGE_RATE_OPTIONS_BY_SUBSTYLE,
  DEFAULT_CONTROL_STATE,
  type ShellControlState
} from './core/options';
import { adaptBundleToLoopSettings } from './core/utils/loop-shell.ts';
import { downloadMidiBundle, MIDI_EXPORT_DISABLED_REASON } from './export';
import {
  loadPreferences,
  savePreferences,
  type UserPreferences
} from './storage/preferences';
import {
  loadWorkspaceState,
  saveWorkspaceState
} from './storage/workspace-state';
import type { GenerationBundle } from './core/types';

function mergePreferences(
  previous: UserPreferences,
  patch: Partial<UserPreferences>
): UserPreferences {
  return { ...previous, ...patch };
}

function createHiddenSeed(controls: ShellControlState): string {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
  return [
    controls.familyId,
    controls.substyleId,
    controls.key,
    controls.scaleMode,
    controls.loopBars,
    controls.chordChangeRate,
    controls.spiceLevel,
    randomPart
  ].join(':');
}

const DEFAULT_SUBSTYLE_BY_FAMILY: Record<string, string> = {
  kpop: 'kpop_bright_easy',
  trap: 'melodic_trap',
  rnb: 'modern_rnb',
  pop: 'future_pop',
  dance: 'house_disco'
};

export default function App() {
  const initialWorkspaceState = useMemo(() => loadWorkspaceState(), []);
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
  const [controls, setControls] = useState<ShellControlState>(
    () => initialWorkspaceState.lastUsedSettings
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [generation, setGeneration] = useState<GenerationBundle | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewStarting, setIsPreviewStarting] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isDownloadingMidi, setIsDownloadingMidi] = useState(false);
  const [mediaMessage, setMediaMessage] = useState<string | null>(null);

  const supportedChangeRates = useMemo(
    () => CHANGE_RATE_OPTIONS_BY_SUBSTYLE[controls.substyleId] ?? ['one_bar'],
    [controls.substyleId]
  );

  useEffect(() => {
    savePreferences(preferences);
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.motion = preferences.reducedMotion ? 'reduced' : 'full';
    document.documentElement.style.colorScheme = preferences.theme;
  }, [preferences]);

  useEffect(() => {
    saveWorkspaceState({
      lastUsedSettings: controls
    });
  }, [controls]);

  useEffect(() => {
    if (supportedChangeRates.includes(controls.chordChangeRate)) {
      return;
    }

    setControls((previous) => ({
      ...previous,
      chordChangeRate:
        (supportedChangeRates[0] as ShellControlState['chordChangeRate'] | undefined) ??
        DEFAULT_CONTROL_STATE.chordChangeRate
    }));
  }, [controls.chordChangeRate, supportedChangeRates]);

  useEffect(() => () => {
    stopProgressionPreview(false);
  }, []);

  const updateControls = (patch: Partial<ShellControlState>) => {
    setControls((previous) => {
      const nextControls = { ...previous, ...patch };

      if (patch.familyId && patch.familyId !== previous.familyId) {
        nextControls.substyleId =
          DEFAULT_SUBSTYLE_BY_FAMILY[patch.familyId] ?? DEFAULT_CONTROL_STATE.substyleId;
      }

      return nextControls;
    });
  };

  const updatePreferences = (patch: Partial<UserPreferences>) => {
    setPreferences((previous) => mergePreferences(previous, patch));
  };

  const runGeneration = async (nextControls: ShellControlState) => {
    stopProgressionPreview(false);
    setIsPreviewPlaying(false);
    setIsPreviewStarting(false);
    setIsGenerating(true);
    setErrorMessage(null);
    setMediaMessage(null);

    try {
      const targetChordCount = nextControls.chordChangeRate === 'two_bars' ? 2 : 4;
      const bundle = await generateProgression({
        seed: createHiddenSeed(nextControls),
        familyId: nextControls.familyId,
        substyleId: nextControls.substyleId,
        key: nextControls.key,
        scaleMode: nextControls.scaleMode,
        sectionIntent: 'full_loop',
        spiceLevel: nextControls.spiceLevel,
        midiMode: 'block',
        targetChordCount
      });
      const adaptedBundle = adaptBundleToLoopSettings(bundle, {
        loopBars: nextControls.loopBars,
        chordChangeRate: nextControls.chordChangeRate
      });

      startTransition(() => {
        setGeneration(adaptedBundle);
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

  const handleGenerate = async () => {
    await runGeneration(controls);
  };

  const handlePreviewToggle = async () => {
    if (!generation) {
      return;
    }

    setMediaMessage(null);

    if (isPreviewPlaying || isPreviewStarting) {
      stopProgressionPreview(false);
      setIsPreviewStarting(false);
      setIsPreviewPlaying(false);
      setMediaMessage('Preview stopped.');
      return;
    }

    setIsPreviewStarting(true);

    try {
      const preview = await startProgressionPreview(generation, () => {
        setIsPreviewStarting(false);
        setIsPreviewPlaying(false);
      });

      setIsPreviewStarting(false);
      setIsPreviewPlaying(true);
      setMediaMessage(
        `Preview started at ${Math.round(preview.bpm)} BPM using ${generation.midiPreset.name}.`
      );
    } catch (error) {
      setIsPreviewStarting(false);
      setIsPreviewPlaying(false);
      setMediaMessage(error instanceof Error ? error.message : 'Audio preview failed to start.');
    }
  };

  const handleDownloadMidi = () => {
    if (!generation) {
      return;
    }

    setIsDownloadingMidi(true);
    setMediaMessage(null);

    try {
      const artifact = downloadMidiBundle(generation);
      setMediaMessage(`Download started for ${artifact.fileName}.`);
    } catch (error) {
      setMediaMessage(error instanceof Error ? error.message : 'MIDI export failed.');
    } finally {
      setIsDownloadingMidi(false);
    }
  };

  return (
    <div className={`app-shell ${preferences.reducedMotion ? 'app-shell--reduced-motion' : ''}`}>
      <ControlBar
        controls={controls}
        onControlsChange={updateControls}
        preferences={preferences}
        onPreferencesChange={updatePreferences}
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((previous) => !previous)}
        onCloseSettings={() => setSettingsOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      <main className="workspace">
        <ResultArea
          result={generation?.result ?? null}
          metadata={generation?.metadata ?? null}
          showFunctionLabels={preferences.showFunctionLabels}
          downloadDisabledReason={MIDI_EXPORT_DISABLED_REASON}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
          mediaMessage={mediaMessage}
          onDownloadMidi={handleDownloadMidi}
          onPreviewToggle={handlePreviewToggle}
          isDownloadingMidi={isDownloadingMidi}
          isPreviewPlaying={isPreviewPlaying}
          isPreviewStarting={isPreviewStarting}
          previewPresetName={generation?.midiPreset.name ?? null}
          loopBars={controls.loopBars}
          chordChangeRate={controls.chordChangeRate}
        />
      </main>
    </div>
  );
}
