import { StepsRail } from '../../../components/marketing/StepsRail.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { landingContent } from './landing.content.js';

export function LandingJourneySection() {
  const { t } = useI18n();
  const steps = landingContent.journey.map((step) => ({
    id: step.id,
    title: t(step.titleKey),
    description: t(step.descriptionKey),
  }));

  return (
    <section
      id="journey"
      className="landing-section landing-section--tint landing-anchor reveal-section"
      style={{ '--i': 7 }}
      aria-labelledby="landing-journey-title"
    >
      <div className="landing-section__inner">
        <div className="landing-section__heading landing-section__heading--centered">
          <p className="landing-section__kicker">{t('landing.journey.kicker')}</p>
          <h2 id="landing-journey-title">{t('landing.journey.title')}</h2>
        </div>
        <StepsRail steps={steps} label={t('landing.journey.stepsLabel')} />
      </div>
    </section>
  );
}
