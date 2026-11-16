import { useI18n } from '../../../i18n/I18nContext.jsx';
import { landingContent } from './landing.content.js';

export function LandingRecognitionSection() {
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
