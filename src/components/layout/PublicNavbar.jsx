import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useToast } from '../ui/ToastProvider/ToastProvider.jsx';
import { Button } from '../ui/Button/Button.jsx';
import { Drawer } from '../ui/Drawer/Drawer.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { IconButton } from '../ui/IconButton/IconButton.jsx';
import { LanguageSwitch } from '../ui/LanguageSwitch/LanguageSwitch.jsx';
import { ThemeToggle } from '../ui/ThemeToggle/ThemeToggle.jsx';
import './PublicNavbar.css';

const navigationItems = [
  { to: '/', labelKey: 'common.navigation.home' },
  { to: '/how-it-works', labelKey: 'publicLayout.nav.howItWorks' },
  { to: '/ai-transparency', labelKey: 'publicLayout.nav.aiTransparency' },
  { to: '/help', labelKey: 'common.navigation.help' },
];

const landingNavigationItems = [
  { id: 'journey', labelKey: 'publicLayout.nav.journey' },
  { id: 'intelligence', labelKey: 'publicLayout.nav.intelligence' },
  { id: 'faq', labelKey: 'publicLayout.nav.faq' },
];

const dashboardKeys = {
  citizen: 'routes.pages.citizenDashboard',
  officer: 'routes.pages.officerDashboard',
  supervisor: 'routes.pages.supervisorDashboard',
  admin: 'routes.pages.adminDashboard',
};

function NavigationLinks({ drawer = false, onNavigate, isLanding, activeSection }) {
  const { t } = useI18n();

  return (
    <nav
      className={drawer ? 'public-navbar__drawer-nav' : 'public-navbar__nav'}
      aria-label={t('publicLayout.primaryNavigation')}
    >
      {(isLanding ? landingNavigationItems : navigationItems).map((item, index) => {
        const className = drawer
          ? 'public-navbar__drawer-link anim-fade-up'
          : 'public-navbar__link';
        const style = drawer ? { '--i': index, '--delay': `calc(${index} * 80ms)` } : undefined;

        return isLanding ? (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={className}
            style={style}
            aria-current={activeSection === item.id ? 'location' : undefined}
            onClick={onNavigate}
          >
            {t(item.labelKey)}
          </a>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            className={className}
            style={style}
            onClick={onNavigate}
          >
            {t(item.labelKey)}
          </NavLink>
        );
      })}
    </nav>
  );
}

function AccountLinks({ onNavigate }) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  async function handleLogout() {
    try {
      await logout();
      onNavigate?.();
    } catch {
      toast(t('common.errorMessage'), 'error');
    }
  }

  if (!user) {
    return (
      <div className="public-navbar__account-links">
        <Link to="/login" onClick={onNavigate}>
          {t('routes.pages.login')}
        </Link>
        <Link to="/register" onClick={onNavigate}>
          {t('routes.pages.register')}
        </Link>
      </div>
    );
  }

  return (
    <details className="public-navbar__profile">
      <summary aria-label={t('publicLayout.profileMenu', { name: user.name })}>
        <span>{user.name}</span>
        <Icon name="chevron-down" size={16} />
      </summary>
      <div className="public-navbar__profile-menu">
        <Link to={`/${user.role}/dashboard`} onClick={onNavigate}>
          {t(dashboardKeys[user.role])}
        </Link>
        <button type="button" onClick={handleLogout}>
          {t('common.actions.signOut')}
        </button>
      </div>
    </details>
  );
}

export function PublicNavbar() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const isLanding = pathname === '/';

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 16);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLanding || !('IntersectionObserver' in window)) {
      setActiveSection('');
      return undefined;
    }

    const observedSections = landingNavigationItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibleSections.length) setActiveSection(visibleSections[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
    );

    observedSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isLanding]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <>
      <header className={`public-navbar${scrolled ? ' is-scrolled' : ''}`}>
        <div className="public-navbar__inner container">
          <Link className="public-navbar__brand" to="/" aria-label={t('app.name')}>
            <span className="public-navbar__mark" aria-hidden="true">
              ◉
            </span>
            <span>{t('app.name')}</span>
          </Link>

          <NavigationLinks isLanding={isLanding} activeSection={activeSection} />

          <div className="public-navbar__actions">
            <AccountLinks />
            <LanguageSwitch />
            <ThemeToggle />
            <Button as={Link} to="/citizen/complaints/new" variant="cta">
              {t('routes.pages.newComplaint')}
            </Button>
          </div>

          <IconButton
            className="public-navbar__menu-toggle"
            icon="menu"
            aria-label={t('publicLayout.openNavigation')}
            aria-expanded={drawerOpen}
            aria-controls="public-navigation-drawer"
            onClick={() => setDrawerOpen(true)}
          />
        </div>
      </header>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={t('publicLayout.drawerTitle')}
        className="public-navbar__drawer"
      >
        <div id="public-navigation-drawer" className="public-navbar__drawer-content">
          <NavigationLinks
            drawer
            isLanding={isLanding}
            activeSection={activeSection}
            onNavigate={closeDrawer}
          />
          <Button
            as={Link}
            to="/citizen/complaints/new"
            variant="cta"
            fullWidth
            onClick={closeDrawer}
          >
            {t('routes.pages.newComplaint')}
          </Button>
          <AccountLinks onNavigate={closeDrawer} />
          <div className="public-navbar__drawer-preferences">
            <LanguageSwitch />
            <ThemeToggle />
          </div>
        </div>
      </Drawer>
    </>
  );
}
