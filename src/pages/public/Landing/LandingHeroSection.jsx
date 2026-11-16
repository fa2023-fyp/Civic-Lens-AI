import { useEffect, useMemo, useState } from 'react';
import { FloatingOrbs } from '../../../components/marketing/Showcase.jsx';
import { Button } from '../../../components/ui/Button/Button.jsx';
import { Chip } from '../../../components/ui/Chip/Chip.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { landingContent } from './landing.content.js';
import { useReducedMotion } from './landing.shared.jsx';

function AnimatedComplaintCard() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const examples = landingContent.examples;
  const [index, setIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [visibleFields, setVisibleFields] = useState([]);
  const sample = examples[index];
  const fields = useMemo(
    () => [
      { key: 'language', label: t('landing.card.language'), value: sample.language, tone: 'info' },
      { key: 'category', label: t('landing.card.category'), value: sample.category, tone: 'brand' },
      { key: 'issue', label: t('landing.card.issue'), value: sample.issue, tone: 'success' },
      { key: 'duration', label: t('landing.card.duration'), value: sample.duration, tone: 'warning' },
      { key: 'urgency', label: t('landing.card.urgency'), value: sample.urgency, tone: 'danger' },
      { key: 'department', label: t('landing.card.department'), value: sample.department, tone: 'ai' },
    ],
    [sample, t],
  );

  useEffect(() => {
    setVisibleFields([]);
    if (reducedMotion) {
      setTypedText(sample.text);
      setVisibleFields(fields.map((field) => field.key));
      return undefined;
    }

    let charIndex = 0;
    setTypedText('');
    const typeTimer = window.setInterval(() => {
      charIndex += 1;
      setTypedText(sample.text.slice(0, charIndex));
      if (charIndex >= sample.text.length) {
        window.clearInterval(typeTimer);
      }
    }, 20);

    const revealTimer = window.setInterval(() => {
      setVisibleFields((current) => {
        const nextIndex = current.length;
        if (nextIndex >= fields.length) {
          window.clearInterval(revealTimer);
          return current;
        }
        return [...current, fields[nextIndex].key];
      });
    }, 220);

    const nextSampleTimer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % examples.length);
    }, 4200);

    return () => {
      window.clearInterval(typeTimer);
      window.clearInterval(revealTimer);
      window.clearTimeout(nextSampleTimer);
    };
  }, [examples.length, fields, index, reducedMotion, sample]);

  return (
    <div className="landing-hero__sample-card" aria-live="polite">
      <div className="landing-hero__card-header">
        <span className="landing-hero__card-badge">{t('landing.card.simulated')}</span>
        <span className="landing-hero__status-dot" aria-hidden="true" />
      </div>
      <div className="landing-hero__sample-text" aria-label={sample.text}>
        {typedText || sample.text}
      </div>
      <div className="landing-hero__field-list">
        {fields.map((field) => (
          <div
            key={field.key}
            className={`landing-hero__field ${visibleFields.includes(field.key) ? 'is-visible' : ''}`}
          >
            <span className="landing-hero__field-label">{field.label}</span>
            <Chip tone={field.tone} className="landing-hero__field-value">
              {field.value}
            </Chip>
          </div>
        ))}
      </div>
      <div className="landing-hero__confidence-list">
        {sample.scores.map((score) => (
          <div className="landing-hero__confidence-row" key={score.label}>
            <div className="landing-hero__confidence-meta">
              <span>{score.label}</span>
              <strong>{Math.round(score.value * 100)}%</strong>
            </div>
            <div className="landing-hero__confidence-meter" aria-hidden="true">
              <span style={{ width: `${Math.round(score.value * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingHeroSection() {
  const { t } = useI18n();

  return (
    <section id="home" className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-hero__copy">
        <p className="landing-hero__kicker">{t('landing.hero.kicker')}</p>
        <h1 id="landing-title" className="landing-hero__headline">{t('landing.hero.headline')}</h1>
        <p className="landing-hero__lead">{t('landing.hero.lead')}</p>
        <div className="landing-hero__actions">
          <Button as="a" href="/citizen/complaints/new" variant="cta" iconEnd="arrow-right">
            {t('landing.hero.primaryCta')}
          </Button>
          <Button as="a" href="#how-it-works" variant="ghost" className="landing-hero__ghost-action">
            {t('landing.hero.secondaryCta')}
          </Button>
        </div>
      </div>

      <div className="landing-hero__visual">
        <FloatingOrbs className="landing-hero__orbs">
          <AnimatedComplaintCard />
        </FloatingOrbs>
      </div>
    </section>
  );
}
