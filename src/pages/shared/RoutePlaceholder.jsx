import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './RoutePlaceholder.css';

export default function RoutePlaceholder({ titleKey, roleKey, priorityKey }) {
  const { t } = useI18n();
  const title = t(titleKey);
  useDocumentTitle(`${title} · ${t('app.name')}`);

  return (
    <article className="route-placeholder container">
      <p className="eyebrow">{t('routes.placeholderKicker')}</p>
      <h1>{title}</h1>
      <p className="route-placeholder__lead">{t('routes.placeholderBody')}</p>
      <dl className="route-placeholder__meta">
        <div>
          <dt>{t('routes.roleLabel')}</dt>
          <dd>{t(roleKey)}</dd>
        </div>
        <div>
          <dt>{t('routes.priorityLabel')}</dt>
          <dd>{t(priorityKey)}</dd>
        </div>
      </dl>
      <Link to="/" className="route-placeholder__home">
        {t('routes.returnHome')}
      </Link>
    </article>
  );
}
