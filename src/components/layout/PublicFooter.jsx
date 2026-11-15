import { Link } from 'react-router-dom';
import { EMERGENCY_NUMBERS } from '../../config/constants.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { LanguageSwitch } from '../ui/LanguageSwitch/LanguageSwitch.jsx';
import './PublicFooter.css';

const quickLinks = [
  { to: '/', labelKey: 'common.navigation.home' },
  { to: '/how-it-works', labelKey: 'publicLayout.nav.howItWorks' },
  { to: '/ai-transparency', labelKey: 'publicLayout.nav.aiTransparency' },
  { to: '/help', labelKey: 'common.navigation.help' },
];

export function PublicFooter() {
  const { t } = useI18n();

  return (
    <footer className="public-footer">
      <div className="container public-footer__main">
        <section className="public-footer__about" aria-labelledby="public-footer-title">
          <h2 id="public-footer-title">{t('app.name')}</h2>
          <p>{t('publicLayout.footer.description')}</p>
        </section>

        <nav className="public-footer__links" aria-label={t('publicLayout.footer.quickLinks')}>
          <h2>{t('publicLayout.footer.quickLinks')}</h2>
          <ul>
            {quickLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{t(item.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="public-footer__emergency" aria-labelledby="public-footer-emergency">
          <h2 id="public-footer-emergency">{t('publicLayout.footer.emergency')}</h2>
          <ul>
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

        <section className="public-footer__sdgs" aria-label={t('publicLayout.footer.sdgLabel')}>
          <span className="public-footer__sdg">{t('publicLayout.footer.sdg11')}</span>
          <span className="public-footer__sdg">{t('publicLayout.footer.sdg16')}</span>
          <LanguageSwitch />
        </section>
      </div>

      <div className="public-footer__bottom">
        <div className="container">
          <p>{t('publicLayout.footer.project')}</p>
        </div>
      </div>
    </footer>
  );
}
