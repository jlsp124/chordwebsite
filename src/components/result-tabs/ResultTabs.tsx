import type { ExplanationItem } from '../../core/types';
import type { ExplanationType, SelectOption } from '../../core/options';

interface ResultTabsProps {
  activeTab: ExplanationType;
  onTabChange: (nextTab: ExplanationType) => void;
  tabOptions: SelectOption<ExplanationType>[];
  explanations: ExplanationItem[];
}

export function ResultTabs({
  activeTab,
  onTabChange,
  tabOptions,
  explanations
}: ResultTabsProps) {
  const activeItems = explanations.filter((item) => item.type === activeTab);
  const hasProgression = explanations.length > 0;

  return (
    <section className="tabs-panel panel">
      <div className="tabs-panel__header">
        <div>
          <span className="eyebrow">Tabs under result</span>
          <h2 className="tabs-panel__title">Explanation surface</h2>
        </div>

        <div className="tab-list" role="tablist" aria-label="Explanation tabs">
          {tabOptions.map((tab) => (
            <button
              key={tab.value}
              aria-selected={activeTab === tab.value}
              className={`tab-button ${activeTab === tab.value ? 'tab-button--active' : ''}`}
              onClick={() => onTabChange(tab.value)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tabs-panel__body" role="tabpanel">
        {hasProgression && activeItems.length > 0 ? (
          <div className="tab-item-list">
            {activeItems.map((item) => (
              <article className="tab-item" key={item.id}>
                <h3 className="tabs-panel__body-title">{item.title}</h3>
                <p className="tabs-panel__body-copy">{item.body}</p>
                {item.relatedChordIndexes?.length ? (
                  <div className="tabs-panel__links">
                    Related chords: {item.relatedChordIndexes.map((index) => index + 1).join(', ')}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <>
            <h3 className="tabs-panel__body-title">
              {tabOptions.find((option) => option.value === activeTab)?.label ?? 'Explanation'}
            </h3>
            <p className="tabs-panel__body-copy">
              {hasProgression
                ? 'This progression did not return copy for the selected tab.'
                : 'Generate first to unlock pack-driven explanation copy for why it works, add-notes ideas, transitions, section guidance, and learning notes.'}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
