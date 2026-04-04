import { buildEducationalTabs } from '../../core/utils/education.ts';
import type { GenerationBundle } from '../../core/types';
import type { ExplanationType, SelectOption } from '../../core/options';

interface ResultTabsProps {
  activeTab: ExplanationType;
  generation: GenerationBundle | null;
  onTabChange: (nextTab: ExplanationType) => void;
  tabOptions: SelectOption<ExplanationType>[];
}

export function ResultTabs({
  activeTab,
  generation,
  onTabChange,
  tabOptions
}: ResultTabsProps) {
  const tabContent = buildEducationalTabs(generation);
  const activeItems = tabContent[activeTab];
  const hasProgression = generation !== null;

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
                ? 'This progression did not return educational copy for the selected tab yet.'
                : 'Generate first to unlock producer-first explanations, extension ideas, transition reads, section ideas, and lightweight learning notes.'}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
