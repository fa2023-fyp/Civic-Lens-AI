import { EMERGENCY_NUMBERS } from '../../../config/constants.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';

export function LandingEmergencySection() {
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
