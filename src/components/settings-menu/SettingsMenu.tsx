import type { UserPreferences } from '../../storage/preferences';

interface SettingsMenuProps {
  preferences: UserPreferences;
  onPreferencesChange: (patch: Partial<UserPreferences>) => void;
  onClose: () => void;
  runtimeBasePath: string;
  manifestUrl: string;
}

export function SettingsMenu({
  preferences,
  onPreferencesChange,
  onClose,
  runtimeBasePath,
  manifestUrl
}: SettingsMenuProps) {
  return (
    <section className="settings-menu" aria-label="Settings and preferences">
      <div className="settings-menu__header">
        <div>
          <h2 className="settings-menu__title">Preferences</h2>
          <p className="settings-menu__copy">
            These toggles shape how the generated progression is displayed, not how the musical
            engine chooses harmony.
          </p>
        </div>

        <button className="button button--ghost" onClick={onClose} type="button">
          Close
        </button>
      </div>

      <div className="settings-menu__group">
        <button
          className="settings-toggle"
          onClick={() =>
            onPreferencesChange({ showFunctionLabels: !preferences.showFunctionLabels })
          }
          type="button"
        >
          <span className="settings-toggle__meta">
            <span className="settings-toggle__title">Show function labels</span>
            <span className="settings-toggle__copy">
              Keeps the learning layer visible once results exist.
            </span>
          </span>
          <span className="toggle-chip">{preferences.showFunctionLabels ? 'On' : 'Off'}</span>
        </button>

        <button
          className="settings-toggle"
          onClick={() => onPreferencesChange({ compactRail: !preferences.compactRail })}
          type="button"
        >
          <span className="settings-toggle__meta">
            <span className="settings-toggle__title">Compact suggestion rail</span>
            <span className="settings-toggle__copy">
              Narrows the right column for more center space.
            </span>
          </span>
          <span className="toggle-chip">{preferences.compactRail ? 'On' : 'Off'}</span>
        </button>

        <button
          className="settings-toggle"
          onClick={() => onPreferencesChange({ reducedMotion: !preferences.reducedMotion })}
          type="button"
        >
          <span className="settings-toggle__meta">
            <span className="settings-toggle__title">Reduced motion</span>
            <span className="settings-toggle__copy">
              Turns off non-essential movement in the shell.
            </span>
          </span>
          <span className="toggle-chip">{preferences.reducedMotion ? 'On' : 'Off'}</span>
        </button>
      </div>

      <div className="settings-menu__diagnostics">
        <div className="diagnostic-line">
          <span className="diagnostic-line__label">Runtime base path</span>
          <span className="diagnostic-line__value">{runtimeBasePath}</span>
        </div>

        <div className="diagnostic-line">
          <span className="diagnostic-line__label">Manifest url</span>
          <span className="diagnostic-line__value">{manifestUrl}</span>
        </div>
      </div>
    </section>
  );
}
