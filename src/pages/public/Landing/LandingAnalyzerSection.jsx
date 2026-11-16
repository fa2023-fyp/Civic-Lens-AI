import { useEffect, useMemo, useState } from 'react';
import { TypingDots } from '../../../components/ui/TypingDots/TypingDots.jsx';
import { Button } from '../../../components/ui/Button/Button.jsx';
import { api } from '../../../services/api.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import './LandingAnalyzerSection.css';

const SAMPLE_TEXT = 'Gali mein 3 din se gutter overflow ho raha hai aur smell bohat zyada hai.';
const EXAMPLE_TEXTS = {
  en: 'Street drains are overflowing near the market and the sewer smell is strong.',
  ur: 'گلی میں نالی ابل رہی ہے اور بدبو بہت زیادہ ہے۔',
  roman: 'Gali mein gutter overflow ho raha hai aur smell bohat zyada hai.',
  mixed: 'گلی میں drain band hai aur badboo bahut zyada hai.',
};

function Pipeline({ activeStep }) {
  const steps = ['language', 'category', 'entity', 'urgency'];
  return (
    <div className="landing-analyzer__pipeline" aria-live="polite">
      {steps.map((step, index) => (
        <span
          key={step}
          className={`landing-analyzer__pipeline-step ${index <= activeStep ? 'is-active' : ''}`}
        >
          {step}
        </span>
      ))}
    </div>
  );
}

function metricBar(label, value) {
  return (
    <div className="landing-analyzer__metric" key={label}>
      <div className="landing-analyzer__metric-head">
        <span>{label}</span>
        <strong>{Math.round(value * 100)}%</strong>
      </div>
      <div className="landing-analyzer__metric-bar" aria-hidden="true">
        <span style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}

function highlightEntity(text, entities = []) {
  if (!entities.length) return text;
  const ranges = entities
    .map((entity) => ({ start: entity.span[0], end: entity.span[1], value: entity.value }))
    .sort((a, b) => a.start - b.start);

  const parts = [];
  let cursor = 0;

  ranges.forEach((range) => {
    if (range.start > cursor) parts.push(text.slice(cursor, range.start));
    parts.push(<mark key={`${range.start}-${range.end}`}>{text.slice(range.start, range.end)}</mark>);
    cursor = range.end;
  });

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export function LandingAnalyzerSection() {
  const { t } = useI18n();
  const [text, setText] = useState(SAMPLE_TEXT);
  const [activeExample, setActiveExample] = useState('roman');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isLoading) return undefined;
    let index = 0;
    const timer = window.setInterval(() => {
      setStep((current) => {
        const next = Math.max(current, index);
        index += 1;
        return next;
      });
      if (index >= 4) window.clearInterval(timer);
    }, 500);
    return () => window.clearInterval(timer);
  }, [isLoading]);

  const examples = useMemo(
    () => [
      { id: 'en', label: 'English', text: EXAMPLE_TEXTS.en },
      { id: 'ur', label: 'Urdu', text: EXAMPLE_TEXTS.ur },
      { id: 'roman', label: 'Roman Urdu', text: EXAMPLE_TEXTS.roman },
      { id: 'mixed', label: 'Mixed', text: EXAMPLE_TEXTS.mixed },
    ],
    [],
  );

  async function handleAnalyze() {
    setIsLoading(true);
    setStep(-1);
    setResult(null);

    const analysis = await api.ai.analyze(text || SAMPLE_TEXT);
    setResult(analysis);
    setIsLoading(false);
    setStep(3);
  }

  return (
    <section className="landing-section landing-section--dark reveal-section" style={{ '--i': 5 }}>
      <div className="landing-section__inner landing-analyzer">
        <div className="landing-analyzer__copy">
          <p className="landing-section__kicker">{t('landing.analyzer.kicker')}</p>
          <h2>{t('landing.analyzer.title')}</h2>
          <ul className="landing-analyzer__list">
            {[
              'landing.analyzer.itemLanguage',
              'landing.analyzer.itemConfidence',
              'landing.analyzer.itemDuplicates',
              'landing.analyzer.itemSla',
              'landing.analyzer.itemGeo',
              'landing.analyzer.itemAudit',
            ].map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>

        <div className="landing-analyzer__panel" aria-live="polite">
          <label className="landing-analyzer__label" htmlFor="landing-ai-demo-text">
            {t('landing.analyzer.demoLabel')}
          </label>
          <textarea
            id="landing-ai-demo-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
          />

          <div className="landing-analyzer__chips" aria-label={t('landing.analyzer.exampleChips')}>
            {examples.map((example) => (
              <button
                key={example.id}
                type="button"
                className={`landing-analyzer__chip ${activeExample === example.id ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveExample(example.id);
                  setText(example.text);
                }}
              >
                {example.label}
              </button>
            ))}
          </div>

          <div className="landing-analyzer__actions">
            <Button onClick={handleAnalyze} variant="cta" loading={isLoading}>
              {t('landing.analyzer.analyzeButton')}
            </Button>
            <span className="landing-analyzer__caption">{t('landing.analyzer.caption')}</span>
          </div>

          {isLoading ? (
            <div className="landing-analyzer__status">
              <TypingDots label={t('landing.analyzer.typing')} />
              <Pipeline activeStep={step} />
            </div>
          ) : null}

          {!isLoading && result ? (
            <div className="landing-analyzer__result" key={result.language ?? text}>
              <div className="landing-analyzer__result-meta">
                <span>{result.language}</span>
                <span>{result.category.label}</span>
              </div>
              <div className="landing-analyzer__rich-text">
                <strong>{t('landing.analyzer.entities')}:</strong>
                <p>{highlightEntity(text, result.entities)}</p>
              </div>
              <div className="landing-analyzer__metrics">
                {metricBar(t('landing.analyzer.languageMetric'), result.language_confidence ?? 0.5)}
                {metricBar(t('landing.analyzer.categoryMetric'), result.category.confidence ?? 0.5)}
                {metricBar(t('landing.analyzer.urgencyMetric'), result.urgency.confidence ?? 0.5)}
                {metricBar(t('landing.analyzer.departmentMetric'), result.department.confidence ?? 0.5)}
              </div>
              <div className="landing-analyzer__detail-grid">
                <div>
                  <span>{t('landing.analyzer.urgency')}</span>
                  <strong>{result.urgency.label}</strong>
                </div>
                <div>
                  <span>{t('landing.analyzer.department')}</span>
                  <strong>{result.department.label}</strong>
                </div>
                <div>
                  <span>{t('landing.analyzer.related')}</span>
                  <strong>{result.similar?.length ?? 0}</strong>
                </div>
                <div>
                  <span>{t('landing.analyzer.confidence')}</span>
                  <strong>{Math.round((result.language_confidence + result.category.confidence + result.urgency.confidence) / 3 * 100)}%</strong>
                </div>
              </div>
              <p className="landing-analyzer__explanation">
                <strong>{t('landing.analyzer.explanation')}:</strong> {result.explanation}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default LandingAnalyzerSection;
