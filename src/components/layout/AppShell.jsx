import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './AppShell.css';

export function AppShell({ children }) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 16);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t('app.skip')}
      </a>
      <div className="prototype-notice" role="note">
        {t('app.notice')}
      </div>
      <header className={`topbar${scrolled ? ' topbar--scrolled' : ''}`}>
        <Link className="topbar__brand" to="/">
          <span className="topbar__mark" aria-hidden="true">
            ◉
          </span>
          {t('app.name')}
        </Link>
        <span className="topbar__label">
          {t(pathname === '/dev/ui' ? 'gallery.kicker' : 'preview.tokensKicker')}
        </span>
      </header>
      <main id="main-content" className="app-main">
        {children}
      </main>
    </>
  );
}
