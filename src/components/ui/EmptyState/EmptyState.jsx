import { useI18n } from '../../../i18n/I18nContext.jsx';
import { Icon } from '../Icon/Icon.jsx';
import './EmptyState.css';

export function EmptyState({ title, text, action, className = '' }) {
  const { t } = useI18n();
  return (
    <section className={`ui-empty-state${className ? ` ${className}` : ''}`}>
      <Icon name="inbox" size={24} aria-hidden="true" />
      <h2>{title || t('ui.emptyTitle')}</h2>
      <p>{text || t('ui.emptyText')}</p>
      {action || null}
    </section>
  );
}
