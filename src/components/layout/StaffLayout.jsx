import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useHotkeys } from '../../hooks/useHotkeys.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { Avatar } from '../ui/Avatar/Avatar.jsx';
import { Breadcrumb } from '../ui/Breadcrumb/Breadcrumb.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { IconButton } from '../ui/IconButton/IconButton.jsx';
import { Kbd } from '../ui/Kbd/Kbd.jsx';
import { Modal } from '../ui/Modal/Modal.jsx';
import { SearchInput } from '../ui/SearchInput/SearchInput.jsx';
import { useToast } from '../ui/ToastProvider/ToastProvider.jsx';
import { PreferencesMenu } from './PreferencesMenu.jsx';
import './StaffLayout.css';

const navigationByRole = {
  officer: [
    { to: '/officer/dashboard', labelKey: 'routes.pages.officerDashboard', icon: 'chart-bar' },
    { to: '/officer/assignments', labelKey: 'routes.pages.assignments', icon: 'clipboard' },
    { to: '/officer/review-queue', labelKey: 'routes.pages.reviewQueue', icon: 'check-circle' },
    { to: '/officer/clusters', labelKey: 'routes.pages.clusters', icon: 'layers' },
  ],
  supervisor: [
    { to: '/supervisor/dashboard', labelKey: 'routes.pages.supervisorDashboard', icon: 'chart-bar' },
    { to: '/supervisor/analytics', labelKey: 'routes.pages.analytics', icon: 'chart-line' },
    { to: '/supervisor/review-queue', labelKey: 'routes.pages.reviewQueue', icon: 'check-circle' },
    { to: '/supervisor/escalations', labelKey: 'routes.pages.escalations', icon: 'alert-triangle' },
  ],
  admin: [
    { to: '/admin/dashboard', labelKey: 'routes.pages.adminDashboard', icon: 'chart-bar' },
    { to: '/admin/analytics', labelKey: 'routes.pages.analytics', icon: 'chart-line' },
    { to: '/admin/users', labelKey: 'routes.pages.users', icon: 'users' },
    { to: '/admin/models', labelKey: 'routes.pages.models', icon: 'sparkles' },
    { to: '/admin/audit', labelKey: 'routes.pages.audit', icon: 'clipboard' },
    { to: '/admin/settings', labelKey: 'routes.pages.settings', icon: 'settings' },
  ],
};

function detailTitleKey(role, pathname) {
  if (role === 'officer' && pathname.endsWith('/resolve')) return 'routes.pages.submitResolution';
  if (role === 'officer' && pathname.includes('/complaints/')) {
    return 'routes.pages.officerComplaintDetail';
  }
  if (role === 'supervisor' && pathname.includes('/complaints/')) {
    return 'routes.pages.supervisorComplaintDetail';
  }
  return null;
}

function ProfileMenu({ role, user, onLogout }) {
  const { t } = useI18n();
  const name = user?.name ?? t(`routes.roles.${role}`);

  return (
    <details className="staff-layout__profile">
      <summary aria-label={t('layouts.staff.profileMenu', { name })}>
        <Avatar name={name} size="sm" />
        <span className="staff-layout__profile-name">{name}</span>
        <Icon name="chevron-down" size={16} />
      </summary>
      <div className="staff-layout__profile-menu">
        <p>{name}</p>
        <span>{t(`routes.roles.${role}`)}</span>
        <button type="button" onClick={onLogout}>
          {t('common.actions.signOut')}
        </button>
      </div>
    </details>
  );
}

function NotificationMenu({ open, onToggle }) {
  const { t } = useI18n();

  return (
    <div className="staff-layout__notification">
      <IconButton
        icon="bell"
        aria-label={t('layouts.staff.notifications')}
        aria-expanded={open}
        aria-controls="staff-notifications-panel"
        onClick={onToggle}
      />
      <span className="staff-layout__notification-badge" aria-hidden="true" />
      {open ? (
        <section
          id="staff-notifications-panel"
          className="staff-layout__notification-panel"
          aria-label={t('layouts.staff.notifications')}
        >
          <h2>{t('layouts.staff.notifications')}</h2>
          <p>{t('layouts.staff.notificationsEmpty')}</p>
        </section>
      ) : null}
    </div>
  );
}

