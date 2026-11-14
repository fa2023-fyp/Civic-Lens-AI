import { useI18n } from '../../../i18n/I18nContext.jsx';
import './TypingDots.css';

export function TypingDots({ label, className = '' }) {
  const { t } = useI18n();
  return (
    <span
      className={`ui-typing-dots${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="ui-typing-dots__label">{label || t('ui.aiAnalysing')}</span>
      <span className="ui-typing-dots__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
