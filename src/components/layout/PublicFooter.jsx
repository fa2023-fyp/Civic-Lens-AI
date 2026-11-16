import { Link } from 'react-router-dom';
import { EMERGENCY_NUMBERS } from '../../config/constants.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { LanguageSwitch } from '../ui/LanguageSwitch/LanguageSwitch.jsx';
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

export function PublicFooter() {
  const { t } = useI18n();

  return (
    <footer className="public-footer">
      <div className="container public-footer__main">
        <div className="public-footer__intro">
          <h2>{t('app.name')}</h2>
          <p>{t('publicLayout.footer.description')}</p>
        </div>

        <nav className="public-footer__links" aria-label={t('publicLayout.footer.product')}>
          <h2>{t('publicLayout.footer.product')}</h2>
          <ul>
            {productLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{t(item.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="public-footer__links" aria-label={t('publicLayout.footer.projectHeading')}>
          <h2>{t('publicLayout.footer.projectHeading')}</h2>
          <ul>
            {projectLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{t(item.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="public-footer__support" aria-labelledby="public-footer-support">
          <h2 id="public-footer-support">{t('publicLayout.footer.support')}</h2>
          <ul className="public-footer__support-links">
            <li>
              <Link to="/help">{t('common.navigation.help')}</Link>
            </li>
          </ul>
          <h3>{t('publicLayout.footer.emergency')}</h3>
          <ul className="public-footer__emergency">
            {EMERGENCY_NUMBERS.map((item) => (
              <li key={item.number}>
                <span>{t(item.labelKey)}</span>
                <a href={`tel:${item.number}`} dir="ltr">
                  {item.number}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="public-footer__bottom">
        <div className="container public-footer__bottom-inner">
          <div className="public-footer__disclaimer">
            <p>{t('app.notice')}</p>
            <p>{t('publicLayout.footer.project')}</p>
          </div>
          <LanguageSwitch />
        </div>
      </div>
    </footer>
  );
}
