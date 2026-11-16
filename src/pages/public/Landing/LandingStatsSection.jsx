import { useI18n } from '../../../i18n/I18nContext.jsx';
import { landingContent } from './landing.content.js';
import { AnimatedNumber } from './landing.shared.jsx';

export function LandingStatsSection() {
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
