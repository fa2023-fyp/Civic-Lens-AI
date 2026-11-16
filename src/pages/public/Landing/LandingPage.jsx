import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { FloatingOrbs } from '../../../components/marketing/Showcase.jsx';
import { FAQ, ImageBand, PhoneMockup, StepsRail } from '../../../components/marketing/index.js';
import { Button } from '../../../components/ui/Button/Button.jsx';
import { Chip } from '../../../components/ui/Chip/Chip.jsx';
import { EMERGENCY_NUMBERS } from '../../../config/constants.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { api } from '../../../services/api.js';
import { landingContent } from './landing.content.js';
import './LandingPage.css';

const LandingAnalyzerSection = lazy(() => import('./LandingAnalyzerSection.jsx'));

function useReducedMotion() {
  const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const [reducedMotion, setReducedMotion] = useState(mediaQuery ? mediaQuery.matches : false);

  useEffect(() => {
    if (!mediaQuery) return undefined;
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [mediaQuery]);

  return reducedMotion;
}

function AnimatedNumber({ value, suffix = '' }) {
  const { formatNumber } = useI18n();
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(reducedMotion ? value : 0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setCurrent(value);
      hasAnimated.current = true;
      return;
    }

    if (hasAnimated.current) return;

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(value * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      setCurrent(value);
      hasAnimated.current = true;
    }

    requestAnimationFrame(tick);
  }, [reducedMotion, value]);

  return (
    <span>
      {formatNumber(current, { maximumFractionDigits: 0 })}
      {suffix}
    </span>
  );
}

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
      return;
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

