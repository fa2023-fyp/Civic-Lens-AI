import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { PreferencesMenu } from './PreferencesMenu.jsx';
import './CitizenLayout.css';

const navigationItems = [
  { to: '/citizen/dashboard', labelKey: 'common.navigation.home', icon: 'building' },
  { to: '/citizen/complaints/new', labelKey: 'layouts.citizen.submit', icon: 'plus' },
  { to: '/citizen/complaints', labelKey: 'routes.pages.citizenComplaints', icon: 'file' },
  { to: '/citizen/alerts', labelKey: 'routes.pages.alerts', icon: 'bell' },
  { to: '/citizen/profile', labelKey: 'routes.pages.profile', icon: 'user' },
];

function activeNavigationIndex(pathname) {
  if (pathname.startsWith('/citizen/complaints/new')) return 1;
  if (pathname.startsWith('/citizen/complaints')) return 2;
  if (pathname.startsWith('/citizen/alerts')) return 3;
  if (pathname.startsWith('/citizen/profile')) return 4;
  return 0;
}

function CitizenNavigation({ index, mobile = false, label }) {
  const { t } = useI18n();

  return (
    <nav
      className={mobile ? 'citizen-layout__bottom-nav' : 'citizen-layout__rail-nav'}
      aria-label={label}
    >
      {mobile ? (
        <span
          className="citizen-layout__active-indicator"
          aria-hidden="true"
          style={{ '--active-index': index }}
        />
      ) : null}
      {navigationItems.map((item, itemIndex) => {
        const active = itemIndex === index;

        return (
          <Link
            key={item.to}
            className={`citizen-layout__nav-link${active ? ' is-active' : ''}`}
            to={item.to}
            aria-current={active ? 'page' : undefined}
          >
            <Icon name={item.icon} size={20} />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function CitizenLayout({ children }) {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const index = activeNavigationIndex(pathname);

  return (
    <div className="citizen-layout">
      <a className="skip-link" href="#main-content">
        {t('app.skip')}
      </a>
      <header className="citizen-layout__topbar">
        <Link className="citizen-layout__brand" to="/citizen/dashboard" aria-label={t('app.name')}>
          <span className="citizen-layout__mark" aria-hidden="true">
            ◉
          </span>
          <span>{t('app.name')}</span>
        </Link>
        <div className="citizen-layout__preferences">
          <PreferencesMenu />
        </div>
      </header>
      <div className="citizen-layout__body">
        <aside className="citizen-layout__rail">
          <CitizenNavigation
            index={index}
            label={t('layouts.citizen.navigation')}
          />
        </aside>
        <main id="main-content" className="citizen-layout__main">
          {children}
        </main>
      </div>
      <CitizenNavigation
        index={index}
        mobile
        label={t('layouts.citizen.navigation')}
      />
    </div>
  );
}
