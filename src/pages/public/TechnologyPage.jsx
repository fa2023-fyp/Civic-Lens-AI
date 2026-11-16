import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { CTABanner } from '../../components/marketing/Showcase.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Reveal } from '../../components/marketing/Reveal.jsx';
import { Chip } from '../../components/ui/Chip/Chip.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './TechnologyPage.css';

const LandingAnalyzerSection = lazy(() => import('./Landing/LandingAnalyzerSection.jsx'));

const pipelineStages = [
  { id: 'understand', icon: 'eye' },
  { id: 'extract', icon: 'file' },
  { id: 'classify', icon: 'layers' },
  { id: 'prioritise', icon: 'flag' },
  { id: 'route', icon: 'arrow-right', flip: true },
  { id: 'relatedIssues', icon: 'map-pin' },
  { id: 'monitorSla', icon: 'clock' },
  { id: 'escalate', icon: 'alert-triangle' },
  { id: 'verify', icon: 'check-circle' },
  { id: 'audit', icon: 'clipboard' },
];

export default function TechnologyPage() {
  const { t } = useI18n();

  return (
    <div className="technology-page">
      <PageHero
        breadcrumbsLabel={t('publicPages.breadcrumbs')}
        homeLabel={t('common.navigation.home')}
        pageLabel={t('publicPages.technology.title')}
        kicker={t('publicPages.technology.kicker')}
        title={t('publicPages.technology.title')}
        lead={t('publicPages.technology.lead')}
      />

      <section className="technology-pipeline" aria-labelledby="technology-pipeline-title">
        <div className="technology-pipeline__inner">
          <Reveal className="technology-pipeline__heading">
            <p>{t('publicPages.technology.pipelineKicker')}</p>
            <h2 id="technology-pipeline-title">{t('publicPages.technology.pipelineTitle')}</h2>
          </Reveal>
          <div className="technology-pipeline__chips">
            {pipelineStages.map((stage, index) => {
              const label = t(`publicPages.technology.stages.${stage.id}`);
              return (
                <Reveal key={stage.id} delay={index * 50}>
                  <Link
                    to="/how-it-works"
                    className="technology-pipeline__link"
                    aria-label={label}
                  >
                    <Chip tone="brand" className="technology-pipeline__chip">
                      <Icon name={stage.icon} size={18} flip={stage.flip} />
                      {label}
                    </Chip>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="technology-page__analyzer">
        <Suspense fallback={<div className="technology-page__analyzer-loader" aria-busy="true" />}>
          <LandingAnalyzerSection />
        </Suspense>
      </div>

      <section className="technology-transparency" aria-label={t('publicPages.technology.transparencyTitle')}>
        <div className="technology-transparency__inner">
          <Reveal>
            <Link to="/transparency" className="technology-transparency__card">
              <span className="technology-transparency__icon" aria-hidden="true">
                <Icon name="shield-check" size={24} />
              </span>
              <span className="technology-transparency__copy">
                <strong>{t('publicPages.technology.transparencyTitle')}</strong>
                <span>{t('publicPages.technology.transparencyBody')}</span>
              </span>
              <Icon
                name="arrow-right"
                className="technology-transparency__arrow"
                size={20}
                flip
              />
            </Link>
          </Reveal>
        </div>
      </section>

      <Reveal className="technology-page__cta">
        <CTABanner
          eyebrow={t('publicPages.technology.ctaKicker')}
          headline={t('publicPages.technology.ctaTitle')}
          body={t('publicPages.technology.ctaBody')}
          primaryLabel={t('publicPages.technology.ctaPrimary')}
          primaryHref="/citizen/complaints/new"
          secondaryLabel={t('publicPages.technology.ctaSecondary')}
          secondaryHref="/how-it-works"
        />
      </Reveal>
    </div>
  );
}
