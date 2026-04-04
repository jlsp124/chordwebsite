import type { GenerationMetadata, GenerationResult } from '../../core/types';

interface ResultAreaProps {
  result: GenerationResult | null;
  metadata: GenerationMetadata | null;
  showFunctionLabels: boolean;
  downloadDisabledReason: string;
  isGenerating: boolean;
  errorMessage: string | null;
}

export function ResultArea({
  result,
  metadata,
  showFunctionLabels,
  downloadDisabledReason,
  isGenerating,
  errorMessage
}: ResultAreaProps) {
  const hasProgression = result !== null && metadata !== null;

  return (
    <section className="result-area panel">
      <div className="result-area__header">
        <div className="result-area__title-group">
          <span className="eyebrow">Center result area</span>
          <h2 className="result-area__title">Generated progression</h2>
          <p className="result-area__copy">
            Roman numerals lead the decision layer, then chord names map them into the selected key.
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
        {hasProgression ? (
          <div className="progression-panel">
            <div className="progression-summary">
              <div>
                <span className="eyebrow">
                  {metadata.mode === 'loop' ? 'Loop Mode' : 'Section Mode'}
                </span>
                <h3 className="progression-summary__title">{metadata.substyleName}</h3>
              </div>

              <div className="progression-summary__chips">
                <span className="chip">{metadata.archetypeName}</span>
                <span className="chip">{metadata.cadenceName}</span>
                <span className="chip">{metadata.rhythmName}</span>
                <span className="chip">Energy {metadata.sectionEnergyShape}</span>
              </div>
            </div>

            <div className="progression-grid" role="list" aria-label="Generated chord progression">
              {result.chordSlots.map((slot) => (
                <article className="chord-card" key={`${slot.index}-${slot.romanNumeral}`} role="listitem">
                  <span className="chord-card__index">#{slot.index + 1}</span>
                  <div className="chord-card__roman">{slot.romanNumeral}</div>
                  <div className="chord-card__name">{slot.chordName}</div>
                  {showFunctionLabels ? (
                    <div className="chord-card__function">{slot.functionLabel.replace(/_/g, ' ')}</div>
                  ) : null}
                  <div className="chord-card__meta">
                    <span>{slot.durationBeats} beats</span>
                    {slot.decorationTags.length > 0 ? (
                      <span>{slot.decorationTags.join(' · ')}</span>
                    ) : (
                      <span>clean shell</span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="progression-footer">
              <div className="hint-box">
                MIDI preset placeholder: <strong>{result.midiPresetId}</strong>. Export stays stubbed,
                but the engine already returns deterministic timing and harmony metadata.
              </div>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="empty-state">
            <div className="empty-state__card">
              <div>
                <span className="eyebrow">Generation error</span>
                <h3 className="empty-state__title">Pack loading or generation failed</h3>
              </div>

              <p className="empty-state__copy">{errorMessage}</p>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__card">
              <div>
                <span className="eyebrow">Empty state</span>
                <h3 className="empty-state__title">No progression yet</h3>
              </div>

              <p className="empty-state__copy">
                Generate a progression to populate this space with Roman numerals, selected-key chord
                names, function labels, and pack-driven metadata.
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
                  Use the top bar to pick a family, substyle, section, seed, key, spice level, and
                  MIDI mode. The harmonic engine is local and deterministic. MIDI event creation
                  remains stubbed.
                </div>
              </div>
            </div>
          </div>
        )}

        {isGenerating ? <div className="status-banner">Loading pack data and generating...</div> : null}
      </div>
    </section>
  );
}
