import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './RouteStatusPage.css';

export function StatusIcon({ status, title }) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={title} className="route-status__icon">
      {status === 'forbidden' ? (
        <>
          <path d="M24 10c-7.7 0-14 6.3-14 14v8c0 5.4 4.6 10 10 10h8c5.4 0 10-4.6 10-10v-8c0-7.7-6.3-14-14-14Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 24h16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : status === 'notFound' ? (
        <>
          <path d="M10 10h18v18H10Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M28 10v18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 16h8M14 22h6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {status === 'serverError' ? (
            <>
              <path d="M24 20v4M24 32h0.1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : (
            <path d="M12 12 36 36M36 12 12 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </>
      )}
    </svg>
  );
}

function routeStatusCode(status) {
  if (status === 'forbidden') {
    return '403';
  }
  if (status === 'serverError') {
    return '500';
  }
  if (status === 'offline') {
    return 'OFFLINE';
  }
  return '404';
}

function RouteStatusPage({ status }) {
  const { t } = useI18n();
  const title = t(`routes.${status}.title`);
  useDocumentTitle(`${title} · ${t('app.name')}`);

  return (
    <section className="route-status" aria-labelledby="route-status-title">
      <StatusIcon status={status} title={title} />
      <p className="route-status__code" aria-hidden="true">
        {routeStatusCode(status)}
      </p>
      <div className="route-status__copy">
        <h1 id="route-status-title">{title}</h1>
        <p>{t(`routes.${status}.body`)}</p>
        {status === 'serverError' ? (
          <p className="route-status__reference">
            {t('routes.error.reference')} <code>{t('routes.serverError.referenceCode')}</code>
          </p>
        ) : null}
      </div>
      <div className="route-status__actions">
        <Link to="/" className="button button--cta">
          {t('routes.returnHome')}
        </Link>
        {status === 'notFound' || status === 'forbidden' ? (
          <Link to="/help">{t('common.navigation.help')}</Link>
        ) : (
          <button type="button" className="button button--quiet" onClick={() => window.location.reload()}>
            {t('common.retry')}
          </button>
        )}
      </div>
    </section>
  );
}

export function ForbiddenPage() {
  return <RouteStatusPage status="forbidden" />;
}

export function NotFoundPage() {
  return <RouteStatusPage status="notFound" />;
}

export function ServerErrorPage() {
  return <RouteStatusPage status="serverError" />;
}

export function OfflinePage() {
  return <RouteStatusPage status="offline" />;
}
