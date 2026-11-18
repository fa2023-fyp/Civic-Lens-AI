import { useState } from 'react';
import { FAQ } from '../../components/marketing/FAQ.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Reveal } from '../../components/marketing/Reveal.jsx';
import { Tabs } from '../../components/ui/Tabs/Tabs.jsx';
import { SearchInput } from '../../components/ui/SearchInput/SearchInput.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { faqItems } from '../../content/faq.js';
import { LandingEmergencySection } from './Landing/LandingEmergencySection.jsx';
import './HelpPage.css';

export default function HelpPage() {
  const { t } = useI18n();
  const [faqQuery, setFaqQuery] = useState('');
  const items = faqItems.map((item) => ({
    id: item.id,
    question: t(item.questionKey),
    answer: t(item.answerKey),
  })).filter((item) => {
    const query = faqQuery.trim().toLocaleLowerCase();
    return !query || `${item.question} ${item.answer}`.toLocaleLowerCase().includes(query);
  });

  const guideLanguages = ['english', 'urdu'];
  const guideSteps = ['register', 'submit', 'track', 'verify'];
  const guideTabs = guideLanguages.map((language) => ({
    id: language,
    label: t(`publicPages.help.guides.languages.${language}`),
    content: (
      <div className="help-guides__grid">
        {guideSteps.map((step, index) => (
          <Card key={step} className="help-guide-card" hoverLift>
            <span className="help-guide-card__number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3>{t(`publicPages.help.guides.${language}.${step}.title`)}</h3>
            <p>{t(`publicPages.help.guides.${language}.${step}.body`)}</p>
          </Card>
        ))}
      </div>
    ),
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

      <section className="help-guides" aria-labelledby="help-guides-title">
        <div className="help-guides__inner">
          <Reveal className="help-guides__heading">
            <p>{t('publicPages.help.guides.kicker')}</p>
            <h2 id="help-guides-title">{t('publicPages.help.guides.title')}</h2>
          </Reveal>
          <Tabs
            tabs={guideTabs}
            label={t('publicPages.help.guides.label')}
            defaultActiveId="english"
            className="help-guides__tabs"
          />
        </div>
      </section>

      <section
        className="landing-section landing-section--tint"
        aria-labelledby="help-faq-title"
      >
        <div className="landing-section__inner">
          <div className="landing-section__heading landing-section__heading--centered">
            <p className="landing-section__kicker">{t('landing.faq.kicker')}</p>
            <h2 id="help-faq-title">{t('landing.faq.title')}</h2>
          </div>
          <div className="help-faq-search">
            <SearchInput
              label={t('publicPages.help.faqSearchLabel')}
              placeholder={t('publicPages.help.faqSearchPlaceholder')}
              value={faqQuery}
              onChange={(event) => setFaqQuery(event.target.value)}
              onClear={() => setFaqQuery('')}
            />
          </div>
          <FAQ
            items={items}
            label={t('landing.faq.label')}
            oneOpen
            className="landing-faq"
          />
          {items.length === 0 ? (
            <p className="help-faq-empty" role="status">
              {t('publicPages.help.faqEmpty')}
            </p>
          ) : null}
        </div>
      </section>
      <LandingEmergencySection />
      <section className="help-contact" aria-labelledby="help-contact-title">
        <div className="help-contact__inner">
          <Reveal className="help-contact__card">
            <div>
              <p>{t('publicPages.help.contact.kicker')}</p>
              <h2 id="help-contact-title">{t('publicPages.help.contact.title')}</h2>
              <span>{t('publicPages.help.contact.body')}</span>
            </div>
            <Button as="a" href="/contact" variant="cta" iconEnd="arrow-right">
              {t('publicPages.help.contact.action')}
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
