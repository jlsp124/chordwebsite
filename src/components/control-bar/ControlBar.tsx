import { SettingsMenu } from '../settings-menu/SettingsMenu';
import {
  CHANGE_RATE_OPTIONS_BY_SUBSTYLE,
  CHORD_CHANGE_RATE_OPTIONS,
  FAMILY_OPTIONS,
  KEY_MODE_OPTIONS,
  LOOP_BAR_OPTIONS,
  SPICE_OPTIONS,
  SUBSTYLE_OPTIONS,
  type ShellControlState
} from '../../core/options';
import { getChordChangeRateLabel } from '../../core/utils/loop-shell.ts';
import type { UserPreferences } from '../../storage/preferences';

interface ControlBarProps {
  controls: ShellControlState;
  onControlsChange: (patch: Partial<ShellControlState>) => void;
  preferences: UserPreferences;
  onPreferencesChange: (patch: Partial<UserPreferences>) => void;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function ControlBar({
  controls,
  onControlsChange,
  preferences,
  onPreferencesChange,
  settingsOpen,
  onToggleSettings,
  onCloseSettings,
  onGenerate,
  isGenerating
}: ControlBarProps) {
  const substyles = SUBSTYLE_OPTIONS[controls.familyId] ?? [];
  const supportedChangeRates = CHANGE_RATE_OPTIONS_BY_SUBSTYLE[controls.substyleId] ?? ['one_bar'];
  const availableChangeRateOptions = CHORD_CHANGE_RATE_OPTIONS.filter((option) =>
    supportedChangeRates.includes(option.value)
  );
  const keyModeValue = `${controls.key}:${controls.scaleMode}`;

  return (
    <header className="control-bar panel">
      <div className="control-bar__header">
        <div className="control-bar__title-group">
          <span className="eyebrow">Loop-first v1</span>
          <h1 className="control-bar__title">Chord loop generator</h1>
          <p className="control-bar__subtitle">
            Pick a style, key, loop length, and color. Generate a clean browser-side loop, preview
            it, and export MIDI.
          </p>
        </div>

        <div className="control-bar__actions">
          <button
            className="button button--primary"
            disabled={isGenerating}
            onClick={onGenerate}
            type="button"
          >
            {isGenerating ? 'Generating...' : 'Generate Loop'}
          </button>

          <div className="settings-anchor">
            <button
              aria-expanded={settingsOpen}
              className="button button--ghost"
              onClick={onToggleSettings}
              type="button"
            >
              Preferences
            </button>

            {settingsOpen ? (
              <SettingsMenu
                preferences={preferences}
                onPreferencesChange={onPreferencesChange}
                onClose={onCloseSettings}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="control-grid">
        <label className="field">
          <span className="field__label">Family</span>
          <select
            className="field__control"
            value={controls.familyId}
            onChange={(event) => onControlsChange({ familyId: event.target.value })}
          >
            {FAMILY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Substyle</span>
          <select
            className="field__control"
            value={controls.substyleId}
            onChange={(event) => onControlsChange({ substyleId: event.target.value })}
          >
            {substyles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Key</span>
          <select
            className="field__control"
            value={keyModeValue}
            onChange={(event) => {
              const [key, scaleMode] = event.target.value.split(':');
              onControlsChange({
                key,
                scaleMode: scaleMode === 'minor' ? 'minor' : 'major'
              });
            }}
          >
            {KEY_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Bars</span>
          <select
            className="field__control"
            value={controls.loopBars}
            onChange={(event) =>
              onControlsChange({
                loopBars: Number.parseInt(event.target.value, 10) as ShellControlState['loopBars']
              })
            }
          >
            {LOOP_BAR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Chord Length</span>
          <select
            className="field__control"
            value={controls.chordChangeRate}
            onChange={(event) =>
              onControlsChange({
                chordChangeRate: event.target.value as ShellControlState['chordChangeRate']
              })
            }
          >
            {availableChangeRateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Spice / Color</span>
          <select
            className="field__control"
            value={controls.spiceLevel}
            onChange={(event) =>
              onControlsChange({ spiceLevel: Number.parseInt(event.target.value, 10) || 1 })
            }
          >
            {SPICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="control-bar__status">
        <span className="chip">Loop-only surface</span>
        <span className="chip">{controls.loopBars} bars</span>
        <span className="chip">{getChordChangeRateLabel(controls.chordChangeRate)}</span>
      </div>
    </header>
  );
}
