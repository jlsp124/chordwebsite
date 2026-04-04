import type { StoredProgressionEntry } from '../../storage/workspace-state';

interface SavedProgressionsPanelProps {
  favorites: StoredProgressionEntry[];
  recentHistory: StoredProgressionEntry[];
  onRecallEntry: (entry: StoredProgressionEntry) => void;
}

function renderEntryLabel(entry: StoredProgressionEntry): string {
  return `${entry.substyleName} · ${entry.seed}`;
}

function renderEntryMeta(entry: StoredProgressionEntry): string {
  return `${entry.sectionIntent.replace(/_/g, ' ')} · ${entry.controls.key} ${entry.controls.scaleMode}`;
}

export function SavedProgressionsPanel({
  favorites,
  recentHistory,
  onRecallEntry
}: SavedProgressionsPanelProps) {
  const hasEntries = favorites.length > 0 || recentHistory.length > 0;

  if (!hasEntries) {
    return null;
  }

  return (
    <section className="saved-grid" aria-label="Saved progressions">
      <article className="saved-card">
        <div className="saved-card__header">
          <div>
            <span className="eyebrow">Local only</span>
            <h3 className="saved-card__title">Favorites</h3>
          </div>
        </div>

        {favorites.length > 0 ? (
          <div className="saved-list">
            {favorites.map((entry) => (
              <button
                className="saved-entry"
                key={entry.id}
                onClick={() => onRecallEntry(entry)}
                type="button"
              >
                <span className="saved-entry__title">{renderEntryLabel(entry)}</span>
                <span className="saved-entry__meta">{renderEntryMeta(entry)}</span>
                <span className="saved-entry__preview">{entry.previewRomanNumerals.join(' / ')}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="saved-card__empty">Favorite a progression to pin a reusable seed and setting combo.</p>
        )}
      </article>

      <article className="saved-card">
        <div className="saved-card__header">
          <div>
            <span className="eyebrow">Auto-saved</span>
            <h3 className="saved-card__title">Recent History</h3>
          </div>
        </div>

        {recentHistory.length > 0 ? (
          <div className="saved-list">
            {recentHistory.map((entry) => (
              <button
                className="saved-entry"
                key={entry.id}
                onClick={() => onRecallEntry(entry)}
                type="button"
              >
                <span className="saved-entry__title">{renderEntryLabel(entry)}</span>
                <span className="saved-entry__meta">{renderEntryMeta(entry)}</span>
                <span className="saved-entry__preview">{entry.previewRomanNumerals.join(' / ')}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="saved-card__empty">Generated progressions will appear here so you can recall them quickly.</p>
        )}
      </article>
    </section>
  );
}