function StatStrip() {
  const { t } = useI18n();

  return (
    <section className="landing-stats-section" aria-label={t('landing.stats.ariaLabel')}>
      <div className="landing-stats">
        {landingContent.stats.map((stat) => (
          <div key={stat.key} className="landing-stat">
            <div className="landing-stat__value">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="landing-stat__label">{t(stat.labelKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SnapshotSection() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(landingContent.snapshotFallback);

  useEffect(() => {
    let ignore = false;

    async function loadSnapshot() {
      try {
        const session = await api.auth.login({
          email: 'admin@demo.civiclens.test',
          password: 'Demo123!',
        });
        const overview = await api.analytics.overview({ token: session.token });
        const nextStats = [
          { key: 'received', label: 'landing.snapshot.received', value: overview.totalComplaints ?? 1248 },
          { key: 'verified', label: 'landing.snapshot.verified', value: overview.resolved ?? 842 },
          { key: 'unverified', label: 'landing.snapshot.unverified', value: 132 },
          { key: 'reopened', label: 'landing.snapshot.reopened', value: 19, suffix: '%' },
          { key: 'medianHours', label: 'landing.snapshot.medianHours', value: 18 },
          { key: 'clusters', label: 'landing.snapshot.clusters', value: overview.activeClusters ?? 8 },
          { key: 'onTrack', label: 'landing.snapshot.onTrack', value: 76, suffix: '%' },
          { key: 'languages', label: 'landing.snapshot.languages', value: 4 },
        ];
        if (!ignore) setStats(nextStats);
      } catch (error) {
        if (!ignore) setStats(landingContent.snapshotFallback);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSnapshot();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="landing-section landing-section--tint reveal-section" style={{ '--i': 1 }}>
      <div className="landing-section__inner">
        <div className="landing-section__heading">
          <p className="landing-section__kicker">{t('landing.snapshot.kicker')}</p>
          <h2>{t('landing.snapshot.title')}</h2>
          <p>{t('landing.snapshot.body')}</p>
        </div>

        <div className="landing-snapshot-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={`snapshot-skeleton-${index}`} className="landing-snapshot-card is-loading">
                  <span className="skeleton-line skeleton-line--lg" />
                  <span className="skeleton-line skeleton-line--sm" />
                </div>
              ))
            : stats.map((metric) => (
                <div key={metric.key} className="landing-snapshot-card">
                  <span className="demo-badge">{t('landing.common.demoData')}</span>
                  <strong className="landing-snapshot-card__value">
                    <AnimatedNumber value={metric.value} suffix={metric.suffix ?? ''} />
                  </strong>
                  <span className="landing-snapshot-card__label">{t(metric.label)}</span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

function RecognitionSection() {
  const { t } = useI18n();

  return (
    <section className="landing-section reveal-section" style={{ '--i': 2 }}>
      <div className="landing-section__inner">
        <div className="landing-section__heading landing-section__heading--centered">
          <p className="landing-section__kicker">{t('landing.recognition.kicker')}</p>
          <h2>{t('landing.recognition.title')}</h2>
        </div>
        <div className="landing-card-grid landing-card-grid--quarters">
          {landingContent.recognition.map((item) => (
            <article key={item.id} className="landing-card landing-card--white">
              <h3>{t(item.titleKey)}</h3>
              <p>{t(item.bodyKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarsSection() {
  const { t } = useI18n();

  return (
    <section className="landing-section landing-section--tint reveal-section" style={{ '--i': 3 }}>
      <div className="landing-section__inner">
        <div className="landing-section__heading landing-section__heading--centered">
          <p className="landing-section__kicker">{t('landing.pillars.kicker')}</p>
          <h2>{t('landing.pillars.title')}</h2>
        </div>
        <div className="landing-card-grid landing-card-grid--quarters">
          {landingContent.pillars.map((item) => (
            <article key={item.id} className="landing-card landing-card--tint">
              <h3>{t(item.titleKey)}</h3>
              <p>{t(item.bodyKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { t } = useI18n();

  return (
    <section className="landing-section reveal-section" style={{ '--i': 4 }}>
      <div className="landing-section__inner">
        <div className="landing-section__heading landing-section__heading--centered">
          <p className="landing-section__kicker">{t('landing.services.kicker')}</p>
          <h2>{t('landing.services.title')}</h2>
        </div>
        <div className="landing-card-grid landing-card-grid--thirds">
          {landingContent.services.map((item) => (
            <article key={item.id} className="landing-card landing-card--white">
              <h3>{t(item.titleKey)}</h3>
              <p>{t(item.bodyKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  const { t } = useI18n();
  const steps = landingContent.journey.map((step) => ({
    id: step.id,
    title: t(step.titleKey),
    description: t(step.descriptionKey),
  }));

  return (
    <section
      id="journey"
      className="landing-section landing-section--tint landing-anchor reveal-section"
      style={{ '--i': 7 }}
      aria-labelledby="landing-journey-title"
    >
      <div className="landing-section__inner">
        <div className="landing-section__heading landing-section__heading--centered">
          <p className="landing-section__kicker">{t('landing.journey.kicker')}</p>
          <h2 id="landing-journey-title">{t('landing.journey.title')}</h2>
        </div>
        <StepsRail steps={steps} label={t('landing.journey.stepsLabel')} />
      </div>
    </section>
  );
}

function PhoneSection() {
  const { t } = useI18n();

  return (
    <section
      className="landing-section reveal-section"
      style={{ '--i': 9 }}
      aria-labelledby="landing-phone-title"
    >
      <div className="landing-section__inner landing-phone">
        <div className="landing-phone__copy">
          <p className="landing-section__kicker">{t('landing.phone.kicker')}</p>
          <h2 id="landing-phone-title">{t('landing.phone.title')}</h2>
          <ul className="landing-phone__features">
            {landingContent.phoneFeatures.map((feature) => (
              <li key={feature}>{t(`landing.phone.${feature}`)}</li>
            ))}
          </ul>
          <div className="landing-phone__qr-wrap">
            <div className="landing-phone__qr" role="img" aria-label={t('landing.phone.qrPlaceholder')} />
            <span>{t('landing.phone.qrCaption')}</span>
          </div>
        </div>

        <PhoneMockup label={t('landing.phone.mockupLabel')} className="landing-phone__mockup">
          <div className="landing-phone__screen-content">
            <span className="landing-phone__brand">{t('app.name')}</span>
            <h3>{t('landing.phone.screenTitle')}</h3>
            <p>{t('landing.phone.screenPrompt')}</p>
            <div className="landing-phone__field">
              <span>{t('landing.phone.categoryLabel')}</span>
              <strong>{t('landing.phone.categoryPlaceholder')}</strong>
            </div>
            <div className="landing-phone__field landing-phone__field--text">
              <span>{t('landing.phone.descriptionLabel')}</span>
              <strong>{t('landing.phone.descriptionPlaceholder')}</strong>
            </div>
            <div className="landing-phone__submit">{t('landing.phone.submitLabel')}</div>
          </div>
        </PhoneMockup>
      </div>
    </section>
  );
}

function FAQSection() {
  const { t } = useI18n();
  const items = landingContent.faq.map((item) => ({
    id: item.id,
    question: t(item.questionKey),
    answer: t(item.answerKey),
  }));

  return (
    <section
      id="faq"
      className="landing-section landing-section--tint landing-anchor reveal-section"
      style={{ '--i': 10 }}
      aria-labelledby="landing-faq-title"
    >
      <div className="landing-section__inner">
        <div className="landing-section__heading landing-section__heading--centered">
          <p className="landing-section__kicker">{t('landing.faq.kicker')}</p>
          <h2 id="landing-faq-title">{t('landing.faq.title')}</h2>
        </div>
        <FAQ
          items={items}
          label={t('landing.faq.label')}
          oneOpen
          className="landing-faq"
        />
      </div>
    </section>
  );
}

function EmergencyNoticeSection() {
  const { t } = useI18n();

  return (
    <section
      className="landing-emergency-section reveal-section"
      style={{ '--i': 11 }}
      aria-labelledby="landing-emergency-title"
    >
      <div className="landing-section__inner landing-emergency">
        <div>
          <p className="landing-section__kicker">{t('landing.emergency.kicker')}</p>
          <h2 id="landing-emergency-title">{t('landing.emergency.title')}</h2>
          <p>{t('landing.emergency.note')}</p>
        </div>
        <ul className="landing-emergency__numbers">
          {EMERGENCY_NUMBERS.map((item) => (
            <li key={item.number}>
              <span>{t(item.labelKey)}</span>
              <a href={`tel:${item.number}`}>{item.number}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <main className="landing-page">
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

      <StatStrip />
      <SnapshotSection />
      <RecognitionSection />
      <PillarsSection />
      <ServicesSection />
      <div id="intelligence" className="landing-anchor landing-intelligence-anchor">
        <Suspense fallback={<div className="landing-analyzer-loader" aria-live="polite" />}>
          <LandingAnalyzerSection />
        </Suspense>
      </div>
      <JourneySection />
      <div
        id="image-band"
        className="landing-anchor landing-image-band-wrapper reveal-section"
        style={{ '--i': 8 }}
      >
        <ImageBand
          kicker={t('landing.imageBand.kicker')}
          headline={t('landing.imageBand.title')}
          body={t('landing.imageBand.body')}
        />
      </div>
      <PhoneSection />
      <FAQSection />
      <EmergencyNoticeSection />
    </main>
  );
}
