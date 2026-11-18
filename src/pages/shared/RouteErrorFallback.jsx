import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { Link } from 'react-router-dom';
import './RouteStatusPage.css';

export default function RouteErrorFallback({ referenceCode }) {
  const { t } = useI18n();
  const title = t('routes.error.title');
  useDocumentTitle(`${title} · ${t('app.name')}`, { restoreOnUnmount: false });

  return (
    <section className="route-status container" role="alert" aria-labelledby="route-error-title">
      <svg className="route-status__illustration" viewBox="0 0 320 220" role="img" aria-label={title}>
        <circle cx="160" cy="110" r="82" fill="var(--brand-soft)" />
        <path d="M92 156V90l68-42 68 42v66l-68 42-68-42Z" fill="var(--surface)" stroke="var(--brand-strong)" strokeWidth="8" strokeLinejoin="round" />
        <path d="M132 106h56M160 78v56" fill="none" stroke="var(--amber-400)" strokeWidth="10" strokeLinecap="round" />
      </svg>
      <p className="route-status__code" aria-hidden="true">500</p>
      <div className="route-status__copy">
        <h1 id="route-error-title">{title}</h1>
        <p>{t('routes.error.body')}</p>
        <p className="route-status__reference">
          {t('routes.error.reference')} <code>{referenceCode || t('routes.serverError.referenceCode')}</code>
        </p>
      </div>
      <div className="route-status__actions">
        <Link to="/" className="route-status__link">{t('routes.returnHome')}</Link>
        <button type="button" className="route-status__link route-status__link--secondary" onClick={() => window.location.reload()}>
          {t('common.retry')}
        </button>
      </div>
    </section>
  );
}
