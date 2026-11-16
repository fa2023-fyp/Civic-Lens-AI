import { PhoneMockup } from '../../../components/marketing/Showcase.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { landingContent } from './landing.content.js';

export function LandingPhoneSection() {
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
