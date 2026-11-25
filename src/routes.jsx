import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/guards/ErrorBoundary.jsx';
import { RoleGuard } from './components/guards/RoleGuard.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { AuthLayout } from './components/layout/AuthLayout.jsx';
import { CitizenLayout } from './components/layout/CitizenLayout.jsx';
import { PublicLayout } from './components/layout/PublicLayout.jsx';
import { StaffLayout } from './components/layout/StaffLayout.jsx';
import { BrandLoader } from './components/ui/BrandLoader/BrandLoader.jsx';
import { TopLoadingBar } from './components/ui/TopLoadingBar/TopLoadingBar.jsx';
import { useDocumentTitle } from './hooks/useDocumentTitle.js';
import { useI18n } from './i18n/I18nContext.jsx';
import RouteErrorFallback from './pages/shared/RouteErrorFallback.jsx';
import LandingPage from './pages/public/Landing/LandingPage.jsx';
import './pages/shared/RouteStatusPage.css';

const RoutePlaceholder = lazy(() => import('./pages/shared/RoutePlaceholder.jsx'));
const PublicInfoPage = lazy(() => import('./pages/public/PublicInfoPage.jsx'));
const AboutPage = lazy(() => import('./pages/public/AboutPage.jsx'));
const ContactPage = lazy(() => import('./pages/public/ContactPage.jsx'));
const FeaturesPage = lazy(() => import('./pages/public/FeaturesPage.jsx'));
const HelpPage = lazy(() => import('./pages/public/HelpPage.jsx'));
const TechnologyPage = lazy(() => import('./pages/public/TechnologyPage.jsx'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage.jsx'));
const TransparencyPage = lazy(() => import('./pages/public/TransparencyPage.jsx'));
const CitizenDashboardPage = lazy(() => import('./pages/citizen/CitizenDashboardPage.jsx'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'));
const VerifyPage = lazy(() => import('./pages/auth/VerifyPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage.jsx'));
const ForbiddenPage = lazy(() =>
  import('./pages/shared/RouteStatusPage.jsx').then((module) => ({
    default: module.ForbiddenPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('./pages/shared/RouteStatusPage.jsx').then((module) => ({
    default: module.NotFoundPage,
  })),
);
const ServerErrorPage = lazy(() =>
  import('./pages/shared/RouteStatusPage.jsx').then((module) => ({
    default: module.ServerErrorPage,
  })),
);
const OfflinePage = lazy(() =>
  import('./pages/shared/RouteStatusPage.jsx').then((module) => ({
    default: module.OfflinePage,
  })),
);
const TokenPreview = lazy(() => import('./pages/dev/TokenPreview.jsx'));
const UIGallery = import.meta.env.DEV ? lazy(() => import('./pages/dev/UIGallery.jsx')) : null;

const routeEntries = [
  { path: '/', titleKey: 'routes.pages.home', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p0' },
  { path: '/about', titleKey: 'publicPages.about.title', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'about' },
  { path: '/features', titleKey: 'publicPages.features.title', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'features' },
  { path: '/technology', titleKey: 'publicPages.technology.title', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'technology' },
  { path: '/transparency', titleKey: 'publicPages.transparency.title', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'transparency' },
  { path: '/contact', titleKey: 'publicPages.contact.title', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'contact' },
  { path: '/login', titleKey: 'routes.pages.login', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p0', pageKey: 'login' },
  { path: '/register', titleKey: 'routes.pages.register', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p0', pageKey: 'register' },
  { path: '/verify', titleKey: 'routes.pages.verifyAccount', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p0', pageKey: 'verify' },
  { path: '/how-it-works', titleKey: 'routes.pages.howItWorks', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'howItWorks' },
  { path: '/ai-transparency', titleKey: 'routes.pages.aiTransparency', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1' },
  { path: '/help', titleKey: 'publicPages.help.title', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'help' },
  { path: '/forgot-password', titleKey: 'routes.pages.forgotPassword', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'forgotPassword' },
  { path: '/reset-password', titleKey: 'routes.pages.resetPassword', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'resetPassword' },
  { path: '/reset-password/:token', titleKey: 'routes.pages.resetPassword', roleKey: 'routes.roles.public', priorityKey: 'routes.priorities.p1', pageKey: 'resetPassword' },
  { path: '/citizen', titleKey: 'routes.pages.citizenDashboard', roleKey: 'routes.roles.citizen', priorityKey: 'routes.priorities.p1', roles: ['citizen'], pageKey: 'citizenDashboard' },
  { path: '/citizen/dashboard', titleKey: 'routes.pages.citizenDashboard', roleKey: 'routes.roles.citizen', priorityKey: 'routes.priorities.p1', roles: ['citizen'], pageKey: 'citizenDashboard' },
  { path: '/citizen/complaints', titleKey: 'routes.pages.citizenComplaints', roleKey: 'routes.roles.citizen', priorityKey: 'routes.priorities.p1', roles: ['citizen'] },
  { path: '/citizen/complaints/new', titleKey: 'routes.pages.newComplaint', roleKey: 'routes.roles.citizen', priorityKey: 'routes.priorities.p0', roles: ['citizen'] },
  { path: '/citizen/complaints/:complaintId', titleKey: 'routes.pages.citizenComplaintDetail', roleKey: 'routes.roles.citizen', priorityKey: 'routes.priorities.p1', roles: ['citizen'] },
  { path: '/citizen/complaints/:complaintId/verify', titleKey: 'routes.pages.verifyResolution', roleKey: 'routes.roles.citizen', priorityKey: 'routes.priorities.p1', roles: ['citizen'] },
  { path: '/citizen/alerts', titleKey: 'routes.pages.alerts', roleKey: 'routes.roles.citizen', priorityKey: 'routes.priorities.p1', roles: ['citizen'] },
  { path: '/citizen/profile', titleKey: 'routes.pages.profile', roleKey: 'routes.roles.citizen', priorityKey: 'routes.priorities.p1', roles: ['citizen'] },
  { path: '/officer/dashboard', titleKey: 'routes.pages.officerDashboard', roleKey: 'routes.roles.officer', priorityKey: 'routes.priorities.p1', roles: ['officer'] },
  { path: '/officer/assignments', titleKey: 'routes.pages.assignments', roleKey: 'routes.roles.officer', priorityKey: 'routes.priorities.p1', roles: ['officer'] },
  { path: '/officer/complaints/:complaintId', titleKey: 'routes.pages.officerComplaintDetail', roleKey: 'routes.roles.officer', priorityKey: 'routes.priorities.p1', roles: ['officer'] },
  { path: '/officer/complaints/:complaintId/resolve', titleKey: 'routes.pages.submitResolution', roleKey: 'routes.roles.officer', priorityKey: 'routes.priorities.p1', roles: ['officer'] },
  { path: '/supervisor/dashboard', titleKey: 'routes.pages.supervisorDashboard', roleKey: 'routes.roles.supervisor', priorityKey: 'routes.priorities.p1', roles: ['supervisor'] },
  { path: '/supervisor/analytics', titleKey: 'routes.pages.analytics', roleKey: 'routes.roles.supervisor', priorityKey: 'routes.priorities.p2', roles: ['supervisor'] },
  { path: '/supervisor/review-queue', titleKey: 'routes.pages.reviewQueue', roleKey: 'routes.roles.supervisor', priorityKey: 'routes.priorities.p1', roles: ['supervisor'] },
  { path: '/supervisor/escalations', titleKey: 'routes.pages.escalations', roleKey: 'routes.roles.supervisor', priorityKey: 'routes.priorities.p1', roles: ['supervisor'] },
  { path: '/supervisor/complaints/:complaintId', titleKey: 'routes.pages.supervisorComplaintDetail', roleKey: 'routes.roles.supervisor', priorityKey: 'routes.priorities.p1', roles: ['supervisor'] },
  { path: '/admin/dashboard', titleKey: 'routes.pages.adminDashboard', roleKey: 'routes.roles.admin', priorityKey: 'routes.priorities.p1', roles: ['admin'] },
  { path: '/admin/analytics', titleKey: 'routes.pages.analytics', roleKey: 'routes.roles.admin', priorityKey: 'routes.priorities.p2', roles: ['admin'] },
  { path: '/admin/users', titleKey: 'routes.pages.users', roleKey: 'routes.roles.admin', priorityKey: 'routes.priorities.p2', roles: ['admin'] },
  { path: '/admin/models', titleKey: 'routes.pages.models', roleKey: 'routes.roles.admin', priorityKey: 'routes.priorities.p2', roles: ['admin'] },
  { path: '/admin/audit', titleKey: 'routes.pages.audit', roleKey: 'routes.roles.admin', priorityKey: 'routes.priorities.p1', roles: ['admin'] },
  { path: '/admin/settings', titleKey: 'routes.pages.settings', roleKey: 'routes.roles.admin', priorityKey: 'routes.priorities.p2', roles: ['admin'] },
];

function LoadedRoute({ children, onLoaded }) {
  useEffect(() => onLoaded(), [onLoaded]);
  return children;
}

function RouteSuspenseFallback({ initialLoadComplete, onPendingChange }) {
  useEffect(() => {
    onPendingChange(true);
    return () => onPendingChange(false);
  }, [onPendingChange]);

  return initialLoadComplete ? <TopLoadingBar active /> : <BrandLoader />;
}

function renderPlaceholder(entry) {
  if (entry.path === '/') {
    return (
      <RouteDocumentTitle titleKey={entry.titleKey}>
        <LandingPage />
      </RouteDocumentTitle>
    );
  }

  if (entry.pageKey) {
    const content = (
      <RouteDocumentTitle titleKey={entry.titleKey}>
        {entry.pageKey === 'login' ? (
          <LoginPage />
        ) : entry.pageKey === 'register' ? (
          <RegisterPage />
        ) : entry.pageKey === 'verify' ? (
          <VerifyPage />
        ) : entry.pageKey === 'forgotPassword' ? (
          <ForgotPasswordPage />
        ) : entry.pageKey === 'resetPassword' ? (
          <ResetPasswordPage />
        ) : entry.pageKey === 'about' ? (
          <AboutPage />
        ) : entry.pageKey === 'contact' ? (
          <ContactPage />
        ) : entry.pageKey === 'help' ? (
          <HelpPage />
        ) : entry.pageKey === 'features' ? (
          <FeaturesPage />
        ) : entry.pageKey === 'technology' ? (
          <TechnologyPage />
        ) : entry.pageKey === 'howItWorks' ? (
          <HowItWorksPage />
        ) : entry.pageKey === 'transparency' ? (
          <TransparencyPage />
        ) : entry.pageKey === 'citizenDashboard' ? (
          <CitizenDashboardPage />
        ) : (
          <PublicInfoPage pageKey={entry.pageKey} />
        )}
      </RouteDocumentTitle>
    );
    return entry.roles ? (
      <RoleGuard roles={entry.roles} ownerId={entry.ownerId}>
        {content}
      </RoleGuard>
    ) : (
      content
    );
  }

  const page = (
    <RoutePlaceholder
      titleKey={entry.titleKey}
      roleKey={entry.roleKey}
      priorityKey={entry.priorityKey}
    />
  );
  return entry.roles ? (
    <RoleGuard roles={entry.roles} ownerId={entry.ownerId}>
      {page}
    </RoleGuard>
  ) : (
    page
  );
}

function RouteDocumentTitle({ titleKey, children }) {
  const { t } = useI18n();
  useDocumentTitle(`${t(titleKey)} · ${t('app.name')}`);
  return children;
}

function ScrollRestoration() {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.hash) {
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.hash]);

  return null;
}

export function RouteView() {
  const location = useLocation();
  const { t } = useI18n();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [suspenseLoading, setSuspenseLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine === false : false,
  );
  const previousPath = useRef(location.pathname);
  const markInitialLoadComplete = useCallback(() => setInitialLoadComplete(true), []);
  const markSuspensePending = useCallback((pending) => setSuspenseLoading(pending), []);
  const isPublicRoute = !/^\/(citizen|officer|supervisor|admin|dev)(\/|$)/.test(location.pathname);
  const firstPathSegment = location.pathname.split('/')[1];
  const isAuthRoute = /^\/(login|register|verify|forgot-password|reset-password)(\/|$)/.test(
    location.pathname,
  );
  const isStaffRoute = ['officer', 'supervisor', 'admin'].includes(firstPathSegment);

  useEffect(() => {
    if (previousPath.current === location.pathname) return undefined;
    previousPath.current = location.pathname;
    setRouteLoading(true);
    const timer = window.setTimeout(() => setRouteLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  const routeContent = (
    <>
      <TopLoadingBar active={routeLoading && !suspenseLoading} />
      <ErrorBoundary key={location.pathname} fallback={RouteErrorFallback}>
        <Suspense
          fallback={
            <RouteSuspenseFallback
              initialLoadComplete={initialLoadComplete}
              onPendingChange={markSuspensePending}
            />
          }
        >
          <LoadedRoute onLoaded={markInitialLoadComplete}>
            <div key={location.pathname} className="route-view anim-fade-up">
              <AppRoutes />
            </div>
          </LoadedRoute>
        </Suspense>
      </ErrorBoundary>
    </>
  );

  return (
    <>
      <ScrollRestoration />
      {isOffline ? (
        <div className="offline-notice" role="status" aria-live="polite">
          <strong>{t('routes.offline.bannerTitle')}</strong>
          <span>{t('routes.offline.bannerBody')}</span>
          <button type="button" onClick={() => window.location.reload()}>
            {t('common.retry')}
          </button>
        </div>
      ) : null}
      {isAuthRoute ? (
        <AuthLayout>{routeContent}</AuthLayout>
      ) : firstPathSegment === 'citizen' ? (
        <CitizenLayout>{routeContent}</CitizenLayout>
      ) : isStaffRoute ? (
        <StaffLayout role={firstPathSegment}>{routeContent}</StaffLayout>
      ) : isPublicRoute ? (
        <PublicLayout>{routeContent}</PublicLayout>
      ) : (
        <AppShell>{routeContent}</AppShell>
      )}
    </>
  );
}
export function AppRoutes() {
  return (
    <Routes>
      {routeEntries.map((entry) => (
        <Route key={entry.path} path={entry.path} element={renderPlaceholder(entry)} />
      ))}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/offline" element={<OfflinePage />} />
      <Route
        path="/dev/tokens"
        element={
          <RouteDocumentTitle titleKey="preview.title">
            <TokenPreview />
          </RouteDocumentTitle>
        }
      />
      {import.meta.env.DEV && UIGallery ? (
        <Route
          path="/dev/ui"
          element={
            <RouteDocumentTitle titleKey="gallery.title">
              <UIGallery />
            </RouteDocumentTitle>
          }
        />
      ) : null}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
