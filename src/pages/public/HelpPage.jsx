import { FAQ } from '../../components/marketing/FAQ.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { faqItems } from '../../content/faq.js';
import { LandingEmergencySection } from './Landing/LandingEmergencySection.jsx';

export default function HelpPage() {
  const { t } = useI18n();
  const items = faqItems.map((item) => ({
    id: item.id,
    question: t(item.questionKey),
    answer: t(item.answerKey),
  }));

  return (
    <div className="help-page">
      <PageHero
        breadcrumbsLabel={t('publicPages.breadcrumbs')}
        homeLabel={t('common.navigation.home')}
        pageLabel={t('publicPages.help.title')}
        kicker={t('publicPages.help.kicker')}
        title={t('publicPages.help.title')}
        lead={t('publicPages.help.lead')}
      />
      <section
        className="landing-section landing-section--tint"
        aria-labelledby="help-faq-title"
      >
        <div className="landing-section__inner">
          <div className="landing-section__heading landing-section__heading--centered">
            <p className="landing-section__kicker">{t('landing.faq.kicker')}</p>
            <h2 id="help-faq-title">{t('landing.faq.title')}</h2>
          </div>
          <FAQ
            items={items}
            label={t('landing.faq.label')}
            oneOpen
            className="landing-faq"
          />
        </div>
      </section>
      <LandingEmergencySection />
    </div>
  );
}
