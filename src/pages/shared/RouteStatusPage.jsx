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
      <p className="route-status__code" aria-hidden="true">
        {status === 'forbidden' ? '403' : '404'}
      </p>
      <h1 id="route-status-title">{title}</h1>
      <p>{t(`routes.${status}.body`)}</p>
      <Link to="/" className="route-status__link">
        {t('routes.returnHome')}
      </Link>
    </section>
  );
}

export function ForbiddenPage() {
  return <RouteStatusPage status="forbidden" />;
}

export function NotFoundPage() {
  return <RouteStatusPage status="notFound" />;
}
