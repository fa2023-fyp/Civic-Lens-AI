import { Link } from 'react-router-dom';
import { EMERGENCY_NUMBERS } from '../../config/constants.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './PublicFooter.css';

const productLinks = [
  { to: '/features', labelKey: 'publicPages.features.kicker' },
  { to: '/technology', labelKey: 'publicPages.technology.kicker' },
  { to: '/how-it-works', labelKey: 'routes.pages.howItWorks' },
];

const projectLinks = [
  { to: '/about', labelKey: 'publicPages.about.kicker' },
  { to: '/transparency', labelKey: 'routes.pages.aiTransparency' },
  { to: '/contact', labelKey: 'publicPages.contact.kicker' },
];

const supportLinks = [
  { to: '/help', labelKey: 'common.navigation.help' },
];

export function PublicFooter() {
  const { t } = useI18n();

  return (
    <footer className="public-footer">
      <div className="container public-footer__main">
        <nav className="public-footer__col" aria-label={t('publicLayout.footer.product')}>
          <h2>{t('publicLayout.footer.product')}</h2>
          <ul>
            {productLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{t(item.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="public-footer__col" aria-label={t('publicLayout.footer.projectHeading')}>
          <h2>{t('publicLayout.footer.projectHeading')}</h2>
          <ul>
            {projectLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{t(item.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="public-footer__col" aria-label={t('publicLayout.footer.support')}>
          <h2>{t('publicLayout.footer.support')}</h2>
          <ul>
            {supportLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{t(item.labelKey)}</Link>
              </li>
            ))}
          </ul>
          <ul className="public-footer__emergency">
            {EMERGENCY_NUMBERS.map((item) => (
              <li key={item.number} dir="ltr">
                <span>{t(item.labelKey)}</span>
                <a href={`tel:${item.number}`}>{item.number}</a>
              </li>
            ))}
          </ul>
          <p className="public-footer__notice">{t('app.notice')}</p>
          <p className="public-footer__project">{t('publicLayout.footer.project')}</p>
          <p className="public-footer__sdgs">
            <span>{t('publicLayout.footer.sdg11')}</span>
            <span>{t('publicLayout.footer.sdg16')}</span>
          </p>
        </nav>
      </div>
    </footer>
  );
}
