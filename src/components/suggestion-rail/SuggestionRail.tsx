interface SuggestionRailProps {
  hasProgression: boolean;
  compact: boolean;
}

export function SuggestionRail({ hasProgression, compact }: SuggestionRailProps) {
  return (
    <aside className="suggestion-rail panel" aria-label="Suggestion rail">
      <div>
        <span className="eyebrow">Right-side rail</span>
        <h2 className="suggestion-rail__title">Suggestions</h2>
        <p className="suggestion-rail__copy">
          This rail is reserved for variation ideas and special moves once the generator exists.
        </p>
      </div>

      <div className="suggestion-placeholder">
        <h3 className="suggestion-placeholder__title">No suggestion items yet</h3>
        <p className="suggestion-placeholder__copy">
          The scaffold intentionally avoids fake harmonic output. After generation is wired, this
          column will consume explicit suggestion payloads from the runtime contract.
        </p>
      </div>

      <div className="rail-note">
        {hasProgression
          ? 'Suggestion rendering is waiting on real runtime payloads.'
          : `Rail width is currently ${compact ? 'compact' : 'standard'} and persists through preferences.`}
      </div>
    </aside>
  );
}
