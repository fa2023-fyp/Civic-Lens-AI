import { Link } from 'react-router-dom';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Reveal } from '../../components/marketing/Reveal.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { LandingImageBandSection } from './Landing/LandingImageBandSection.jsx';
import { LandingRecognitionSection } from './Landing/LandingRecognitionSection.jsx';
import './AboutPage.css';

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="about-page">
      <PageHero
        breadcrumbsLabel={t('publicPages.breadcrumbs')}
        homeLabel={t('common.navigation.home')}
        pageLabel={t('publicPages.about.title')}
        kicker={t('publicPages.about.kicker')}
        title={t('publicPages.about.title')}
        lead={t('publicPages.about.lead')}
      />

      <section className="about-page__story" aria-labelledby="about-story-title">
        <div className="about-page__inner">
          <Reveal className="about-page__story-heading">
            <p className="about-page__kicker">{t('publicPages.about.storyKicker')}</p>
            <h2 id="about-story-title">{t('publicPages.about.storyTitle')}</h2>
          </Reveal>
          <div className="about-page__story-grid">
            <Reveal delay={80}>
              <article className="about-page__story-card">
                <h3>{t('publicPages.about.missionTitle')}</h3>
                <p>{t('publicPages.about.missionBody')}</p>
              </article>
            </Reveal>
            <Reveal delay={160}>
              <article className="about-page__story-card">
                <h3>{t('publicPages.about.problemTitle')}</h3>
                <p>{t('publicPages.about.problemBody')}</p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <LandingRecognitionSection />
      <LandingImageBandSection />

      <section className="about-project" aria-labelledby="about-project-title">
        <div className="about-page__inner">
          <Reveal className="about-project__card">
            <div className="about-project__heading">
              <p className="about-page__kicker">{t('publicPages.about.projectKicker')}</p>
              <h2 id="about-project-title">{t('publicPages.about.projectTitle')}</h2>
            </div>
            <dl className="about-project__details">
              {['projectType', 'institution', 'team', 'supervisor', 'year'].map((field) => (
                <div key={field}>
                  <dt>{t(`publicPages.about.fields.${field}`)}</dt>
                  <dd>
                    {field === 'projectType' || field === 'institution'
                      ? t(`publicPages.about.values.${field}`)
                      : t('publicPages.about.replacePlaceholder')}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="about-limits" aria-labelledby="about-limits-title">
        <div className="about-page__inner">
          <Reveal>
            <div className="about-limits__card">
              <span className="about-limits__icon" aria-hidden="true">
                <Icon name="info" size={22} />
              </span>
              <div>
                <h2 id="about-limits-title">{t('publicPages.about.limitsTitle')}</h2>
                <p>{t('publicPages.about.limitsBody')}</p>
              </div>
              <Link to="/transparency" className="about-limits__link">
                {t('publicPages.about.limitsLink')}
                <Icon name="arrow-right" flip />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
