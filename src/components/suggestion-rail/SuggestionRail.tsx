import { VARIATION_DISPLAY_ORDER, getVariationVersionLabel } from '../../core/utils/variation-display.ts';
import type { SuggestionItem, VariationType } from '../../core/types';

interface SuggestionRailProps {
  suggestions: SuggestionItem[];
  compact: boolean;
  activeVariationTypes: VariationType[];
}

export function SuggestionRail({
  suggestions,
  compact,
  activeVariationTypes
}: SuggestionRailProps) {
  const suggestionsByType = new Map(suggestions.map((suggestion) => [suggestion.type, suggestion]));
  const hasProgression = suggestions.length > 0;

  return (
    <aside className="suggestion-rail panel" aria-label="Suggestion rail">
      <div>
        <span className="eyebrow">Right-side rail</span>
        <h2 className="suggestion-rail__title">Suggestions</h2>
        <p className="suggestion-rail__copy">
          Each card is a variation direction for the same progression identity, not a totally new
          progression.
        </p>
      </div>

      {hasProgression ? (
        <div className="suggestion-list">
          {VARIATION_DISPLAY_ORDER.map((type) => {
            const suggestion = suggestionsByType.get(type);
            const isActive = activeVariationTypes.includes(type);
            const isAuthored = (suggestion?.appliesVariationIds.length ?? 0) > 0;

            return (
              <article
                className={`suggestion-card ${isActive ? 'suggestion-card--active' : ''} ${!isAuthored ? 'suggestion-card--advisory' : ''}`}
                key={type}
              >
                <div className="suggestion-card__header">
                  <span className="chip">{type.replace(/_/g, ' ')}</span>
                  <h3 className="suggestion-card__title">{getVariationVersionLabel(type)}</h3>
                </div>
                <p className="suggestion-card__copy">
                  {suggestion?.summary ?? 'This variation is not available for the current progression.'}
                </p>
                {suggestion?.previewRomanNumerals?.length ? (
                  <div className="suggestion-card__preview">
                    {suggestion.previewRomanNumerals.join(' / ')}
                  </div>
                ) : null}
                <div className="suggestion-card__status">
                  {isActive
                    ? 'Current result already leans this way.'
                    : isAuthored
                      ? 'Pack-authored variation path.'
                      : 'Generic fallback preview based on the frozen variation type.'}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="suggestion-placeholder">
          <h3 className="suggestion-placeholder__title">No suggestion items yet</h3>
          <p className="suggestion-placeholder__copy">
            Generate first to unlock all nine variation directions for the selected pack.
          </p>
        </div>
      )}

      <div className="rail-note">
        {hasProgression
          ? 'Use the rail as an edit map: each card shows how to shift the current progression without abandoning its style pocket.'
          : `Rail width is currently ${compact ? 'compact' : 'standard'} and persists through preferences.`}
      </div>
    </aside>
  );
}
