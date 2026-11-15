import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function RouteErrorFallback({ referenceCode }) {
  const { t } = useI18n();
  const title = t('routes.error.title');
  useDocumentTitle(`${title} · ${t('app.name')}`, { restoreOnUnmount: false });

  return (
    <section className="route-status container" role="alert" aria-labelledby="route-error-title">
      <h1 id="route-error-title">{title}</h1>
      <p>{t('routes.error.body')}</p>
      <p>
        {t('routes.error.reference')} <code>{referenceCode}</code>
      </p>
    </section>
  );
}
