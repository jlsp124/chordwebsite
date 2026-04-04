import type { ExplanationType, SelectOption } from '../../core/options';

interface ResultTabsProps {
  activeTab: ExplanationType;
  onTabChange: (nextTab: ExplanationType) => void;
  tabOptions: SelectOption<ExplanationType>[];
  hasProgression: boolean;
}

const TAB_PLACEHOLDER_COPY: Record<ExplanationType, { title: string; body: string }> = {
  why_it_works: {
    title: 'Why It Works',
    body: 'This tab is ready for producer-first harmonic reasoning once generation results exist.'
  },
  add_notes: {
    title: 'Add Notes',
    body: 'This tab will suggest tasteful color extensions after the actual progression engine is wired.'
  },
  transition: {
    title: 'Transition',
    body: 'This tab will explain turnarounds, lifts, and bridge links using the runtime result contract.'
  },
  section_idea: {
    title: 'Section Idea',
    body: 'This tab will surface section-aware guidance for verse, pre-chorus, chorus, bridge, and full-loop use.'
  },
  learn: {
    title: 'Learn',
    body: 'This tab will connect Roman numerals, functions, and cadence behavior without becoming a textbook dump.'
  }
};

export function ResultTabs({
  activeTab,
  onTabChange,
  tabOptions,
  hasProgression
}: ResultTabsProps) {
  const activeCopy = TAB_PLACEHOLDER_COPY[activeTab];

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
        <h3 className="tabs-panel__body-title">{activeCopy.title}</h3>
        <p className="tabs-panel__body-copy">
          {hasProgression
            ? activeCopy.body
            : `${activeCopy.body} Until then, the tabs stay as structured placeholders instead of fake content.`}
        </p>
      </div>
    </section>
  );
}
