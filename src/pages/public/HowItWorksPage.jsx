import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Reveal } from '../../components/marketing/Reveal.jsx';
import { CTABanner } from '../../components/marketing/Showcase.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { useScrollSpy } from '../../hooks/useScrollSpy.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './HowItWorksPage.css';

const stages = [
  'understand',
  'extract',
  'classify',
  'prioritise',
  'route',
  'related',
  'sla',
  'escalate',
  'verify',
  'audit',
];

export default function HowItWorksPage() {
  const { t } = useI18n();
  const sectionIds = stages.map((id) => `how-stage-${id}`);
  const activeId = useScrollSpy(sectionIds);

  return (
    <div className="how-it-works-page">
      <PageHero
        breadcrumbsLabel={t('publicPages.breadcrumbs')}
        homeLabel={t('common.navigation.home')}
        pageLabel={t('publicPages.howItWorks.title')}
        kicker={t('publicPages.howItWorks.kicker')}
        title={t('publicPages.howItWorks.title')}
        lead={t('publicPages.howItWorks.lead')}
      />

      <section className="how-pipeline" aria-label={t('publicPages.howItWorks.pipelineLabel')}>
        <div className="how-pipeline__example">
          <span>{t('publicPages.howItWorks.exampleLabel')}</span>
          <blockquote dir="auto">{t('publicPages.howItWorks.exampleText')}</blockquote>
        </div>

        <div className="how-pipeline__layout">
          <aside className="how-pipeline__rail" aria-label={t('publicPages.howItWorks.pipelineLabel')}>
            <ol>
              {stages.map((id, index) => (
                <li key={id} className={activeId === `how-stage-${id}` ? 'is-active' : ''}>
                  <a href={`#how-stage-${id}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {t(`publicPages.howItWorks.stages.${id}.title`)}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="how-pipeline__panels">
            {stages.map((id, index) => (
              <Reveal key={id} delay={(index % 3) * 80}>
                <Card
                  id={`how-stage-${id}`}
                  className={`how-stage${activeId === `how-stage-${id}` ? ' is-active' : ''}`}
                  hoverLift
                >
                  <div className="how-stage__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="how-stage__copy">
                    <h2>{t(`publicPages.howItWorks.stages.${id}.title`)}</h2>
                    <p>{t(`publicPages.howItWorks.stages.${id}.body`)}</p>
                    <div className="how-stage__output">
                      <span>{t('publicPages.howItWorks.exampleLabel')}</span>
                      <strong>{t(`publicPages.howItWorks.stages.${id}.output`)}</strong>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="how-verification" aria-labelledby="how-verification-title">
        <div className="how-verification__inner">
          <Reveal className="how-verification__heading">
            <p>{t('publicPages.howItWorks.verificationKicker')}</p>
            <h2 id="how-verification-title">{t('publicPages.howItWorks.verificationTitle')}</h2>
          </Reveal>
          <div className="how-verification__diagram" role="list">
            {[
              'officer',
              'citizen',
              'accepted',
              'rejected',
              'escalate',
            ].map((id, index) => (
              <Reveal delay={index * 70} key={id}>
                <div className="how-verification__node" role="listitem">
                  <span aria-hidden="true">
                    <Icon
                      name={id === 'accepted' ? 'check-circle' : id === 'rejected' ? 'refresh' : id === 'escalate' ? 'alert-triangle' : 'user'}
                      size={22}
                    />
                  </span>
                  <strong>{t(`publicPages.howItWorks.verificationSteps.${id}`)}</strong>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Reveal className="how-it-works-page__cta">
        <CTABanner
          eyebrow={t('publicPages.howItWorks.cta.kicker')}
          headline={t('publicPages.howItWorks.cta.title')}
          body={t('publicPages.howItWorks.cta.body')}
          primaryLabel={t('publicPages.howItWorks.cta.primary')}
          primaryHref="/transparency"
          secondaryLabel={t('publicPages.howItWorks.cta.secondary')}
          secondaryHref="/citizen/complaints/new"
        />
      </Reveal>
    </div>
  );
}
