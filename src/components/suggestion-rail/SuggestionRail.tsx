import type { SuggestionItem } from '../../core/types';

interface SuggestionRailProps {
  suggestions: SuggestionItem[];
  compact: boolean;
}

export function SuggestionRail({ suggestions, compact }: SuggestionRailProps) {
  const hasProgression = suggestions.length > 0;

  return (
    <aside className="suggestion-rail panel" aria-label="Suggestion rail">
      <div>
        <span className="eyebrow">Right-side rail</span>
        <h2 className="suggestion-rail__title">Suggestions</h2>
        <p className="suggestion-rail__copy">
          Variation previews keep the root identity recognizable while nudging the progression in a
          clear stylistic direction.
        </p>
      </div>

      {hasProgression ? (
        <div className="suggestion-list">
          {suggestions.map((suggestion) => (
            <article className="suggestion-card" key={suggestion.id}>
              <div className="suggestion-card__header">
                <span className="chip">{suggestion.type.replace(/_/g, ' ')}</span>
                <h3 className="suggestion-card__title">{suggestion.title}</h3>
              </div>
              <p className="suggestion-card__copy">{suggestion.summary}</p>
              {suggestion.previewRomanNumerals?.length ? (
                <div className="suggestion-card__preview">
                  {suggestion.previewRomanNumerals.join('  •  ')}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="suggestion-placeholder">
          <h3 className="suggestion-placeholder__title">No suggestion items yet</h3>
          <p className="suggestion-placeholder__copy">
            Generate first to unlock deterministic variation previews from the selected pack.
          </p>
        </div>
      )}

      <div className="rail-note">
        {hasProgression
          ? 'Suggestions are previews only in v1. They describe the next variation path but do not apply themselves yet.'
          : `Rail width is currently ${compact ? 'compact' : 'standard'} and persists through preferences.`}
      </div>
    </aside>
  );
}
