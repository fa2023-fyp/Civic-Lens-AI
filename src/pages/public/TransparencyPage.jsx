import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Reveal } from '../../components/marketing/Reveal.jsx';
import { Accordion } from '../../components/ui/Accordion/Accordion.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './TransparencyPage.css';

export default function TransparencyPage() {
  const { t } = useI18n();

  const items = [
    'role',
    'doesNot',
    'confidence',
    'human',
    'audit',
    'language',
    'limitations',
    'privacy',
    'modelCard',
  ].map((id) => ({
    id,
    title: t(`publicPages.transparency.${id}.title`),
    content:
      id === 'limitations' ? (
        <ul className="transparency-limitations">
          {['data', 'imbalance', 'semantic', 'location', 'repairs'].map((item) => (
            <li key={item}>
              {t(`publicPages.transparency.limitations.items.${item}`)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{t(`publicPages.transparency.${id}.body`)}</p>
      ),
  }));

  return (
    <div className="transparency-page">
      <PageHero
        breadcrumbsLabel={t('publicPages.breadcrumbs')}
        homeLabel={t('common.navigation.home')}
        pageLabel={t('publicPages.transparency.title')}
        kicker={t('publicPages.transparency.kicker')}
        title={t('publicPages.transparency.title')}
        lead={t('publicPages.transparency.lead')}
      />

      <section className="transparency-decision" aria-labelledby="transparency-decision-title">
        <div className="transparency-decision__inner">
          <Reveal className="transparency-decision__copy">
            <p>{t('publicPages.transparency.decision.kicker')}</p>
            <h2 id="transparency-decision-title">{t('publicPages.transparency.decision.title')}</h2>
            <span>{t('publicPages.transparency.decision.body')}</span>
          </Reveal>
          <Reveal className="transparency-decision__seal" delay={80}>
            <Icon name="shield-check" size={48} />
          </Reveal>
        </div>
      </section>

      <section className="transparency-content" aria-label={t('publicPages.transparency.accordionLabel')}>
        <div className="transparency-content__inner">
          <Accordion
            items={items}
            label={t('publicPages.transparency.accordionLabel')}
            allowMultiple
            defaultOpenIds={['role', 'limitations']}
          />

          <Reveal className="transparency-synthetic">
            <Badge tone="neutral" className="transparency-synthetic__badge">
              {t('publicPages.transparency.synthetic.label')}
            </Badge>
            <div>
              <h2>{t('publicPages.transparency.synthetic.title')}</h2>
              <p>{t('publicPages.transparency.synthetic.body')}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
