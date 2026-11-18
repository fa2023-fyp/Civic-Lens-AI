import { Icon } from '../ui/Icon/Icon.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './AIBadge.css';

export function AIBadge({ label, size = 'md', className = '' }) {
  const { t } = useI18n();
  const text = label || t('ai.badge');

  return (
    <span className={`ai-badge ai-badge--${size}${className ? ` ${className}` : ''}`}>
      <Icon name="sparkles" size={size === 'sm' ? 12 : 14} className="ai-badge__icon" />
      <span className="ai-badge__text">{text}</span>
    </span>
  );
}
