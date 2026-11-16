import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon/Icon.jsx';
import { Reveal } from '../../../components/marketing/Reveal.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';

const destinations = [
  {
    to: '/features',
    titleKey: 'publicPages.features.kicker',
    descriptionKey: 'landing.explore.features',
    icon: 'layers',
  },
  {
    to: '/technology',
    titleKey: 'publicPages.technology.kicker',
    descriptionKey: 'landing.explore.technology',
    icon: 'sparkles',
  },
  {
    to: '/how-it-works',
    titleKey: 'routes.pages.howItWorks',
    descriptionKey: 'landing.explore.howItWorks',
    icon: 'activity',
  },
];

export function LandingExploreSection() {
  const { t } = useI18n();

  return (
    <section
      className="landing-section landing-section--tint"
      aria-labelledby="landing-explore-title"
    >
      <div className="landing-section__inner">
        <div className="landing-section__heading">
          <p className="landing-section__kicker">{t('landing.explore.kicker')}</p>
          <h2 id="landing-explore-title">{t('landing.explore.title')}</h2>
        </div>
        <div className="landing-explore-grid">
          {destinations.map((destination, index) => (
            <Reveal key={destination.to} delay={index * 80}>
              <Link to={destination.to} className="landing-explore-card">
                <span className="landing-explore-card__icon" aria-hidden="true">
                  <Icon name={destination.icon} size={24} />
                </span>
                <span className="landing-explore-card__arrow" aria-hidden="true">
                  <Icon name="arrow-right" flip />
                </span>
                <span className="landing-explore-card__title">
                  {t(destination.titleKey)}
                </span>
                <span className="landing-explore-card__description">
                  {t(destination.descriptionKey)}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
