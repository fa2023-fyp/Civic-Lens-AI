import { useI18n } from '../../../i18n/I18nContext.jsx';
import { landingContent } from './landing.content.js';

export function LandingPillarsSection() {
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
