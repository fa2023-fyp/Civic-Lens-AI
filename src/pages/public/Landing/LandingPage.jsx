import { CTABanner } from '../../../components/marketing/Showcase.jsx';
import { Reveal } from '../../../components/marketing/Reveal.jsx';
import { LandingHeroSection } from './LandingHeroSection.jsx';
import { LandingExploreSection } from './LandingExploreSection.jsx';
import { LandingJourneySection } from './LandingJourneySection.jsx';
import { LandingPhoneSection } from './LandingPhoneSection.jsx';
import { LandingSnapshotSection } from './LandingSnapshotSection.jsx';
import { LandingStatsSection } from './LandingStatsSection.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import './LandingPage.css';

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="landing-page">
      <LandingHeroSection />
      <LandingStatsSection />
      <LandingSnapshotSection />
      <LandingExploreSection />
      <LandingJourneySection />
      <LandingPhoneSection />
      <div className="landing-section">
        <div className="landing-section__inner">
          <Reveal>
            <CTABanner
              eyebrow={t('landing.closingCta.kicker')}
              headline={t('landing.closingCta.title')}
              body={t('landing.closingCta.body')}
              primaryLabel={t('landing.closingCta.submit')}
              primaryHref="/citizen/complaints/new"
              secondaryLabel={t('landing.closingCta.features')}
              secondaryHref="/features"
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
