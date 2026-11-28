import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { Link } from 'react-router-dom';
import { StatusIcon } from './RouteStatusPage.jsx';
import './RouteStatusPage.css';

export default function RouteErrorFallback({ referenceCode }) {
  const { t } = useI18n();
  const title = t('routes.error.title');
  useDocumentTitle(`${title} · ${t('app.name')}`, { restoreOnUnmount: false });

  return (
    <section className="route-status" role="alert" aria-labelledby="route-error-title">
      <StatusIcon status="serverError" title={title} />
      <p className="route-status__code" aria-hidden="true">
        500
      </p>
      <div className="route-status__copy">
        <h1 id="route-error-title">{title}</h1>
        <p>{t('routes.error.body')}</p>
        <p className="route-status__reference">
          {t('routes.error.reference')} <code>{referenceCode || t('routes.serverError.referenceCode')}</code>
        </p>
      </div>
      <div className="route-status__actions">
        <Link to="/" className="button button--cta">
          {t('routes.returnHome')}
        </Link>
        <button type="button" className="button button--quiet" onClick={() => window.location.reload()}>
          {t('common.retry')}
        </button>
      </div>
    </section>
  );
}
