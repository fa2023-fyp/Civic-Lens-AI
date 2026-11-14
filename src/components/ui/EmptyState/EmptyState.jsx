import { useI18n } from '../../../i18n/I18nContext.jsx';
import './EmptyState.css';

export function EmptyState({ title, text, action, illustration, className = '' }) {
  const { t } = useI18n();
  return (
    <section className={`ui-empty-state${className ? ` ${className}` : ''}`}>
      {illustration || (
        <svg className="ui-empty-state__illustration" viewBox="0 0 96 72" aria-hidden="true">
          <path d="M12 56h72M20 50l10-17 10 10 13-22 23 29" />
          <circle cx="66" cy="19" r="7" />
          <path d="M31 55v-9m25 9v-6m14 6V43" />
        </svg>
      )}
      <h2>{title || t('ui.emptyTitle')}</h2>
      <p>{text || t('ui.emptyText')}</p>
      {action || null}
    </section>
  );
}
