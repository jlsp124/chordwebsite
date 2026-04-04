import { getChordChangeRateLabel } from '../../core/utils/loop-shell.ts';
import type { GenerationMetadata, GenerationResult } from '../../core/types';
import type { ChordChangeRate, LoopBarCount } from '../../core/options';

interface ResultAreaProps {
  result: GenerationResult | null;
  metadata: GenerationMetadata | null;
  showFunctionLabels: boolean;
  downloadDisabledReason: string;
  isGenerating: boolean;
  errorMessage: string | null;
  mediaMessage: string | null;
  onDownloadMidi: () => void;
  onPreviewToggle: () => void;
  isDownloadingMidi: boolean;
  isPreviewPlaying: boolean;
  isPreviewStarting: boolean;
  previewPresetName: string | null;
  loopBars: LoopBarCount;
  chordChangeRate: ChordChangeRate;
}

export function ResultArea({
  result,
  metadata,
  showFunctionLabels,
  downloadDisabledReason,
  isGenerating,
  errorMessage,
  mediaMessage,
  onDownloadMidi,
  onPreviewToggle,
  isDownloadingMidi,
  isPreviewPlaying,
  isPreviewStarting,
  previewPresetName,
  loopBars,
  chordChangeRate
}: ResultAreaProps) {
  const hasProgression = result !== null && metadata !== null;

  return (
    <section className="result-area panel">
      <div className="result-area__header">
        <div className="result-area__title-group">
          <span className="eyebrow">Main workspace</span>
          <h2 className="result-area__title">Loop output</h2>
          <p className="result-area__copy">
            The center canvas stays dominant: Roman numerals first, chord names always visible,
            preview and download always close by.
          </p>
        </div>

        <div className="result-area__actions">
          <button
            className="button button--secondary"
            disabled={!hasProgression || isGenerating || isDownloadingMidi}
            onClick={onPreviewToggle}
            title={hasProgression ? 'Preview the current loop' : 'Generate first to preview'}
            type="button"
          >
            {isPreviewStarting
              ? 'Starting audio...'
              : isPreviewPlaying
                ? 'Stop Preview'
                : 'Start Preview'}
          </button>

          <button
            className="button button--primary button--midi"
            disabled={!hasProgression || isGenerating || isDownloadingMidi}
            onClick={onDownloadMidi}
            title={hasProgression ? 'Download MIDI' : downloadDisabledReason}
            type="button"
          >
            {isDownloadingMidi ? 'Preparing MIDI...' : 'Download MIDI'}
          </button>
        </div>
      </div>

      <div className="result-surface">
        {hasProgression ? (
          <div className="progression-panel">
            <div className="progression-summary">
              <div>
                <span className="eyebrow">{metadata.familyName}</span>
                <h3 className="progression-summary__title">{metadata.substyleName}</h3>
              </div>

              <div className="progression-summary__chips">
                <span className="chip">{loopBars} bars</span>
                <span className="chip">{getChordChangeRateLabel(chordChangeRate)}</span>
                <span className="chip">{metadata.archetypeName}</span>
                <span className="chip">{metadata.cadenceName}</span>
              </div>
            </div>

            <div className="progression-grid" role="list" aria-label="Generated loop">
              {result.chordSlots.map((slot) => (
                <article className="chord-card" key={`${slot.index}-${slot.romanNumeral}`} role="listitem">
                  <span className="chord-card__index">Step {slot.index + 1}</span>
                  <div className="chord-card__roman">{slot.romanNumeral}</div>
                  <div className="chord-card__name">{slot.chordName}</div>
                  {showFunctionLabels ? (
                    <div className="chord-card__function">{slot.functionLabel.replace(/_/g, ' ')}</div>
                  ) : null}
                  <div className="chord-card__meta">
                    <span>{slot.durationBeats} beats</span>
                    <span>{slot.decorationTags.join(' / ') || 'clean shell'}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="progression-footer">
              <div className="hint-box">
                Preview and export use <strong>{previewPresetName ?? result.midiPresetId}</strong>.
                The shell is loop-first, but playback and MIDI still come from the authored pack
                and selected key.
              </div>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="empty-state">
            <div className="empty-state__card">
              <div>
                <span className="eyebrow">Generation error</span>
                <h3 className="empty-state__title">Loop generation failed</h3>
              </div>

              <p className="empty-state__copy">{errorMessage}</p>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__card">
              <div>
                <span className="eyebrow">Empty state</span>
                <h3 className="empty-state__title">No loop yet</h3>
              </div>

              <p className="empty-state__copy">
                Generate a loop to fill this center workspace with Roman numerals, selected-key
                chord names, and browser-side preview/export actions.
              </p>

              <div className="empty-state__chips">
                <span className="chip">4 / 8 / 16 bars</span>
                <span className="chip">{getChordChangeRateLabel(chordChangeRate)}</span>
                <span className="chip">Tone.js preview</span>
                <span className="chip">MIDI export</span>
              </div>
            </div>
          </div>
        )}

        {isGenerating ? <div className="status-banner">Loading pack data and shaping a loop...</div> : null}
        {mediaMessage ? <div className="status-banner">{mediaMessage}</div> : null}
      </div>
    </section>
  );
}
