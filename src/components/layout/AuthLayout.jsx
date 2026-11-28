import { Link } from 'react-router-dom';
import { Card } from '../ui/Card/Card.jsx';
import { PreferencesMenu } from './PreferencesMenu.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './AuthLayout.css';

export function AuthLayout({ children }) {
  const { t } = useI18n();

  return (
    <div className="auth-layout">
      <a className="skip-link" href="#main-content">
        {t('app.skip')}
      </a>
      <header className="auth-layout__topbar">
        <Link className="auth-layout__brand" to="/" aria-label={t('app.name')}>
          <span className="auth-layout__mark" aria-hidden="true">
            ◉
          </span>
          {t('app.name')}
        </Link>
        <div className="auth-layout__preferences">
          <PreferencesMenu />
        </div>
      </header>
      <div className="auth-layout__content">
        <section className="auth-layout__brand-panel" aria-labelledby="auth-layout-title">
          <div className="auth-layout__brand-copy">
            <p>{t('layouts.auth.kicker')}</p>
            <h1 id="auth-layout-title">{t('layouts.auth.title')}</h1>
            <p>{t('layouts.auth.body')}</p>
          </div>
        </section>
        <main id="main-content" className="auth-layout__form-panel">
          <Card as="section" className="auth-layout__form-card">
            {children}
          </Card>
        </main>
      </div>
    </div>
  );
}
