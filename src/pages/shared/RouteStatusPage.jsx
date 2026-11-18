import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './RouteStatusPage.css';

function RouteStatusPage({ status }) {
  const { t } = useI18n();
  const title = t(`routes.${status}.title`);
  useDocumentTitle(`${title} · ${t('app.name')}`);

  return (
    <section className="route-status container" aria-labelledby="route-status-title">
      <svg className="route-status__illustration" viewBox="0 0 320 220" role="img" aria-label={title}>
        <circle cx="160" cy="110" r="82" fill="var(--brand-soft)" />
        <path d="M92 156V90l68-42 68 42v66l-68 42-68-42Z" fill="var(--surface)" stroke="var(--brand-strong)" strokeWidth="8" strokeLinejoin="round" />
        <path d="m124 110 24 24 48-54" fill="none" stroke="var(--brand-strong)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        {status === 'serverError' || status === 'offline' ? (
          <path d="M48 58c18-18 38-26 60-24M272 162c-18 18-38 26-60 24" fill="none" stroke="var(--amber-400)" strokeWidth="8" strokeLinecap="round" />
        ) : null}
      </svg>
      <p className="route-status__code" aria-hidden="true">
        {status === 'forbidden' ? '403' : status === 'serverError' ? '500' : status === 'offline' ? 'OFFLINE' : '404'}
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
        <Link to="/" className="route-status__link">{t('routes.returnHome')}</Link>
        {status === 'notFound' ? (
          <Link to="/help" className="route-status__link route-status__link--secondary">{t('common.navigation.help')}</Link>
        ) : status === 'forbidden' ? (
          <Link to="/help" className="route-status__link route-status__link--secondary">{t('common.navigation.help')}</Link>
        ) : (
          <button type="button" className="route-status__link route-status__link--secondary" onClick={() => window.location.reload()}>
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