function StaffNavigation({ role, collapsed, onNavigate }) {
  const { t } = useI18n();

  return (
    <nav className="staff-layout__navigation" aria-label={t('layouts.staff.navigation')}>
      {navigationByRole[role].map((item) => (
        <NavLink
          key={item.to}
          className={({ isActive }) =>
            `staff-layout__nav-link${isActive ? ' is-active' : ''}`
          }
          to={item.to}
          onClick={onNavigate}
          aria-label={collapsed ? t(item.labelKey) : undefined}
          title={collapsed ? t(item.labelKey) : undefined}
        >
          <Icon name={item.icon} size={20} />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function StaffLayout({ children, role }) {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const generatedId = `staff-search-${useId()}`;
  const sidebarRef = useRef(null);
  const roleNavigation = navigationByRole[role];
  const activeItem = roleNavigation.find((item) => item.to === pathname);
  const currentTitleKey = activeItem?.labelKey ?? detailTitleKey(role, pathname);
  const isDashboard = pathname === `/${role}/dashboard`;
  const breadcrumbItems = currentTitleKey
    ? [
        ...(isDashboard
          ? []
          : [
              {
                id: 'dashboard',
                href: `/${role}/dashboard`,
                label: t('common.navigation.dashboard'),
              },
            ]),
        { id: 'current', label: t(currentTitleKey), current: true },
      ]
    : [];
  const hotkeys = useMemo(() => ['/', 'shift+?'], []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  const handleHotkey = useCallback(
    (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.matches('input, textarea, select, [role="textbox"]'))
      ) {
        return;
      }

      event.preventDefault();
      if (event.key === '/') {
        document.getElementById(generatedId)?.focus();
      } else if (event.key === '?') {
        setShortcutsOpen(true);
      }
    },
    [generatedId],
  );

  useHotkeys(hotkeys, handleHotkey);
  useFocusTrap(sidebarRef, mobileSidebarOpen, closeMobileSidebar);

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
      toast(t('common.errors.server'), 'error');
    }
  }, [logout, t, toast]);

  return (
    <div
      className={`staff-layout${sidebarCollapsed ? ' is-sidebar-collapsed' : ''}${mobileSidebarOpen ? ' is-mobile-sidebar-open' : ''}`}
    >
      <a className="skip-link" href="#main-content">
        {t('app.skip')}
      </a>
      <header className="staff-layout__topbar">
        <div className="staff-layout__topbar-inner">
          <Link className="staff-layout__brand" to={`/${role}/dashboard`} aria-label={t('app.name')}>
            <span className="staff-layout__mark" aria-hidden="true">
              ◉
            </span>
            <span>{t('app.name')}</span>
          </Link>
          <div className="staff-layout__search">
            <SearchInput
              id={generatedId}
              label={t('layouts.staff.searchLabel')}
              placeholder={t('ui.searchPlaceholder')}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <Kbd>/</Kbd>
          </div>
          <div className="staff-layout__tools">
            <NotificationMenu
              open={notificationsOpen}
              onToggle={() => setNotificationsOpen((value) => !value)}
            />
            <ProfileMenu role={role} user={user} onLogout={handleLogout} />
            <IconButton
              icon="help"
              aria-label={t('layouts.staff.openShortcuts')}
              onClick={() => setShortcutsOpen(true)}
            />
            <IconButton
              className="staff-layout__mobile-toggle"
              icon="menu"
              aria-label={t('layouts.staff.openSidebar')}
              aria-expanded={mobileSidebarOpen}
              aria-controls="staff-sidebar"
              onClick={() => setMobileSidebarOpen(true)}
            />
            <IconButton
              className="staff-layout__collapse-toggle"
              icon="menu"
              aria-label={t(sidebarCollapsed ? 'layouts.staff.expandSidebar' : 'layouts.staff.collapseSidebar')}
              aria-expanded={!sidebarCollapsed}
              aria-controls="staff-sidebar"
              onClick={() => setSidebarCollapsed((value) => !value)}
            />
          </div>
          <div className="staff-layout__preferences">
            <PreferencesMenu />
          </div>
        </div>
      </header>
      <div className="staff-layout__body">
        {mobileSidebarOpen ? (
          <button
            className="staff-layout__backdrop"
            type="button"
            aria-label={t('layouts.staff.closeSidebar')}
            onClick={closeMobileSidebar}
          />
        ) : null}
        <aside
          ref={sidebarRef}
          id="staff-sidebar"
          className="staff-layout__sidebar"
          role={mobileSidebarOpen ? 'dialog' : undefined}
          aria-modal={mobileSidebarOpen || undefined}
          aria-label={mobileSidebarOpen ? t(`routes.roles.${role}`) : undefined}
          tabIndex={mobileSidebarOpen ? -1 : undefined}
        >
          <div className="staff-layout__sidebar-heading" id="staff-sidebar-heading">
            <Icon name="shield-check" size={20} />
            <span>{t(`routes.roles.${role}`)}</span>
          </div>
          <StaffNavigation
            role={role}
            collapsed={sidebarCollapsed}
            onNavigate={closeMobileSidebar}
          />
        </aside>
        <main id="main-content" className="staff-layout__main">
          {breadcrumbItems.length ? (
            <Breadcrumb
              items={breadcrumbItems}
              label={t('layouts.staff.breadcrumb')}
              className="staff-layout__breadcrumb"
            />
          ) : null}
          {children}
        </main>
      </div>
      <Modal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title={t('layouts.staff.shortcutsTitle')}
      >
        <dl className="staff-layout__shortcuts">
          <div>
            <dt>
              <Kbd>/</Kbd>
            </dt>
            <dd>{t('layouts.staff.shortcutSearch')}</dd>
          </div>
          <div>
            <dt>
              <Kbd>?</Kbd>
            </dt>
            <dd>{t('layouts.staff.shortcutHelp')}</dd>
          </div>
        </dl>
      </Modal>
    </div>
  );
}
