import { SettingsMenu } from '../settings-menu/SettingsMenu';
import {
  FAMILY_OPTIONS,
  KEY_OPTIONS,
  MIDI_MODE_OPTIONS,
  SCALE_OPTIONS,
  SECTION_OPTIONS,
  SPICE_OPTIONS,
  SUBSTYLE_OPTIONS,
  type ShellControlState
} from '../../core/options';
import type { UserPreferences } from '../../storage/preferences';

interface ControlBarProps {
  controls: ShellControlState;
  onControlsChange: (patch: Partial<ShellControlState>) => void;
  preferences: UserPreferences;
  onPreferencesChange: (patch: Partial<UserPreferences>) => void;
  onToggleTheme: () => void;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  runtimeBasePath: string;
  manifestUrl: string;
}

export function ControlBar({
  controls,
  onControlsChange,
  preferences,
  onPreferencesChange,
  onToggleTheme,
  settingsOpen,
  onToggleSettings,
  onCloseSettings,
  onGenerate,
  isGenerating,
  runtimeBasePath,
  manifestUrl
}: ControlBarProps) {
  const substyles = SUBSTYLE_OPTIONS[controls.familyId] ?? [];

  return (
    <header className="control-bar panel">
      <div className="control-bar__header">
        <div className="control-bar__title-group">
          <span className="eyebrow">Browser-side generator</span>
          <h1 className="control-bar__title">Chord progression workspace</h1>
          <p className="control-bar__subtitle">
            Deterministic Roman-numeral generation runs locally from authored packs. Pick a family,
            seed, section, and key, then generate a progression with explanations and variation
            ideas.
          </p>
        </div>

        <div className="control-bar__actions">
          <button
            className="button button--secondary"
            disabled={isGenerating}
            onClick={onGenerate}
            type="button"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>

          <button className="button button--ghost" onClick={onToggleTheme} type="button">
            {preferences.theme === 'light' ? 'Dark theme' : 'Light theme'}
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
                runtimeBasePath={runtimeBasePath}
                manifestUrl={manifestUrl}
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
          <span className="field__label">Seed</span>
          <input
            className="field__control"
            value={controls.seed}
            onChange={(event) => onControlsChange({ seed: event.target.value })}
            placeholder="Enter deterministic seed"
            type="text"
          />
        </label>

        <label className="field">
          <span className="field__label">Section</span>
          <select
            className="field__control"
            value={controls.sectionIntent}
            onChange={(event) =>
              onControlsChange({
                sectionIntent: event.target.value as ShellControlState['sectionIntent']
              })
            }
          >
            {SECTION_OPTIONS.map((option) => (
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
            value={controls.key}
            onChange={(event) => onControlsChange({ key: event.target.value })}
          >
            {KEY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Scale</span>
          <select
            className="field__control"
            value={controls.scaleMode}
            onChange={(event) =>
              onControlsChange({
                scaleMode: event.target.value as ShellControlState['scaleMode']
              })
            }
          >
            {SCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Spice</span>
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

        <label className="field">
          <span className="field__label">MIDI mode</span>
          <select
            className="field__control"
            value={controls.midiMode}
            onChange={(event) =>
              onControlsChange({ midiMode: event.target.value as ShellControlState['midiMode'] })
            }
          >
            {MIDI_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
