import type { UserPreferences } from '../../storage/preferences';

interface SettingsMenuProps {
  preferences: UserPreferences;
  onPreferencesChange: (patch: Partial<UserPreferences>) => void;
  onClose: () => void;
}

export function SettingsMenu({
  preferences,
  onPreferencesChange,
  onClose
}: SettingsMenuProps) {
  return (
    <section className="settings-menu" aria-label="Settings and preferences">
      <div className="settings-menu__header">
        <div>
          <h2 className="settings-menu__title">Preferences</h2>
          <p className="settings-menu__copy">
            Keep the shell clean. These settings only change presentation and motion.
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
            onPreferencesChange({
              theme: preferences.theme === 'light' ? 'dark' : 'light'
            })
          }
          type="button"
        >
          <span className="settings-toggle__meta">
            <span className="settings-toggle__title">Theme</span>
            <span className="settings-toggle__copy">
              Switch between the light and dark studio surfaces.
            </span>
          </span>
          <span className="toggle-chip">{preferences.theme === 'light' ? 'Light' : 'Dark'}</span>
        </button>

        <button
          className="settings-toggle"
          onClick={() =>
            onPreferencesChange({ showFunctionLabels: !preferences.showFunctionLabels })
          }
          type="button"
        >
          <span className="settings-toggle__meta">
            <span className="settings-toggle__title">Function labels</span>
            <span className="settings-toggle__copy">
              Keep tonic, dominant, and contrast labels visible in the loop cards.
            </span>
          </span>
          <span className="toggle-chip">{preferences.showFunctionLabels ? 'On' : 'Off'}</span>
        </button>

        <button
          className="settings-toggle"
          onClick={() => onPreferencesChange({ reducedMotion: !preferences.reducedMotion })}
          type="button"
        >
          <span className="settings-toggle__meta">
            <span className="settings-toggle__title">Reduced motion</span>
            <span className="settings-toggle__copy">
              Remove non-essential motion from the shell.
            </span>
          </span>
          <span className="toggle-chip">{preferences.reducedMotion ? 'On' : 'Off'}</span>
        </button>
      </div>
    </section>
  );
}
