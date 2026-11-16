import { useI18n } from '../../../i18n/I18nContext.jsx';
import { landingContent } from './landing.content.js';

export function LandingServicesSection() {
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
