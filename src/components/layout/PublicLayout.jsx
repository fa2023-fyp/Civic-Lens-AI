import { useI18n } from '../../i18n/I18nContext.jsx';
import { PublicFooter } from './PublicFooter.jsx';
import { PublicNavbar } from './PublicNavbar.jsx';
import { PrototypeBanner } from './PrototypeBanner.jsx';
import './PublicLayout.css';

export function PublicLayout({ children }) {
  const { t } = useI18n();

  return (
    <div className="public-layout">
      <a className="skip-link" href="#main-content">
        {t('app.skip')}
      </a>
      <PrototypeBanner />
      <PublicNavbar />
      <main id="main-content" className="public-layout__main">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
