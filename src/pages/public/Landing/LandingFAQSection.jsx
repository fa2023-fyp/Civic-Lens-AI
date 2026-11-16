import { FAQ } from '../../../components/marketing/FAQ.jsx';
import { faqItems } from '../../../content/faq.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';

export function LandingFAQSection() {
  const { t } = useI18n();
  const items = faqItems.map((item) => ({
    id: item.id,
    question: t(item.questionKey),
    answer: t(item.answerKey),
  }));

  return (
    <section
      id="faq"
      className="landing-section landing-section--tint landing-anchor reveal-section"
      style={{ '--i': 10 }}
      aria-labelledby="landing-faq-title"
    >
      <div className="landing-section__inner">
        <div className="landing-section__heading landing-section__heading--centered">
          <p className="landing-section__kicker">{t('landing.faq.kicker')}</p>
          <h2 id="landing-faq-title">{t('landing.faq.title')}</h2>
        </div>
        <FAQ
          items={items}
          label={t('landing.faq.label')}
          oneOpen
          className="landing-faq"
        />
      </div>
    </section>
  );
}
