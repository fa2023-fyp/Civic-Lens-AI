import { CTABanner } from '../../components/marketing/Showcase.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Reveal } from '../../components/marketing/Reveal.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { LandingPillarsSection } from './Landing/LandingPillarsSection.jsx';
import { LandingServicesSection } from './Landing/LandingServicesSection.jsx';
import { FeaturesWorkflowSection } from './FeaturesWorkflowSection.jsx';
import './FeaturesPage.css';

export default function FeaturesPage() {
  const { t } = useI18n();

  return (
    <div className="features-page">
      <PageHero
        breadcrumbsLabel={t('publicPages.breadcrumbs')}
        homeLabel={t('common.navigation.home')}
        pageLabel={t('publicPages.features.title')}
        kicker={t('publicPages.features.kicker')}
        title={t('publicPages.features.title')}
        lead={t('publicPages.features.lead')}
      />
      <Reveal delay={80}>
        <LandingPillarsSection />
      </Reveal>
      <Reveal delay={160}>
        <LandingServicesSection />
      </Reveal>
      <FeaturesWorkflowSection />
      <Reveal className="features-page__cta">
        <CTABanner
          eyebrow={t('publicPages.features.cta.kicker')}
          headline={t('publicPages.features.cta.title')}
          body={t('publicPages.features.cta.body')}
          primaryLabel={t('publicPages.features.cta.submit')}
          primaryHref="/citizen/complaints/new"
          secondaryLabel={t('publicPages.features.cta.technology')}
          secondaryHref="/technology"
        />
      </Reveal>
    </div>
  );
}
