interface ResultAreaProps {
  hasProgression: boolean;
  showFunctionLabels: boolean;
  downloadDisabledReason: string;
}

export function ResultArea({
  hasProgression,
  showFunctionLabels,
  downloadDisabledReason
}: ResultAreaProps) {
  return (
    <section className="result-area panel">
      <div className="result-area__header">
        <div className="result-area__title-group">
          <span className="eyebrow">Center result area</span>
          <h2 className="result-area__title">Generated progression</h2>
          <p className="result-area__copy">
            This panel is scaffolded for Roman numerals, chord names, function labels, and export.
          </p>
        </div>

        <button
          className="button button--primary button--midi"
          disabled
          title={downloadDisabledReason}
          type="button"
        >
          Download MIDI
        </button>
      </div>

      <div className="result-surface">
        {hasProgression ? null : (
          <div className="empty-state">
            <div className="empty-state__card">
              <div>
                <span className="eyebrow">Empty state</span>
                <h3 className="empty-state__title">No progression yet</h3>
              </div>

              <p className="empty-state__copy">
                The scaffold is ready, but progression generation is intentionally out of scope for
                this pass. Once wired, this space will show Roman numerals first, chord names
                alongside them, and optional function labels.
              </p>

              <div className="empty-state__chips">
                <span className="chip">Roman numerals</span>
                <span className="chip">Chord names</span>
                <span className="chip">
                  Function labels {showFunctionLabels ? 'enabled' : 'hidden'}
                </span>
                <span className="chip">MIDI export</span>
              </div>

              <div className="empty-state__footer">
                <div className="hint-box">
                  Use the top bar to pick a family, substyle, section, key, spice level, and MIDI
                  mode. Generator logic and MIDI event creation remain stubbed.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
